import { createRequire } from "module";
import { PublicKey } from "@solana/web3.js";
import { logger } from "../utils/logger.js";

const require = createRequire(import.meta.url);
const SolanaApp = require("@ledgerhq/hw-app-solana").default;
const SpeculosTransport = require("@ledgerhq/hw-transport-node-speculos").default;

const SPECULOS_HOST = process.env.SPECULOS_HOST || "127.0.0.1";
const SPECULOS_APDU_PORT = Number(process.env.SPECULOS_APDU_PORT || 9999);
const DERIVATION_PATH = "44'/501'/0'/0'";

function normalizeAddressResponse(response) {
  if (typeof response?.address === "string") {
    return response.address;
  }

  if (response?.publicKey) {
    return new PublicKey(response.publicKey).toBase58();
  }

  if (response?.address) {
    return new PublicKey(response.address).toBase58();
  }

  throw new Error("Ledger did not return a valid Solana address.");
}

function normalizeSignatureResponse(response) {
  if (response?.signature) {
    return Buffer.from(response.signature);
  }

  if (Buffer.isBuffer(response)) {
    return response;
  }

  throw new Error("Ledger did not return a valid signature.");
}

class LedgerService {
  async connect() {
    const transport = await SpeculosTransport.open({
      apduPort: SPECULOS_APDU_PORT,
      host: SPECULOS_HOST,
    });

    const app = new SolanaApp(transport);

    return {
      app,
      transport,
    };
  }

  async disconnect(transport) {
    if (transport) {
      await transport.close();
    }
  }

  async getAddress() {
    const { app, transport } = await this.connect();

    try {
      const response = await app.getAddress(DERIVATION_PATH, false);
      return normalizeAddressResponse(response);
    } catch (error) {
      throw this.mapLedgerError(error);
    } finally {
      await this.disconnect(transport);
    }
  }

  async signTransaction(serializedMessage, context = {}) {
    const { app, transport } = await this.connect();

    try {
      logger.info("Ledger signing request start", {
        transactionType: context.transactionType ?? "unknown",
        serializeMessageLength: serializedMessage.length,
        derivationPath: DERIVATION_PATH,
      });
      const response = await app.signTransaction(DERIVATION_PATH, serializedMessage);
      const signature = normalizeSignatureResponse(response);
      logger.info("Ledger signing request success", {
        transactionType: context.transactionType ?? "unknown",
        serializeMessageLength: serializedMessage.length,
        derivationPath: DERIVATION_PATH,
      });
      return signature;
    } catch (error) {
      logger.error("Ledger signing request failure", {
        transactionType: context.transactionType ?? "unknown",
        serializeMessageLength: serializedMessage.length,
        derivationPath: DERIVATION_PATH,
        error: error instanceof Error ? error.message : String(error),
      });
      throw this.mapLedgerError(error);
    } finally {
      await this.disconnect(transport);
    }
  }

  mapLedgerError(error) {
    const message = error instanceof Error ? error.message : "Unknown Ledger error";
    const normalized = message.toLowerCase();

    if (normalized.includes("econnrefused") || normalized.includes("timeout")) {
      return new Error("Speculos is offline or unreachable on 127.0.0.1:9999.");
    }

    if (normalized.includes("0x6985") || normalized.includes("rejected")) {
      return new Error("Signing was rejected on Ledger.");
    }

    return new Error(`Ledger request failed: ${message}`);
  }
}

export const ledgerService = new LedgerService();
