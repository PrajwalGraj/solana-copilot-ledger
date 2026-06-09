import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { solanaService } from "./solanaService.js";

function normalizeTokenCreationInput(input) {
  const symbol = String(input.symbol ?? "").trim().toUpperCase();
  const name = String(input.name ?? symbol).trim();
  const decimals = Number(input.decimals);
  const supply = Number(input.supply);

  const errors = [];

  if (!name) errors.push("Name is required.");
  if (name.length > 32) errors.push("Name must be 32 characters or fewer.");
  if (symbol.length < 2) errors.push("Symbol must be at least 2 characters.");
  if (symbol.length > 10) errors.push("Symbol must be 10 characters or fewer.");
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 9) {
    errors.push("Decimals must be an integer from 0 to 9.");
  }
  if (!Number.isInteger(supply) || supply <= 0) {
    errors.push("Supply must be a positive integer.");
  }

  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }

  return { name, symbol, decimals, supply };
}

export function buildTokenCreationSummary({
  name,
  symbol,
  decimals,
  supply,
  owner,
  mintAddress,
  tokenAccountAddress,
  feeSol,
}) {
  return {
    title: "Token Creation",
    description: "Create a standard SPL token and mint the initial supply on Solana Devnet.",
    amount: `${supply.toLocaleString()} ${symbol}`,
    recipient: mintAddress,
    network: "Solana Devnet",
    estimatedFee: `${feeSol} SOL`,
    details: [
      { label: "Name", value: name },
      { label: "Symbol", value: symbol },
      { label: "Decimals", value: String(decimals) },
      { label: "Supply", value: supply.toLocaleString() },
      { label: "Owner", value: owner },
      { label: "Mint Address", value: mintAddress },
      { label: "Token Account", value: tokenAccountAddress },
      { label: "Estimated Fee", value: `${feeSol} SOL` },
      { label: "Network", value: "Solana Devnet" },
    ],
  };
}

export async function createTokenTransaction(input) {
  const { name, symbol, decimals, supply } = normalizeTokenCreationInput(input);
  const owner = new PublicKey(input.owner);
  const mintKeypair = Keypair.generate();

  const tokenAccountAddress = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    owner,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const rentExemption = await solanaService.connection.getMinimumBalanceForRentExemption(
    MINT_SIZE,
  );
  const latestBlockhash = await solanaService.connection.getLatestBlockhash("confirmed");

  const actualSupply = BigInt(supply) * BigInt(10 ** decimals);
  const transaction = new Transaction({
    feePayer: owner,
    recentBlockhash: latestBlockhash.blockhash,
  });

  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: owner,
      newAccountPubkey: mintKeypair.publicKey,
      lamports: rentExemption,
      space: MINT_SIZE,
      programId: TOKEN_PROGRAM_ID,
    }),
  );

  transaction.add(
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      decimals,
      owner,
      owner,
      TOKEN_PROGRAM_ID,
    ),
  );

  transaction.add(
    createAssociatedTokenAccountInstruction(
      owner,
      tokenAccountAddress,
      owner,
      mintKeypair.publicKey,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
  );

  transaction.add(
    createMintToInstruction(
      mintKeypair.publicKey,
      tokenAccountAddress,
      owner,
      actualSupply,
      [],
      TOKEN_PROGRAM_ID,
    ),
  );

  transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
  transaction.partialSign(mintKeypair);

  const feeResponse = await solanaService.connection.getFeeForMessage(
    transaction.compileMessage(),
    "confirmed",
  );

  const feeLamports = feeResponse.value ?? 5000;
  const feeSolNumber = Number((feeLamports / 1_000_000_000).toFixed(9));
  const feeSolDisplay = String(feeSolNumber);

  return {
    transaction,
    mintAddress: mintKeypair.publicKey.toBase58(),
    tokenAccountAddress: tokenAccountAddress.toBase58(),
    summary: buildTokenCreationSummary({
      name,
      symbol,
      decimals,
      supply,
      owner: owner.toBase58(),
      mintAddress: mintKeypair.publicKey.toBase58(),
      tokenAccountAddress: tokenAccountAddress.toBase58(),
      feeSol: feeSolDisplay,
    }),
    feeSol: feeSolNumber,
    name,
    symbol,
    decimals,
    supply,
    actualSupply: actualSupply.toString(),
  };
}