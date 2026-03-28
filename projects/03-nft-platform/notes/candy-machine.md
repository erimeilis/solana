# Candy Machine — The NFT Vending Machine

## The Problem Candy Machine Solves

Imagine you have 1,000 cat NFTs to sell. Without Candy Machine, you'd need to:

1. Manually mint each NFT when someone wants to buy
2. Handle payments yourself
3. Track who already minted
4. Prevent bots from grabbing everything
5. Set up phases (early access for supporters, then public sale)
6. Handle the case where 500 people try to mint at the same second

That's a LOT of custom code. **Candy Machine is a pre-built program that handles ALL of this.**

## How It Works

Think of it literally as a vending machine:

```
You (creator) load it:                    Users interact with it:
┌─────────────────────┐                  ┌─────────────────────┐
│   CANDY MACHINE     │                  │   CANDY MACHINE     │
│                     │                  │                     │
│  ┌───┐ ┌───┐ ┌───┐  │  User sends      │  ┌───┐ ┌───┐        │
│  │🐈 │ │🐈 │ │🐈‍⬛ │  │◀── 0.5 SOL ─────│  │🐈 │ │🐈 │ empty  │
│  │#1 │ │#2 │ │#3 │  │                  │  │#1 │ │#2 │        │
│  └───┘ └───┘ └───┘  │  User gets ──▶   │  └───┘ └───┘        │
│                     │  Cat #3 NFT      │                     │
│  Items: 3           │                  │  Items: 2           │
│  Price: 0.5 SOL     │                  │  Minted: 1          │
│  Minted: 0          │                  │                     │
└─────────────────────┘                  └─────────────────────┘
```

The Candy Machine:
1. **Stores the list** of all NFTs that can be minted (their metadata URIs)
2. **Handles payment** — collects SOL (or tokens) from the buyer
3. **Mints the NFT** — creates the Core asset and assigns it to the buyer
4. **Tracks progress** — knows how many are minted, how many remain
5. **Enforces rules** — via Guards (see guards-explained.md)

## The Workflow

```
Step 1: CREATE ASSETS
  You create images + metadata JSON files for each NFT
  ├── 0.png + 0.json
  ├── 1.png + 1.json
  └── 2.png + 2.json

Step 2: UPLOAD TO ARWEAVE
  Sugar CLI uploads images and metadata to permanent storage
  Each file gets an Arweave URL (like https://arweave.net/abc123)

Step 3: CREATE CANDY MACHINE
  Sugar deploys a Candy Machine program on devnet
  It's loaded with the Arweave URLs for each NFT

Step 4: CONFIGURE GUARDS
  Set rules: price, start date, mint limits, allowlists

Step 5: BUILD FRONTEND
  Website with "Mint" button that calls the Candy Machine

Step 6: USERS MINT
  User clicks "Mint" → pays SOL → gets random NFT from collection
```

## What Sugar CLI Does

**Sugar** is the command-line tool that handles steps 1-4:

```bash
# Upload assets to Arweave
sugar upload

# Create the Candy Machine on-chain
sugar deploy

# Verify everything is correct
sugar verify

# Add guards (rules)
sugar guard add
```

Without Sugar, you'd need to write all this upload + deployment logic yourself. Sugar automates the entire process.

## Core Candy Machine vs Original

We're using **Core Candy Machine** — built specifically for the new Metaplex Core standard:

| Feature | Original CM (v3) | Core Candy Machine |
|---------|------------------|-------------------|
| NFT type | Token Metadata | Metaplex Core |
| Guards | 21 | 31 |
| Mint cost | ~0.022 SOL | ~0.0037 SOL |
| Accounts per mint | 3-5 | 1 |

## Key Terms

- **Items**: The total number of NFTs in the Candy Machine (e.g., 10 cats)
- **Minted**: How many have been minted so far
- **Authority**: Who can modify the Candy Machine settings (you)
- **Collection**: The Core collection asset that groups all minted NFTs
- **Config Line**: One entry in the Candy Machine (name + URI for one NFT)
- **Guard**: A rule that controls who/when/how people can mint (next note)
