# Metaplex Core — The NFT Standard on Solana

## What is Metaplex?

Metaplex is the organization that builds the **NFT standards** for Solana. Think of it like how the SPL Token Program defines how fungible tokens work — Metaplex defines how NFTs work.

Without Metaplex, every project would invent its own NFT format. Wallets wouldn't know how to display them. Marketplaces couldn't list them. Metaplex provides the shared standard everyone follows.

## Why "Core"?

Metaplex originally created **Token Metadata** — the first NFT standard on Solana. It worked, but it was complex and expensive:

```
Token Metadata (Legacy):              Metaplex Core (Current):
┌────────────────────┐               ┌────────────────────┐
│ Mint Account       │               │ Single Asset       │
├────────────────────┤               │ Account            │
│ Metadata Account   │               │                    │
├────────────────────┤               │ Contains ALL data: │
│ Master Edition     │               │ - Owner            │
├────────────────────┤               │ - Name, URI        │
│ Token Account      │               │ - Royalties        │
├────────────────────┤               │ - Attributes       │
│ (+ more for        │               │ - Plugins          │
│  collections...)   │               │                    │
└────────────────────┘               └────────────────────┘
 3-5 accounts per NFT                 1 account per NFT
 ~0.022 SOL to mint                   ~0.0037 SOL to mint
```

**Core is 83% cheaper** and simpler because everything lives in one account.

## Core Concepts

### Assets

An **Asset** is one NFT. It's a single on-chain account containing:

```rust
Asset {
    owner: Pubkey,           // Who owns this NFT right now
    update_authority: Pubkey, // Who can modify metadata (usually the creator)
    name: String,            // "Cool Cat #42"
    uri: String,             // Link to off-chain metadata JSON
}
```

### Collections

A **Collection** is also a Core asset, but it acts as a parent that groups individual assets together:

```
Collection Asset: "Cool Cats" (address: ABC...)
    │
    ├── Asset: "Cool Cat #1" (collection: ABC...)
    ├── Asset: "Cool Cat #2" (collection: ABC...)
    └── Asset: "Cool Cat #3" (collection: ABC...)
```

Wallets like Phantom automatically group NFTs by collection.

### Plugins

Core has a **plugin system** — optional features you can attach to assets or collections:

| Plugin | What It Does |
|--------|-------------|
| **Royalties** | Enforce creator royalties on resale (e.g., 5%) |
| **Attributes** | Store traits on-chain (Fur: Orange, Eyes: Laser) |
| **Freeze** | Lock the NFT so it can't be transferred |
| **Burn** | Allow the owner to destroy the NFT |
| **Transfer** | Customize transfer behavior |
| **Edition** | Mark as edition X of Y |

Plugins are optional — you only pay for what you use.

## How Core Compares to What We've Built

```
Project 1 (Token):
  SPL Token Program → fungible, supply=1M, decimals=9

Project 2 (Vault):
  Our custom Anchor program → deposit/withdraw SOL

Project 3 (NFT):
  Metaplex Core Program → non-fungible, supply=1, unique metadata
  + Candy Machine Program → vending machine that mints from collection
```

We won't write the Core program ourselves (it's already deployed on Solana by Metaplex). Instead, we'll **call it** using the Umi SDK — similar to how in Project 1 we called the SPL Token Program via CLI.

## Umi SDK

**Umi** is Metaplex's TypeScript SDK for interacting with their programs. It's like `@solana/web3.js` but specifically designed for Metaplex operations.

```typescript
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createV1 } from '@metaplex-foundation/mpl-core';

// Create a Umi instance (like a Connection in web3.js)
const umi = createUmi('https://api.devnet.solana.com');

// Mint an NFT — one function call
await createV1(umi, {
  name: 'Cool Cat #1',
  uri: 'https://arweave.net/metadata.json',
}).sendAndConfirm(umi);
```

Compare that to raw Solana where you'd need to construct accounts, serialize data, build instructions manually — Umi handles it all.
