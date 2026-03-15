# Project 1: Token Creator

Create your own fungible token on Solana devnet.

**What we'll learn**: How Solana stores data (accounts), how tokens work (SPL Token Program), and how to interact with the blockchain via CLI.

**Wallet**: `Eg4yxfELo5kyets2jQv83t9ET1MtS3hBeGSjHLyueB29`
**Network**: devnet
**Balance**: 10 SOL

---

## Progress

- [x] Step 1: Understand Token Mint
- [x] Step 2: Create a Token Mint
- [x] Step 3: Create a Token Account
- [x] Step 4: Mint Tokens
- [x] Step 5: Check Balances and Explore on Solscan
- [ ] Step 6: Add Token Metadata (name, symbol, image)
- [ ] Step 7: Transfer Tokens

---

## Step 1: Understand Token Mint

### What is SPL?

**SPL = Solana Program Library** — a collection of standard programs (pre-built apps) that are already deployed on Solana and available to everyone. Think of them as system utilities:

| Program | What it does |
|---------|-------------|
| **SPL Token** | Create and manage fungible tokens (what we're using) |
| **SPL Token-2022** | Newer token standard with extra features |
| **SPL Associated Token Account** | Automatically creates token accounts for wallets |
| **SPL Memo** | Attach text messages to transactions |
| **SPL Name Service** | Human-readable names (like `.sol` domains) |

When we run `spl-token create-token`, we're calling the **SPL Token Program** — we don't write token logic ourselves, we just interact with a program that already exists on-chain and knows how to create mints, token accounts, and handle transfers.

### Why SPL Token and not Token-2022?

Solana has two token programs:

| | SPL Token (original) | Token-2022 (Token Extensions) |
|--|---------------------|-------------------------------|
| **Status** | Battle-tested, universal | Newer, growing adoption |
| **Wallet support** | Every wallet, every DEX | Most wallets, most DEXes |
| **Features** | Basic: mint, transfer, burn | Advanced: transfer fees, interest-bearing tokens, confidential transfers, non-transferable tokens, metadata built-in |
| **Complexity** | Simple | More flags, more concepts |
| **Best for learning** | Yes — fewer moving parts | Better after you understand the basics |

We're using **SPL Token** because:
1. **Simpler** — fewer concepts to learn at once
2. **Universal** — works everywhere, no compatibility surprises
3. **Same fundamentals** — Token-2022 is built on the same concepts (mints, token accounts, authorities), just adds extensions on top

Once you understand how SPL Token works, Token-2022 is just "the same thing with extra flags." For example, to create a Token-2022 mint with transfer fees:

```bash
# Token-2022 version (we'll explore this later)
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  create-token \
  --transfer-fee-basis-points 50 \
  --transfer-fee-maximum-fee 5000
```

Same CLI, same concepts — just a different program ID and extra flags.

### What is a Token Mint?

A Mint Account is a special account on Solana that **defines** a new token. Think of it as the **printing press** for your own currency.

When you create a Mint Account, you're saying: "I want a new type of money to exist on this blockchain." The mint doesn't hold any tokens itself — it's the **definition and control center** for the token.

```
┌─────────────────────────────────────────────────────────┐
│                    MINT ACCOUNT                         │
│                   (the printing press)                  │
│                                                         │
│  "I define a token called AxB7...f3Q"                   │
│                                                         │
│  Decimals: 9          (smallest unit = 0.000000001)     │
│  Supply: 0            (nothing printed yet)             │
│  Mint Authority: Eg4y..B29  (who can print more)        │
│  Freeze Authority: Eg4y..B29 (who can freeze accounts)  │
└─────────────────────────────────────────────────────────┘
```

Yes — the token is created "from thin air." There's no gold, no backing, no collateral. You define it, you control it. Just like a government can print its own currency, you can print your own token. Whether anyone *values* it — that's a different story.

### Decimals — the smallest possible piece

Decimals define how finely your token can be split:

| Decimals | Smallest unit | Example |
|----------|--------------|---------|
| 0 | 1 (whole tokens only) | Event tickets, votes |
| 2 | 0.01 | Like dollars and cents |
| 6 | 0.000001 | Like USDC (a dollar-pegged stablecoin) |
| 9 | 0.000000001 | Like SOL itself |

The default for `spl-token create-token` is **9 decimals**. This means internally, 1 token = 1,000,000,000 smallest units. Why so many? More precision = more flexibility for DeFi, micro-payments, etc.

### Mint Authority — who can print more?

**Mint authority** is the public key (wallet address) that has permission to create new supply of this token.

When you create a mint, YOUR wallet is set as the mint authority by default. This means:
- **Only you** can run `spl-token mint` to create new tokens
- You can **transfer** the authority to someone else
- You can **revoke** it entirely (set to null) — then nobody can ever mint more, supply becomes fixed forever

```
Mint Authority = Eg4yxfELo5kyets2jQv83t9ET1MtS3hBeGSjHLyueB29 (you)
                 │
                 ├── Can mint new tokens      ✅
                 ├── Can transfer authority    ✅
                 └── Can revoke (burn the key) ✅ (irreversible!)
```

Real-world analogy: you own the printing press. You can print money, hand the press to someone else, or destroy the press so nobody can ever print again.

### Supply — how much exists

Supply starts at **0**. Nothing exists until you actively mint (print) tokens. The Mint Account tracks the total supply automatically — every time you mint, it increments.

### How does this relate to our Keypair (wallet)?

Your keypair (wallet) holds **SOL** — the native currency of Solana. SOL pays for transaction fees and rent.

A Token Account is something different — it holds tokens of a **specific custom type**. You're right that it's like a separate bank account, but specifically for your custom currency:

```
Your Keypair / Wallet (Eg4y...B29)
│
├── SOL Balance: 10 SOL
│   (native currency, pays for fees)
│
├── Token Account for "MyToken" (AxB7...f3Q)
│   Balance: 0 (we haven't minted yet)
│
├── Token Account for "USDC" (if you had any)
│   Balance: 0
│
└── Token Account for "SomeOtherToken" (if you had any)
    Balance: 0
```

Each different token type needs its own Token Account. Your wallet can have many Token Accounts — one per token type. These are called **Associated Token Accounts (ATAs)** because they're automatically associated with your wallet address + a specific mint.

Think of it this way:
- **Keypair** = your identity (like your ID card)
- **SOL balance** = your native cash
- **Token Account** = a separate pocket in your wallet, specifically for one type of custom coin

### Who pays for what? Rent and fees

Creating accounts costs SOL — a one-time **rent** deposit for storing data on the blockchain (~1400 validators worldwide). Transfers of your token are free (besides tiny ~0.000005 SOL network fee). SPL Token has no transfer fee mechanism — Token-2022 does, but that's for later.

> See [notes/solana-network-and-rent.md](notes/solana-network-and-rent.md) for details on how the network works, what rent pays for, and exact amounts.

---

## Step 2: Create a Token Mint

**What happens**: We ask the SPL Token Program (a built-in Solana program) to create a new Mint Account on-chain. It costs ~0.0015 SOL in rent to store the Mint Account data.

```bash
spl-token create-token
```

**Our result**:
```
Token Mint Address: 93xVZh2Fdvq3axqQHurhBmuMkqANsBDcqT6iraMuJoAj
Decimals:          9
Program:           TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA (SPL Token Program)
Cost:              ~0.0015 SOL (rent for storing data on-chain)
```

**What actually happened on-chain**:
1. A new Mint Account was created at `93xVZh2Fdvq3axqQHurhBmuMkqANsBDcqT6iraMuJoAj`
2. It's owned by the **SPL Token Program** (a built-in program that manages all SPL tokens)
3. Our wallet (`Eg4y...B29`) is set as mint authority
4. Decimals = 9, Supply = 0

```bash
# View the mint details
spl-token display 93xVZh2Fdvq3axqQHurhBmuMkqANsBDcqT6iraMuJoAj

# View on block explorer
# https://solscan.io/token/93xVZh2Fdvq3axqQHurhBmuMkqANsBDcqT6iraMuJoAj?cluster=devnet
```

---

## Step 3: Create a Token Account

**What happens**: We create a Token Account that can hold our new token. This is the "pocket" in our wallet for this specific token type.

```bash
spl-token create-account 93xVZh2Fdvq3axqQHurhBmuMkqANsBDcqT6iraMuJoAj
```

**Our result**:
```
Token Account:  mbsAcXm7Fxtapnu8n6Tca3hwCQdQxMvK9HDgnF471Ku
Mint:           93xVZh2Fdvq3axqQHurhBmuMkqANsBDcqT6iraMuJoAj
Owner:          Eg4yxfELo5kyets2jQv83t9ET1MtS3hBeGSjHLyueB29 (us)
Balance:        0 (empty — nothing minted yet)
Cost:           ~0.002 SOL (rent)
```

This created an **Associated Token Account (ATA)** — a Token Account that is deterministically linked to your wallet + this specific mint. Anyone can calculate its address from those two inputs:

```
Your Wallet (Eg4y...B29) + Mint (93xV...JoAj)
    │
    └── derives ──▶ ATA Address: mbsA...1Ku (predictable, unique)
```

This means if someone wants to send you this token, they don't need to ask for your Token Account address — they can calculate it from your wallet address + the mint address. That's the "associated" part.

---

## Step 4: Mint Tokens

**What happens**: We use our mint authority to print 1,000,000 tokens into our Token Account.

```bash
spl-token mint 93xVZh2Fdvq3axqQHurhBmuMkqANsBDcqT6iraMuJoAj 1000000
```

**Our result**:
```
Minting 1000000 tokens
  Token:     93xVZh2Fdvq3axqQHurhBmuMkqANsBDcqT6iraMuJoAj
  Recipient: mbsAcXm7Fxtapnu8n6Tca3hwCQdQxMvK9HDgnF471Ku
```

The Mint Account's supply changed from 0 to 1,000,000. Internally it's stored as `1000000000000000` (1,000,000 × 10^9) because of 9 decimals — but CLI commands show human-friendly numbers.

---

## Step 5: Check Balances and Explore on Solscan

```bash
# Check your token balance
spl-token balance 93xVZh2Fdvq3axqQHurhBmuMkqANsBDcqT6iraMuJoAj
# Output: 1000000

# List all token accounts you own
spl-token accounts
# Output:
# Token                                         Balance
# 93xVZh2Fdvq3axqQHurhBmuMkqANsBDcqT6iraMuJoAj  1000000

# Remaining SOL after all operations
solana balance
# Output: 9.99647912 SOL (spent ~0.004 SOL on rent + fees)
```

**Block explorer links** (devnet):
- Your wallet: https://solscan.io/account/Eg4yxfELo5kyets2jQv83t9ET1MtS3hBeGSjHLyueB29?cluster=devnet
- Your token: https://solscan.io/token/93xVZh2Fdvq3axqQHurhBmuMkqANsBDcqT6iraMuJoAj?cluster=devnet

The token shows as "Unknown Token" — no name, no symbol, no image. That's what Step 6 fixes.

---

## Step 6: Add Token Metadata

Give your token a human-readable name, symbol, and image using the Metaplex Token Metadata Program.

*Details to be added when we reach this step.*

---

## Step 7: Transfer Tokens

Send tokens to another wallet to see transfers in action.

```bash
spl-token transfer <MINT_ADDRESS> 100 <RECIPIENT_ADDRESS>
```

*Details to be added when we reach this step.*
