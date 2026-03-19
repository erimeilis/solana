# Why Vaults? And What Are "Smart Contracts"?

## Why would anyone need a vault?

A vault is one of the most fundamental building blocks in blockchain. Real-world uses:

### 1. Savings / Staking
Users deposit SOL (or tokens) and earn yield over time. The vault program locks the funds and distributes rewards. Examples: Marinade Finance (liquid staking), Jito (MEV staking).

### 2. Treasury management
A DAO (decentralized organization) collects funds from members into a vault. Withdrawals require a vote. No single person can steal the money — the program enforces the rules.

### 3. Escrow
Buyer deposits into a vault. Seller delivers goods. Program releases funds to seller. If seller doesn't deliver, funds return to buyer. No middleman needed — the code IS the middleman.

### 4. Lending / Borrowing
Users deposit assets into a vault as collateral. They borrow against it. If the collateral value drops too low, the vault automatically liquidates. This is how DeFi lending works (MarginFi, Solend).

### 5. Game economies
Players deposit tokens into a game vault. The game program distributes rewards based on gameplay. The vault ensures fair distribution — the game developer can't just take the money.

### The common pattern

All of these are variations of the same thing:
```
deposit → hold → release (under specific conditions)
```

The conditions are enforced by the program, not by a person. That's the value — **trustless custody**. You don't trust a bank or a company to hold your funds. You trust code that anyone can read and verify.

Our vault is the simplest version: deposit SOL, withdraw SOL, track balances. But the same pattern scales to everything above.

## What is a "smart contract"?

You're right — it IS just a program. The name is misleading.

### Why "smart contract"?

The term was coined by Nick Szabo in 1994, before blockchain existed. His idea: encode the terms of an agreement into code that executes automatically. Like a vending machine — you insert money, it gives you a snack. No human needed to enforce the deal.

When Ethereum launched in 2015, they called their on-chain programs "smart contracts" because they fit Szabo's idea — code that enforces agreements between parties without a middleman.

### Why not just "app"?

A regular app runs on one server controlled by one company. They can:
- Change the rules anytime
- Shut it down
- Steal your funds
- Censor users

A "smart contract" (on-chain program) runs on ~1400 validators simultaneously. Once deployed:
- Rules are public and verifiable
- No single entity controls it
- Can be made immutable (nobody can change it, ever)
- Executes exactly as written, every time

```
Regular app:                    On-chain program:
───────────────                 ──────────────────
Runs on: 1 server               Runs on: ~1400 validators
Trust: the company               Trust: the code
Can change: anytime              Can change: only if upgrade authority exists
Can censor: yes                  Can censor: extremely difficult
```

### Solana's terminology

Solana avoids "smart contract" and just calls them **programs**. Ethereum calls them **smart contracts**. Same thing, different name.

Neither is "smart" and neither is a "contract" in a legal sense. It's just code deployed on a blockchain. Solana's naming is more honest.

But understanding why the term exists matters: the point of deploying code on-chain instead of a server is **trustless execution** — users don't need to trust you, they trust the code.
