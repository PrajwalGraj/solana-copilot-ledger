# Solana Copilot

**Ledger Wallet CLI-powered AI interface for Solana.**

Demo Video: [Link](https://x.com/prajwalrajjj/status/2064341599749030102)

Solana Copilot is a conversational interface for Solana that allows users to interact with the blockchain using natural language.

Instead of navigating wallets, explorers, and multiple applications, users can simply describe what they want to do. Solana Copilot interprets the request, prepares the required transaction flow, and routes execution through Ledger's signing workflow.

The goal is to make blockchain interactions more intuitive while keeping transaction authorization separate from the application itself.

---

## Why Solana Copilot?

AI agents and applications are becoming increasingly capable of interacting with blockchains.

They can analyze information, prepare transactions, and automate workflows.

However, many systems today rely on software-managed secrets such as:

* Environment variables
* Local private key files
* Cloud-hosted credentials

While these approaches work, they introduce additional risk when real assets are involved.

Solana Copilot explores a different model:

The application helps users interact with Solana, while transaction authorization remains under Ledger's control.

---

## The Problem

Traditional AI-powered crypto applications often follow this model:

```text
User
 ↓
Application
 ↓
Private Key
 ↓
Blockchain
```

In this model, the same system that prepares actions also controls the authority required to execute them.

This creates unnecessary risk.

---

## The Ledger Agent Stack

Ledger recently introduced an open-source Agent Stack designed for agent-driven and AI-powered applications.

The stack includes:

### DMK Skills

A developer toolkit that allows applications and agents to communicate with Ledger devices.

Supports:

* Ethereum
* Bitcoin
* Solana
* Cosmos
* FIDO2 human-in-the-loop workflows

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

Across all four components, the core principle remains the same:

**Transaction authorization remains separate from transaction preparation.**

---

## How Solana Copilot Uses Ledger

This project focuses on **Ledger Wallet CLI**.

Wallet CLI serves as the transaction execution and signing layer behind the application.

Architecture:

```text
User
 ↓
Solana Copilot
 ↓
Transaction Builder
 ↓
Ledger Wallet CLI
 ↓
Ledger Device / Speculos
 ↓
Solana Network
```

The web application provides the user experience.

Ledger Wallet CLI provides the signing workflow.

The application never directly controls private keys.

---

## Features

### Natural Language Interface

Examples:

```text
Send 0.1 SOL to <address>
```

```text
Swap 1 SOL to USDC
```

```text
Create a token called PRAJ
```

### Transaction Builder

The application:

* Understands user requests
* Extracts required parameters
* Resolves addresses
* Prepares transaction flows
* Generates transaction summaries

### Ledger-Based Transaction Approval

Before execution:

* Transaction details are displayed
* Amounts are reviewed
* Recipients are reviewed
* Network fees are displayed
* Ledger approval is required

### Solana Operations

Current functionality includes:

* Address resolution
* Wallet lookup
* Balance queries
* SOL transfers
* Transaction review flow

---

## User Flow

### Sending SOL

User input:

```text
Send 0.1 SOL to <address>
```

Flow:

```text
User Request
      ↓
Address Resolution
      ↓
Transaction Creation
      ↓
Transaction Review
      ↓
Ledger Approval
      ↓
Broadcast
      ↓
Success
```

---

## Technology Stack

### Frontend

* React
* TypeScript
* Tailwind CSS

### Blockchain

* Solana
* Solana Web3.js

### Security Layer

* Ledger Wallet CLI
* Ledger Agent Stack
* Speculos Emulator (development)

---

## Ledger Wallet CLI Integration

The project uses Ledger Wallet CLI as the transaction execution layer.

Examples:

```bash
wallet-cli --version
```

```bash
wallet-cli account discover solana
```

```bash
wallet-cli balances <account>
```

```bash
wallet-cli send ...
```

```bash
wallet-cli swap ...
```

The application is designed so that Ledger-specific functionality remains isolated from the user interface.

---

## Security Model

The application is responsible for:

* Understanding user requests
* Preparing transactions
* Generating transaction summaries

The application is not responsible for:

* Storing private keys
* Signing transactions
* Authorizing transfers

Authorization remains under Ledger's control.

---

## Acknowledgements

Built using:

* Solana
* Ledger Agent Stack
* Ledger Wallet CLI
* Speculos
* React
* TypeScript

Special thanks to Ledger for open-sourcing the tools that make secure transaction workflows more accessible to developers.
