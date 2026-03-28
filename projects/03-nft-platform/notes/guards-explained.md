# Candy Machine Guards — Controlling Who Can Mint

## What Are Guards?

Guards are **rules** attached to a Candy Machine that control the minting process. Without guards, anyone could mint for free, unlimited times, immediately. Guards let you add restrictions.

Think of guards as bouncers at a club:

```
Without guards:                    With guards:
┌────────────────┐                ┌────────────────────────┐
│ CANDY MACHINE  │                │ CANDY MACHINE          │
│                │                │                        │
│  Come in!      │                │  🛡️ GUARDS:            │
│  Free!         │                │  ├── Pay 0.5 SOL       │
│  No limits!    │                │  ├── Max 3 per wallet  │
│  Bots welcome! │                │  ├── Starts March 25   │
│                │                │  └── Bot tax: 0.01 SOL │
└────────────────┘                └────────────────────────┘
```

## Guards We'll Use

Core Candy Machine has 31 guards, but most projects use a handful. Here are the ones we'll set up:

### Sol Payment
**What**: Requires payment in SOL to mint.

```
User wants to mint → Must pay 0.1 SOL → SOL goes to your treasury wallet
```

This is how you earn money from your NFT collection.

### Start Date
**What**: Minting only opens after a specific date/time.

```
Before March 25, 2026: ❌ "Minting hasn't started yet"
After March 25, 2026:  ✅ "Mint your cat!"
```

Useful for building hype — announce the date, build anticipation.

### Mint Limit
**What**: Caps how many NFTs one wallet can mint.

```
Wallet ABC mints Cat #1: ✅ (1/3)
Wallet ABC mints Cat #2: ✅ (2/3)
Wallet ABC mints Cat #3: ✅ (3/3)
Wallet ABC mints Cat #4: ❌ "Mint limit reached"
```

Prevents whales from buying the entire collection.

### Bot Tax
**What**: If a transaction fails (e.g., bot tries to mint with wrong parameters), it charges a small fee instead of just failing for free.

```
Real user fails:    Loses 0.01 SOL (annoying but small)
Bot fails 1000x:    Loses 10 SOL (expensive, discourages botting)
```

Bots often spam thousands of transactions hoping some succeed. Bot tax makes this expensive.

### End Date
**What**: Minting closes after a specific date.

```
Before April 1: ✅ Can mint
After April 1:  ❌ "Minting has ended"
```

Creates urgency — "only 7 days to mint!"

### Redeemed Amount
**What**: Ends minting after a total number of NFTs have been minted (regardless of which wallet).

```
Collection size: 100 cats
Minted so far: 99
Next mint: ✅ Cat #100
Next attempt: ❌ "All NFTs have been minted"
```

## Guard Groups — Multi-Phase Mints

You can create **groups** of guards to run different phases:

```
Phase 1: "OG Holders" (first 24 hours)
├── Allow List: only wallets on the whitelist
├── Sol Payment: 0.05 SOL (discounted)
├── Mint Limit: 2 per wallet
├── Start Date: March 25, 12:00 UTC
└── End Date: March 26, 12:00 UTC

Phase 2: "Public Mint" (after 24 hours)
├── Sol Payment: 0.1 SOL (full price)
├── Mint Limit: 5 per wallet
├── Start Date: March 26, 12:00 UTC
└── Bot Tax: 0.01 SOL
```

Users in Phase 1 get early access and a discount. Phase 2 opens to everyone at full price. All configured through the same Candy Machine.

## Other Interesting Guards (Not Using, But Good to Know)

| Guard | What It Does | Use Case |
|-------|-------------|----------|
| **Allow List** | Only whitelisted wallets can mint | Early supporter access |
| **Token Gate** | Must hold a specific token to mint | "Hold our token to access mint" |
| **Asset Gate** | Must hold an NFT from another collection | "Own a Mad Lad? You can mint" |
| **Asset Burn** | Must burn an NFT to mint | "Sacrifice old NFT for new one" |
| **Freeze Sol Payment** | Payment is locked for a period | Prevents instant flip/resale |
| **Gatekeeper** | Requires CAPTCHA/proof of human | Anti-bot (more aggressive than bot tax) |

## How Guards Are Configured

Guards are set via Sugar CLI or Umi SDK:

```bash
# Via Sugar CLI (we'll use this for setup)
sugar guard add

# Or programmatically via Umi (we'll use this in frontend)
import { some, sol } from '@metaplex-foundation/umi';

const guards = {
  solPayment: some({ lamports: sol(0.1), destination: treasuryWallet }),
  mintLimit: some({ id: 1, limit: 3 }),
  startDate: some({ date: dateTime('2026-03-25T00:00:00Z') }),
  botTax: some({ lamports: sol(0.01), lastInstruction: true }),
};
```
