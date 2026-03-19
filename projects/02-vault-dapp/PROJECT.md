# Project 2: Vault DApp

Build a program where users can deposit and withdraw SOL, with a frontend to interact with it.

**What we'll learn**: Anchor framework, writing Solana programs in Rust, PDAs in practice, Cross-Program Invocations (CPI), testing, and TypeScript client integration.

> See [notes/why-vault-and-smart-contracts.md](notes/why-vault-and-smart-contracts.md) for why vaults matter IRL and why on-chain programs are called "smart contracts."
> See [notes/defi-concepts.md](notes/defi-concepts.md) for staking, lending, escrow, and DAOs explained.

**Network**: devnet
**Wallet**: `Eg4yxfELo5kyets2jQv83t9ET1MtS3hBeGSjHLyueB29`

---

## Progress

- [x] Step 1: Understand Anchor Framework
- [x] Step 2: Initialize the Anchor Project
- [x] Step 3: Understand the Program Structure
- [x] Step 4: Write the Initialize Instruction
- [x] Step 5: Write the Deposit Instruction
- [x] Step 6: Write the Withdraw Instruction
- [x] Step 7: Write Tests
- [x] Step 8: Build and Deploy to Devnet
- [x] Step 9: Build a Frontend (TypeScript + React)

---

## Step 1: Understand Anchor Framework

### What is Anchor?

In Project 1, we used the **SPL Token Program** — a program someone else wrote and deployed on Solana. We just called it via CLI. Now we're writing our **own program** (smart contract) and deploying it.

Writing raw Solana programs in Rust is painful — hundreds of lines of boilerplate for basic things like deserializing accounts, validating inputs, and handling errors. **Anchor** is a framework that eliminates ~80% of that boilerplate.

> See [notes/anchor-framework.md](notes/anchor-framework.md) for a detailed comparison of raw Solana vs Anchor.

### What Anchor does for you

```
Without Anchor (raw Solana):              With Anchor:
─────────────────────────────             ──────────────────────
- Manually parse account data             - #[account] does it
- Manually validate accounts              - #[derive(Accounts)] does it
- Manually check signers                  - Signer<'info> does it
- Manually handle errors                  - Result<()> + error macros
- Manually serialize/deserialize          - Borsh handled automatically
- Write your own IDL                      - IDL auto-generated
- ~300 lines for a simple program         - ~50 lines for the same thing
```

### What is an IDL?

**IDL = Interface Definition Language**. It's a JSON file that describes your program's instructions, accounts, and types — like an API spec. Anchor auto-generates it when you build. Frontend clients use the IDL to know how to talk to your program.

```
Your Rust Program  ──anchor build──▶  IDL (JSON)  ──▶  TypeScript client knows
                                                        how to call your program
```

### What we're building

A **Vault** program with three instructions:

1. **initialize** — create the vault
2. **deposit** — user sends SOL into the vault
3. **withdraw** — user takes SOL back out

```
User Wallet (SOL)
    │
    ├── deposit(amount) ──▶ SOL goes to Vault PDA
    │                       User's deposit is recorded
    │
    └── withdraw(amount) ──▶ SOL comes back from Vault PDA
                             User's deposit is decremented
```

Each user has their own **UserAccount** (a PDA) that tracks how much they deposited. The vault itself is a PDA that holds the actual SOL.

---

## Step 2: Initialize the Anchor Project

**What happens**: We use `anchor init` to scaffold a new project with the correct directory structure, config files, and a starter program.

```bash
cd projects/02-vault-dapp
anchor init vault --no-git
cd vault
```

**Expected structure**:
```
vault/
├── programs/
│   └── vault/
│       └── src/
│           └── lib.rs          # Our Rust program (this is where we code)
├── tests/
│   └── vault.ts               # TypeScript tests
├── migrations/
│   └── deploy.ts
├── Anchor.toml                 # Anchor config (cluster, wallet, program ID)
├── Cargo.toml                  # Rust workspace config
├── package.json
└── tsconfig.json
```

**Our result**:
```
Program ID: 5FejKgQNfWe677DxbEpiyZeoRNyQEZfL1pU7Nixtz7Yh
anchor build: ✅ (compiled in ~45s first build)
```

The generated `lib.rs` has a minimal starter program:
```rust
use anchor_lang::prelude::*;

declare_id!("5FejKgQNfWe677DxbEpiyZeoRNyQEZfL1pU7Nixtz7Yh");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
```

We'll replace this with our vault logic in the next steps.

---

## Step 3: Understand the Program Structure

Before writing code, understand the four building blocks of every Anchor program:

> See [notes/anchor-program-anatomy.md](notes/anchor-program-anatomy.md) for a detailed breakdown with examples.

### 1. `declare_id!` — your program's address

Every program on Solana has a unique address (like a mint address, but for code). Anchor generates a keypair when you init the project, and `declare_id!` hardcodes it into your program.

