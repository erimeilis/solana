# PDA & Metaplex Token Metadata Program

## What is a PDA?

**PDA = Program Derived Address**

Regular accounts on Solana have a private key — someone owns them and can sign transactions. A PDA is an account that **no one owns** — it's controlled by a **program** (code), not a person.

```
Regular Account (your wallet):
  Address: Eg4yxfELo5kyets2jQv83t9ET1MtS3hBeGSjHLyueB29
  Has private key? YES — you sign with it
  Controlled by: YOU

PDA (program-controlled account):
  Address: derived from [program_id + "seeds"]
  Has private key? NO — mathematically impossible
  Controlled by: THE PROGRAM that derived it
```

### How is a PDA address calculated?

It's derived deterministically from "seeds" + a program ID. Same inputs = same address, always:

```
Seeds: ["metadata", token_metadata_program_id, mint_address]
                         +
Program ID: metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
                         ↓
PDA Address: some deterministic address (always the same for these inputs)
```

This means anyone can **calculate** where the metadata for a given mint lives — no lookup needed, no directory, just math.

### Why do PDAs exist?

Programs need to own and manage accounts, but programs can't hold private keys. PDAs solve this — the program can read/write to the PDA because it "derived" it. No private key needed.

In our case: the Metaplex Token Metadata Program uses a PDA to store your token's metadata. The PDA address is derived from your mint address, so anyone can find the metadata for any token.

## What is the Metaplex Token Metadata Program?

**Metaplex** is an organization/protocol that builds standard tools for tokens and NFTs on Solana. Their **Token Metadata Program** is a program deployed on Solana that attaches metadata (name, symbol, image) to any SPL token.

```
Without metadata:                    With metadata:
┌─────────────────────┐              ┌─────────────────────┐
│ Mint Account        │              │ Mint Account        │
│ 93xVZh...JoAj       │              │ 93xVZh...JoAj       │
│ Supply: 1000000     │              │ Supply: 1000000     │
│ Decimals: 9         │              │ Decimals: 9         │
│ Name: ???           │              │                     │
│ Symbol: ???         │              │ Metadata PDA ──────────┐
│ Image: ???          │              └─────────────────────┘  │
└─────────────────────┘                                       │
                                     ┌────────────────────────┘
                                     │ Metadata Account (PDA)
                                     │ Name: "My Token"
                                     │ Symbol: "MTK"
                                     │ URI: "https://..."
                                     │   └── points to JSON with
                                     │       description + image URL
                                     └─────────────────────────┘
```

### Why is metadata separate?

The Mint Account is managed by the **SPL Token Program** — which only knows about balances, decimals, and authorities. It has no concept of "name" or "image."

Metaplex created a separate program that stores metadata in a PDA linked to the mint. This keeps the token program simple and the metadata extensible.

### How does it work?

1. You call the Metaplex Token Metadata Program with your mint address + desired name/symbol/URI
2. The program creates a **Metadata Account** (a PDA derived from your mint address)
3. Wallets and explorers know to look up this PDA to display your token's name and logo

This is the de facto standard on Solana — every wallet, DEX, and explorer uses Metaplex metadata.

## Tools for adding metadata

| Tool | Type | Pros | Cons |
|------|------|------|------|
| **metaboss** | CLI (Rust) | Simple one-command, no code needed | Must compile from source, dependency issues possible |
| **TypeScript + Metaplex Umi SDK** | Script | Educational, full control, reusable | Need to write code, install npm packages |
| **TypeScript + mpl-token-metadata** | Script | Official Metaplex JS library | More verbose than Umi |
| **Solana Playground** | Web IDE | No local setup, browser-based | Less control, not local workflow |

`metaboss` is a community-built "Swiss Army Knife" CLI for Metaplex operations. The command is:
```bash
metaboss create metadata -a <mint_address> -m <metadata_file.json>
```

The Umi SDK approach requires writing a short TypeScript script but teaches you how the Metaplex programs work programmatically — useful for Project 2 and 3.
