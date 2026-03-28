# What Are NFTs on Solana?

## NFTs vs Tokens (What We Built in Project 1)

In Project 1 we created **catCoin (CAT)** — a fungible token. "Fungible" means every CAT is identical and interchangeable, like dollars. 1 CAT = 1 CAT, always.

An **NFT (Non-Fungible Token)** is the opposite — each one is unique. Think of it like:

```
Fungible (catCoin):          Non-Fungible (NFT):
┌─────┐ ┌─────┐ ┌─────┐    ┌─────────┐ ┌─────────┐ ┌─────────┐
│ CAT │=│ CAT │=│ CAT │    │ Cat #1  │≠│ Cat #2  │≠│ Cat #3  │
│  1  │ │  1  │ │  1  │    │ Orange  │ │ Black   │ │ Calico  │
│     │ │     │ │     │    │ Rare    │ │ Common  │ │ Legend  │
└─────┘ └─────┘ └─────┘    └─────────┘ └─────────┘ └─────────┘
 All identical               Each one unique
```

## How Solana Represents NFTs

On Solana, an NFT is technically just a token with:
- **Supply of exactly 1** — there's only one of this specific token
- **0 decimals** — you can't have 0.5 of an NFT
- **Metadata attached** — name, image, attributes (traits like "Background: Blue")

In Project 1, our catCoin had supply = 1,000,000 and 9 decimals. An NFT flips that: supply = 1, decimals = 0.

## What's Inside an NFT?

An NFT has two layers:

```
┌──────────────────────────────────────────────┐
│ ON-CHAIN (stored on Solana)                  │
│ ├── Owner: who currently holds it            │
│ ├── Name: "Cool Cat #42"                     │
│ ├── Symbol: "CCAT"                           │
│ ├── URI: https://arweave.net/abc123          │
│ ├── Royalties: 5% to creator on resale       │
│ └── Attributes: can be on-chain with Core    │
└──────────────────────────────────────────────┘
         │
         │ URI points to...
         ▼
┌─────────────────────────────────────────────────────┐
│ OFF-CHAIN (stored on Arweave/IPFS)                  │
│ ├── Image: the actual cat picture (PNG/JPG)         │
│ └── Metadata JSON:                                  │
│     {                                               │
│       "name": "Cool Cat #42",                       │
│       "image": "https://arweave.net/img123          │
│         { "trait_type": "Fur", "value": "Orange" }, │
│         { "trait_type": "Eyes", "value": "Laser" }, │
│         { "trait_type": "Hat", "value": "Crown" }   │
│       ]                                             │
│     }                                               │
└─────────────────────────────────────────────────────┘
```

**Why not store images on-chain?** Cost. Storing 1MB of data on Solana costs ~7 SOL in rent. A single image could cost hundreds of dollars. So we store images on permanent storage (Arweave) and just put the link on-chain.

## NFT Collections

A **collection** is a group of related NFTs — like a set of trading cards. Our project will be a cat-themed collection.

```
Collection: "Cool Cats"
├── Cool Cat #1  (Orange fur, Laser eyes, Crown)
├── Cool Cat #2  (Black fur, Normal eyes, Beanie)
├── Cool Cat #3  (Calico fur, Wink eyes, None)
├── Cool Cat #4  (White fur, Sunglasses, Fedora)
└── ... up to whatever supply we set
```

Each NFT in the collection shares the same collection address, so wallets and marketplaces can group them together.

## What Makes NFTs Useful?

Beyond art/collectibles:
- **Proof of ownership** — verifiable on-chain that YOU own this specific item
- **Transferable** — send to anyone, sell on marketplaces (Magic Eden, Tensor)
- **Royalties** — creators earn a percentage on every resale
- **Composable** — programs can read NFT ownership and gate access (e.g., "only holders of Cat #1-#100 can access this feature")
- **Provenance** — full history of who owned it, tracked forever on-chain

## Real-World Examples on Solana

- **Mad Lads** — 10K PFP collection, floor ~100+ SOL
- **Tensorians** — NFTs from the Tensor marketplace team
- **Drip** — free daily NFT drops from various artists
- **Helium Hotspots** — each WiFi hotspot is represented as an NFT
- **Event tickets** — NFTs as concert/event tickets (prevents counterfeiting)
