# Project 3: NFT Minting Platform

Build a cat-themed NFT collection with a minting website. Users connect their wallet, pay SOL, and get a unique cat NFT.

**What we'll learn**: NFTs on Solana, Metaplex Core standard, Candy Machine, asset storage (Arweave via Irys), Umi SDK, and building a full minting frontend.

> See [notes/what-are-nfts.md](notes/what-are-nfts.md) for how NFTs work on Solana.
> See [notes/metaplex-core.md](notes/metaplex-core.md) for the Metaplex Core standard (replaces Token Metadata).
> See [notes/candy-machine.md](notes/candy-machine.md) for how Candy Machine works (the vending machine for NFTs).
> See [notes/guards-explained.md](notes/guards-explained.md) for mint rules (price, limits, dates, bot protection).
> See [notes/asset-storage.md](notes/asset-storage.md) for how images are stored permanently on Arweave.

**Network**: devnet
**Wallet**: `Eg4yxfELo5kyets2jQv83t9ET1MtS3hBeGSjHLyueB29`

---

## Progress

- [x] Step 1: Understand NFTs and the Metaplex Ecosystem
- [x] Step 2: Install Tools (Sugar CLI v2.9.1)
- [x] Step 3: Create NFT Assets (10 generative cats + metadata)
- [x] Step 4: Upload Assets to Arweave (via Irys)
- [x] Step 5: Create the Candy Machine (V3, deployed to devnet)
- [x] Step 6: Configure Guards (solPayment, mintLimit, botTax)
- [x] Step 7: Mint a Test NFT via CLI
- [x] Step 8: Build the Minting Frontend
- [x] Step 9: Add NFT Gallery (View Your NFTs)
- [x] Step 10: Polish (split components, skeleton loaders, friendly errors, mobile responsive)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  NFT Minting DApp                       │
├─────────────────────────────────────────────────────────┤
│  Frontend (Next.js)                                     │
│  ├── Wallet Connection (Phantom)                        │
│  ├── Collection Info (name, supply, minted count)       │
│  ├── Mint Button (pay SOL → get random cat NFT)         │
│  └── Gallery (view your minted cats)                    │
├─────────────────────────────────────────────────────────┤
│  Metaplex Programs (already deployed on Solana)         │
│  ├── Core Program (creates/manages NFTs)                │
│  ├── Core Candy Machine (vending machine logic)         │
│  └── Guards (payment, limits, dates, bot tax)           │
├─────────────────────────────────────────────────────────┤
│  Storage                                                │
│  ├── Images → Arweave (via Irys, permanent)             │
│  └── Metadata JSON → Arweave (via Irys, permanent)      │
├─────────────────────────────────────────────────────────┤
│  Tools                                                  │
│  ├── Sugar CLI (upload + deploy Candy Machine)          │
│  └── Umi SDK (frontend talks to Metaplex programs)      │
└─────────────────────────────────────────────────────────┘
```

---

## Step 1: Understand NFTs and the Metaplex Ecosystem

Read the notes linked above. Key concepts:

- **NFT** = token with supply of 1, unique metadata, linked to an image
- **Metaplex Core** = the current NFT standard on Solana (replaces Token Metadata)
- **Candy Machine** = on-chain vending machine that mints NFTs from a collection
- **Guards** = rules for who/when/how people can mint (price, limits, dates)
- **Arweave** = permanent storage for images and metadata (via Irys)
- **Sugar CLI** = tool for uploading assets and deploying Candy Machine
- **Umi SDK** = TypeScript SDK for calling Metaplex programs from frontend

---

## Step 2: Install Tools

```bash
# Install Sugar CLI (Metaplex's CLI tool)
bash <(curl -sSf https://sugar.metaplex.com/install.sh)

# Verify
sugar --version  # Should show 2.9.x
```

---

## Step 3: Create NFT Assets

We need images and metadata for each NFT. Structure:

```
assets/
├── 0.png              # Cat image #0
├── 0.json             # Metadata for cat #0
├── 1.png              # Cat image #1
├── 1.json             # Metadata for cat #1
├── ...
├── collection.png     # Collection cover image
└── collection.json    # Collection metadata
```

Each JSON file follows this format:
```json
{
  "name": "Cool Cat #0",
  "symbol": "CCAT",
  "description": "A unique cat from the Cool Cats collection",
  "image": "0.png",
  "attributes": [
    { "trait_type": "Fur", "value": "Orange" },
    { "trait_type": "Eyes", "value": "Laser" },
    { "trait_type": "Hat", "value": "Crown" }
  ],
  "properties": {
    "files": [{ "uri": "0.png", "type": "image/png" }]
  }
}
```

---

## Step 4: Upload Assets to Arweave

```bash
cd projects/03-nft-platform

# Configure Sugar (sets cluster, keypair, storage method)
sugar config create

# Upload all assets to Arweave via Irys
sugar upload

# Verify all uploads succeeded
sugar verify
```

Sugar replaces local image paths in JSON with Arweave URLs automatically.

---

## Step 5: Create the Core Candy Machine

```bash
# Deploy the Candy Machine on devnet
sugar deploy
```

This creates:
- A **Collection** asset (the parent for all NFTs)
- A **Candy Machine** account (loaded with all NFT metadata URIs)

---

## Step 6: Configure Guards

```bash
sugar guard add
```

Our guards:
- **Sol Payment**: 0.1 SOL per mint
- **Mint Limit**: 3 per wallet
- **Start Date**: when we're ready
- **Bot Tax**: 0.01 SOL penalty for failed transactions

---

## Step 7: Mint a Test NFT via CLI

```bash
sugar mint
```

Verify on Solana Explorer that the NFT was created, with correct metadata and image.

---

## Step 8: Build the Minting Frontend

Next.js app with:
- Wallet connection (Phantom)
- Collection info display (name, total supply, minted count)
- "Mint" button (calls Core Candy Machine via Umi SDK)
- Transaction status feedback

Stack: Next.js, Tailwind, `@metaplex-foundation/umi`, `@metaplex-foundation/mpl-core-candy-machine`, `@solana/wallet-adapter-react`

---

## Step 9: Add NFT Gallery

After minting, users can see their cats:
- Fetch all NFTs owned by connected wallet
- Display image, name, and attributes
- Filter by collection

Uses Metaplex DAS (Digital Asset Standard) API or Umi's fetch methods.

---

## Step 10: Polish and Deploy

- Loading states, error handling, responsive design
- Collection page showing all minted NFTs
- Minting progress (X of Y minted)
- Mobile-friendly UI
