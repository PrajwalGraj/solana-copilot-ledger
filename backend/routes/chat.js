import { promises as fs } from "fs";
import path from "path";
import { Router } from "express";
import { ledgerService } from "../services/ledgerService.js";
import { parseCommand } from "../services/parserService.js";
import { createTokenTransaction } from "../services/tokenService.js";
import { solanaService } from "../services/solanaService.js";
import { logger } from "../utils/logger.js";

const router = Router();
const stateFile = path.join(process.cwd(), "backend", "local-state.json");

function defaultState() {
  return {
    wallet: {
      ledgerAddress: null,
      devnetBalanceSol: null,
      lastTransaction: null,
      connectionStatus: "Disconnected",
    },
    transactions: [],
    chats: [],
  };
}

async function loadState() {
  try {
    const raw = await fs.readFile(stateFile, "utf8");
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

async function saveState(state) {
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
}

function writeEvent(response, payload) {
  response.write(`${JSON.stringify(payload)}\n`);
}

function beginStream(response) {
  response.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  response.setHeader("Cache-Control", "no-cache, no-transform");
  response.setHeader("Connection", "keep-alive");
  response.flushHeaders?.();
}

function chatIcon(type) {
  if (type === "get_address") return "Wallet";
  if (type === "check_balance") return "BadgeDollarSign";
  if (type === "create_token") return "Coins";
  return "Send";
}

function buildChatSummary(message, type) {
  return {
    id: `chat-${Date.now()}`,
    title: message,
    icon: chatIcon(type),
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function buildWalletStatePayload(state, lastSignature = null, error = null) {
  return {
    type: "wallet_state",
    wallet: state.wallet,
    recentTransactions: state.transactions,
    chats: state.chats,
    ledger: {
      connected: state.wallet.connectionStatus === "Connected",
      error,
      lastSignature,
    },
  };
}

function buildSummary({ amount, recipient, feeSol }) {
  return {
    title: "SOL Transfer",
    description: "Review the transaction on Ledger Speculos before it is signed.",
    amount: `${amount} SOL`,
    recipient,
    network: "Solana Devnet",
    estimatedFee: `${feeSol} SOL`,
  };
}

function buildTokenHistoryItem({ signature, symbol, mintAddress }) {
  return {
    id: signature,
    kind: "token_creation",
    primary: "Token Created",
    secondary: `${symbol} • ${mintAddress}`,
    timestamp: new Date().toLocaleString(),
    signature,
    symbol,
    mintAddress,
    explorerUrl: `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`,
  };
}

function buildTokenTransactionPayload({
  signature,
  owner,
  mintAddress,
  tokenAccountAddress,
  name,
  symbol,
  decimals,
  supply,
  feeSol,
}) {
  return {
    id: signature,
    kind: "token_creation",
    title: "Token Creation Preview",
    fromLabel: "Owner",
    fromAddress: owner,
    toLabel: "Mint Address",
    toAddress: mintAddress,
    tokenAccountAddress,
    mintAddress,
    name,
    symbol,
    decimals,
    supply,
    amount: supply,
    token: symbol,
    network: "Solana Devnet",
    feeSol,
    status: "confirmed",
    signature,
    timestamp: new Date().toISOString(),
  };
}

router.get("/state", async (_request, response) => {
  const state = await loadState();
  response.json({
    wallet: state.wallet,
    recentTransactions: state.transactions,
    chats: state.chats,
    ledger: {
      connected: state.wallet.connectionStatus === "Connected",
      error: null,
      lastSignature: state.wallet.lastTransaction,
    },
  });
});

router.post("/connect", async (_request, response) => {
  try {
    const state = await loadState();
    state.wallet.ledgerAddress = await ledgerService.getAddress();
    state.wallet.connectionStatus = "Connected";
    await saveState(state);
    response.json({ connected: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to connect";
    response.status(500).json({ error: message });
  }
});

router.post("/disconnect", async (_request, response) => {
  const state = await loadState();
  state.wallet.connectionStatus = "Disconnected";
  await saveState(state);
  response.json({ connected: false });
});

router.post("/", async (request, response) => {
  const { message = "" } = request.body ?? {};
  const parsed = parseCommand(message);
  const state = await loadState();

  beginStream(response);

  const fail = async (error) => {
    const humanMessage = error instanceof Error ? error.message : "Request failed.";
    logger.error("chat route error", humanMessage);
    writeEvent(response, {
      type: "error",
      message: humanMessage,
      ledger: {
        connected: state.wallet.connectionStatus === "Connected",
        error: humanMessage,
        lastSignature: state.wallet.lastTransaction,
      },
    });
    response.end();
  };

  try {
    if (parsed.type === "unsupported") {
      throw new Error(
        "Supported commands: `get my address`, `check my balance`, `send X sol to ADDRESS`, and `create token ...`.",
      );
    }

    if (parsed.type === "invalid") {
      throw new Error(parsed.message);
    }

    state.chats = [buildChatSummary(message, parsed.type), ...state.chats].slice(0, 20);
    await saveState(state);

    if (parsed.type === "get_address") {
      writeEvent(response, { type: "status", message: "Connecting to Ledger..." });
      const address = await ledgerService.getAddress();
      state.wallet.ledgerAddress = address;
      state.wallet.connectionStatus = "Connected";
      await saveState(state);

      writeEvent(response, { type: "address", address });
      writeEvent(response, buildWalletStatePayload(state, state.wallet.lastTransaction));
      response.end();
      return;
    }

    if (parsed.type === "check_balance") {
      writeEvent(response, { type: "status", message: "Connecting to Ledger..." });
      const address = await ledgerService.getAddress();
      const balanceSol = await solanaService.getBalance(address);

      state.wallet.ledgerAddress = address;
      state.wallet.devnetBalanceSol = balanceSol;
      state.wallet.connectionStatus = "Connected";
      await saveState(state);

      writeEvent(response, { type: "balance", address, balanceSol });
      writeEvent(response, buildWalletStatePayload(state, state.wallet.lastTransaction));
      response.end();
      return;
    }

    if (parsed.type === "create_token") {
      writeEvent(response, { type: "status", message: "Connecting to Ledger..." });
      const owner = await ledgerService.getAddress();

      writeEvent(response, { type: "status", message: "Building token transaction..." });
      writeEvent(response, { type: "status", message: "Preparing mint account..." });
      const built = await createTokenTransaction({
        owner,
        name: parsed.name,
        symbol: parsed.symbol,
        decimals: parsed.decimals,
        supply: parsed.supply,
      });

      const summary = built.summary;

      logger.info("Preparing Ledger token creation", {
        transactionType: "token-creation",
        name: parsed.name,
        symbol: parsed.symbol,
        decimals: parsed.decimals,
        supply: parsed.supply,
      });

      state.wallet.ledgerAddress = owner;
      state.wallet.connectionStatus = "Connected";
      await saveState(state);

      writeEvent(response, {
        type: "transaction_prepared",
        summary,
        transaction: buildTokenTransactionPayload({
          signature: `tx-${Date.now()}`,
          owner,
          mintAddress: built.mintAddress,
          tokenAccountAddress: built.tokenAccountAddress,
          name: parsed.name,
          symbol: parsed.symbol,
          decimals: parsed.decimals,
          supply: parsed.supply,
          feeSol: built.feeSol,
        }),
      });

      writeEvent(response, { type: "status", message: "Waiting for approval on Ledger..." });
      const signatureBuffer = await ledgerService.signTransaction(built.transaction.serializeMessage(), {
        transactionType: "token-creation",
      });

      writeEvent(response, { type: "status", message: "Transaction signed..." });
      built.transaction.addSignature(built.transaction.feePayer, signatureBuffer);

      writeEvent(response, { type: "status", message: "Broadcasting..." });
      const result = await solanaService.broadcastSignedTransaction(built.transaction);

      state.wallet.ledgerAddress = owner;
      state.wallet.lastTransaction = result.signature;
      state.wallet.connectionStatus = "Connected";
      state.transactions = [buildTokenHistoryItem({
        signature: result.signature,
        symbol: parsed.symbol,
        mintAddress: built.mintAddress,
      }), ...state.transactions].slice(0, 20);
      await saveState(state);

      writeEvent(response, { type: "status", message: "Token Created Successfully" });
      writeEvent(response, {
        type: "transaction_result",
        summary,
        signature: result.signature,
        explorerUrl: `https://explorer.solana.com/address/${built.mintAddress}?cluster=devnet`,
        transaction: buildTokenTransactionPayload({
          signature: result.signature,
          owner,
          mintAddress: built.mintAddress,
          tokenAccountAddress: built.tokenAccountAddress,
          name: parsed.name,
          symbol: parsed.symbol,
          decimals: parsed.decimals,
          supply: parsed.supply,
          feeSol: built.feeSol,
        }),
      });
      writeEvent(response, buildWalletStatePayload(state, result.signature));
      response.end();
      return;
    }

    solanaService.validateAmount(parsed.amount);
    solanaService.validateAddress(parsed.recipient);

    writeEvent(response, { type: "status", message: "Connecting to Ledger..." });
    const sender = await ledgerService.getAddress();

    writeEvent(response, { type: "status", message: "Building transaction..." });
    const built = await solanaService.buildTransferTransaction({
      fromAddress: sender,
      recipient: parsed.recipient,
      amountSol: parsed.amount,
    });

    const summary = buildSummary({
      amount: parsed.amount,
      recipient: parsed.recipient,
      feeSol: built.feeSol,
    });
    logger.info("Preparing Ledger transfer", {
      transactionType: "legacy-transfer",
      recipient: parsed.recipient,
      amountSol: parsed.amount,
    });

    state.wallet.ledgerAddress = sender;
    state.wallet.connectionStatus = "Connected";
    await saveState(state);

    writeEvent(response, {
      type: "transaction_prepared",
      summary,
      transaction: {
        id: `tx-${Date.now()}`,
        amount: parsed.amount,
        recipient: parsed.recipient,
        sender,
        network: "Solana Devnet",
        feeSol: built.feeSol,
        status: "awaiting",
      },
    });

    writeEvent(response, { type: "status", message: "Waiting for approval on Ledger..." });
    const signatureBuffer = await ledgerService.signTransaction(
      built.transaction.serializeMessage(),
      { transactionType: "legacy-transfer" },
    );

    writeEvent(response, { type: "status", message: "Transaction signed..." });
    built.transaction.addSignature(built.transaction.feePayer, signatureBuffer);

    writeEvent(response, { type: "status", message: "Broadcasting..." });
    const result = await solanaService.broadcastSignedTransaction(built.transaction);
    const balanceSol = await solanaService.getBalance(sender);

    state.wallet.ledgerAddress = sender;
    state.wallet.devnetBalanceSol = balanceSol;
    state.wallet.lastTransaction = result.signature;
    state.wallet.connectionStatus = "Connected";
    state.transactions = [
      {
        id: result.signature,
        kind: "send",
        primary: `-${parsed.amount} SOL`,
        secondary: parsed.recipient,
        timestamp: new Date().toLocaleString(),
        signature: result.signature,
      },
      ...state.transactions,
    ].slice(0, 20);
    await saveState(state);

    writeEvent(response, { type: "status", message: "Confirmed..." });
    writeEvent(response, {
      type: "transaction_result",
      summary,
      signature: result.signature,
      explorerUrl: result.explorerUrl,
      transaction: {
        id: result.signature,
        amount: parsed.amount,
        recipient: parsed.recipient,
        sender,
        network: "Solana Devnet",
        feeSol: built.feeSol,
        status: "confirmed",
        signature: result.signature,
      },
    });
    writeEvent(response, buildWalletStatePayload(state, result.signature));
    response.end();
  } catch (error) {
    await fail(error);
  }
});

export default router;
