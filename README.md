# Solana Copilot

Ledger-powered AI interface for Solana.

## Demo

🎥 Demo Video: [Link](https://x.com/prajwalrajjj/status/2064341599749030102)

---

## Overview

Solana Copilot is a conversational interface for Solana that allows users to interact with the blockchain using natural language.

Instead of navigating multiple wallets, explorers, and applications, users can simply describe what they want to do.

Examples:

```text
Get my address

Check my balance

Send 0.1 SOL to <address>

Create token LEDGTEST

Create token LEDGTEST supply 1000000 decimals 9
```

Solana Copilot interprets the request, builds the required Solana transaction, and routes signing through Ledger's approval workflow.

The key idea is simple:

**The application can prepare transactions.**

**Ledger authorizes them.**

---

# Why Solana Copilot?

AI agents are becoming increasingly capable of interacting with blockchains.

They can:

* Analyze information
* Generate transactions
* Execute workflows
* Move assets

However, many systems still rely on software-managed secrets such as:

* Environment variables
* Local private key files
* Cloud-hosted credentials

When real assets are involved, this creates additional risk.

Solana Copilot explores a different model:

The application helps users interact with Solana, while transaction authorization remains separate from the application itself.

---

# The Problem

Traditional AI-powered crypto applications often look like this:

```text
User
 ↓
Application
 ↓
Private Key
 ↓
Blockchain
```

The same system that prepares actions also controls the authority required to execute them.

This creates unnecessary risk.

---

# The Ledger Agent Stack

Ledger recently introduced an open-source Agent Stack designed for agent-driven and AI-powered applications.

The stack includes:

### DMK Skills

A toolkit that allows applications and agents to communicate with Ledger devices.

Supports:

* Ethereum
* Bitcoin
* Solana
* Cosmos
* FIDO2 workflows

### Ledger Wallet CLI

An agent-oriented transaction execution layer.

```text
Agent
 ↓
Prepare Transaction
 ↓
User Reviews
 ↓
Ledger Signs
 ↓
Broadcast
```

### Ledger Enterprise CLI

Enterprise-grade signing workflows with policy enforcement and HSM-backed controls.

### Ledger Multisig CLI

Tools for treasury operations, payroll systems, scheduled transfers, and multisig workflows.

Across all components, the core principle remains the same:

**Transaction preparation and transaction authorization remain separate.**

---

# How Solana Copilot Uses Ledger

This project uses Ledger's signing workflow together with Speculos, Ledger's open-source device emulator.

Architecture:

```text
User
 ↓
Solana Copilot
 ↓
Intent Parsing
 ↓
Transaction Builder
 ↓
Ledger Signing Flow
 ↓
Speculos
 ↓
Solana Devnet
```

The application provides the user experience.

Ledger provides the transaction authorization layer.

Private keys never enter the application logic.

---

# Features

## Natural Language Interface

Examples:

```text
Get my address

Check my balance

Send 0.1 SOL to <address>

Create token LEDGTEST

Create token LEDGTEST supply 1000000 decimals 9
```

---

## Address & Balance Lookup

Users can retrieve:

* Wallet address
* SOL balance

directly from chat.

---

## SOL Transfers

Example:

```text
Send 0.1 SOL to 9mSSAxDAcHgR2mAu39Xw9pn7yjB2xHRsiV16bnUSWfcK
```

Flow:

```text
User Request
      ↓
Transaction Creation
      ↓
Ledger Review
      ↓
Speculos Approval
      ↓
Broadcast
      ↓
Confirmation
```

---

## SPL Token Creation

Example:

```text
Create token LEDGTEST supply 1000000 decimals 9
```

Flow:

```text
User Request
      ↓
Mint Creation
      ↓
Token Account Creation
      ↓
Ledger Review
      ↓
Speculos Approval
      ↓
Broadcast
      ↓
Token Created
```

The created token is a standard SPL Token deployed on Solana Devnet.

---

## Ledger Approval Workflow

Before execution:

* Transaction details are displayed
* Amounts are reviewed
* Recipients are reviewed
* Token parameters are reviewed
* Ledger approval is required

Transactions cannot be executed without approval.

---

# Technology Stack

## Frontend

* React
* TypeScript
* Tailwind CSS

## Backend

* Node.js
* Express

## Blockchain

* Solana
* @solana/web3.js
* @solana/spl-token

## Security Layer

* Ledger Agent Stack
* Speculos Emulator

---

# Security Model

The application is responsible for:

* Understanding user intent
* Building transactions
* Generating transaction summaries

The application is NOT responsible for:

* Storing private keys
* Signing transactions
* Authorizing transfers

Transaction authorization remains outside the application.

---

# Example Workflow

### Send SOL

```text
Send 0.1 SOL to <address>
```

```text
User
 ↓
Intent Parsed
 ↓
Transaction Built
 ↓
Review in Speculos
 ↓
Approve
 ↓
Signed
 ↓
Broadcast
 ↓
Confirmed
```

### Create Token

```text
Create token LEDGTEST supply 1000000 decimals 9
```

```text
User
 ↓
Token Transaction Built
 ↓
Review in Speculos
 ↓
Approve
 ↓
Signed
 ↓
Broadcast
 ↓
Mint Created
```

---

# Screenshots

Add screenshots here:

* Solana Copilot Interface
* Wallet Address Lookup
* Balance Query
* SOL Transfer Review
* Speculos Approval Screen
* Token Creation Flow
* Successful Transaction Confirmation

---

# Acknowledgements

Built using:

* Solana
* Ledger Agent Stack
* Ledger Wallet CLI
* Speculos
* React
* TypeScript

Special thanks to Ledger for open-sourcing tools that enable secure transaction workflows for AI-powered applications.
