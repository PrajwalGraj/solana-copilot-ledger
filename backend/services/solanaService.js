import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { logger } from "../utils/logger.js";

class SolanaService {
  constructor() {
    this.connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  }

  validateAddress(address) {
    try {
      return new PublicKey(address);
    } catch {
      throw new Error("Invalid Solana address.");
    }
  }

  validateAmount(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid amount. Use a positive SOL value.");
    }
  }

  async getBalance(address) {
    const publicKey = this.validateAddress(address);
    const lamports = await this.connection.getBalance(publicKey, "confirmed");
    return lamports / LAMPORTS_PER_SOL;
  }

  async buildTransferTransaction({ fromAddress, recipient, amountSol }) {
    this.validateAmount(amountSol);

    const fromPubkey = this.validateAddress(fromAddress);
    const toPubkey = this.validateAddress(recipient);
    const latestBlockhash = await this.connection.getLatestBlockhash("confirmed");

    const transaction = new Transaction({
      feePayer: fromPubkey,
      recentBlockhash: latestBlockhash.blockhash,
    }).add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
      }),
    );
    transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

    const feeResponse = await this.connection.getFeeForMessage(
      transaction.compileMessage(),
      "confirmed",
    );

    return {
      transaction,
      sender: fromPubkey.toBase58(),
      recipient: toPubkey.toBase58(),
      feeSol: (feeResponse.value ?? 5000) / LAMPORTS_PER_SOL,
      amountSol,
    };
  }

  async broadcastSignedTransaction(transaction) {
    const rawTransaction = transaction.serialize();
    const signature = await this.connection.sendRawTransaction(rawTransaction, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    const confirmation = await this.connection.confirmTransaction(
      {
        signature,
        blockhash: transaction.recentBlockhash,
        lastValidBlockHeight: transaction.lastValidBlockHeight,
      },
      "confirmed",
    );

    if (confirmation.value.err) {
      throw new Error(`Broadcast failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    return {
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    };
  }
}

export const solanaService = new SolanaService();