```rust
declare_id!("YourProgramAddressHere...");
```

### 2. `#[program]` — your instructions

This is where you write the actual logic — the functions users can call. Each public function is an **instruction**.

```rust
#[program]
pub mod vault {
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // your logic here
        Ok(())
    }
}
```

### 3. `#[derive(Accounts)]` — account validation

For each instruction, you define a struct that lists ALL accounts the instruction needs. Anchor validates them automatically before your code runs — if any account is wrong, the transaction fails.

```rust
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

### 4. `#[account]` — data structures

Define what data your program stores on-chain. Anchor handles serialization/deserialization automatically.

```rust
#[account]
pub struct Vault {
    pub authority: Pubkey,  // 32 bytes
    pub balance: u64,       // 8 bytes
}
// Total space needed: 8 (discriminator) + 32 + 8 = 48 bytes
```

The `8` at the beginning is Anchor's **discriminator** — an 8-byte hash that identifies the account type. Anchor adds this automatically.

---

## Step 4: Write the Initialize Instruction

**What it does**: Creates the Vault account and sets the caller as the authority.

All three instructions were written together in `vault/programs/vault/src/lib.rs` (every line commented). Key implementation detail: we needed `init-if-needed` cargo feature for creating user accounts on first deposit.

> See [notes/transaction-atomicity.md](notes/transaction-atomicity.md) for why we don't need manual rollback logic.
> See [notes/cpi-explained.md](notes/cpi-explained.md) for how CPI and PDA signing work.

---

## Step 5: Write the Deposit Instruction

Uses CPI to call System Program for SOL transfer. Each user gets a PDA (`UserAccount`) tracking their deposits. Seeds: `["user", vault_pubkey, user_pubkey]`.

---

## Step 6: Write the Withdraw Instruction

Uses CPI with PDA signing (`CpiContext::new_with_signer`) — the vault PDA proves ownership via seeds instead of a private key. Checks that user has enough deposited before allowing withdrawal.

---

## Step 7: Write Tests

All 7 tests passing:
```
✔ initializes the vault
✔ deposits SOL into the vault
✔ deposits more SOL (accumulates)
✔ withdraws SOL from the vault
✔ fails to withdraw more than deposited
✔ fails to deposit zero
✔ fails when wrong user tries to withdraw
```

Tests are in `vault/tests/vault.ts`. Run with `anchor test`.

---

## Step 8: Build and Deploy to Devnet

```bash
anchor build
anchor deploy --provider.cluster devnet
```

**Our result**:
```
Program ID:        5FejKgQNfWe677DxbEpiyZeoRNyQEZfL1pU7Nixtz7Yh
IDL Account:       AKDT13SVRqWqJV55XzTvUsuZKNjXY3FeAAeRYxc7y8jX
Deploy cost:       ~1.679 SOL (rent for storing program binary across all validators)
SOL remaining:     8.300 SOL
Upgrade authority: Eg4yxfELo5kyets2jQv83t9ET1MtS3hBeGSjHLyueB29 (us)
```

Explorer: https://explorer.solana.com/address/5FejKgQNfWe677DxbEpiyZeoRNyQEZfL1pU7Nixtz7Yh?cluster=devnet

The program binary (~200KB compiled) costs much more in rent than a token account (165 bytes) because it's replicated across all ~1400 validators.

---

## Step 9: Build a Frontend (TypeScript + React)

A Next.js + React app with wallet connection, deposit, and withdraw functionality.

**Stack**: Next.js 16, Tailwind CSS, `@solana/wallet-adapter-react`, `@coral-xyz/anchor`

**Structure**:
```
vault/app/frontend/
├── app/
│   ├── layout.tsx         # Wraps app in WalletContextProvider
│   └── page.tsx           # Renders VaultApp component
├── components/
│   ├── WalletProvider.tsx  # ConnectionProvider + WalletProvider + WalletModalProvider
│   └── VaultApp.tsx        # Main UI: connect wallet, deposit, withdraw, show balances
├── lib/
│   ├── vault.json         # IDL (copied from target/idl/ after anchor build)
│   └── vault.ts           # TypeScript types (copied from target/types/)
└── package.json
```

**How it works**:
1. User connects Phantom (or any Wallet Standard wallet) via `WalletMultiButton`
2. Creates a new vault (or connects to existing one)
3. Deposits/withdraws SOL via Anchor program calls
4. Balances update in real-time

**Run locally**:
```bash
cd vault/app/frontend
npm run dev -- --port 3030
# Open http://localhost:3030
```

Note: You need **Phantom wallet** (or another Solana wallet) browser extension installed and set to **devnet** to interact with the app.

> See [notes/phantom-wallet-setup.md](notes/phantom-wallet-setup.md) for Phantom install, devnet switch, and getting test SOL.
> See [notes/solana-wallets.md](notes/solana-wallets.md) for what wallet extensions are, alternatives to Phantom, and hot vs cold wallets.
