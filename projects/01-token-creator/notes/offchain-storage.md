# Off-chain Storage: Arweave, IPFS, and alternatives

## The problem

Token metadata on-chain stores only a **URI** pointing to a JSON file. That JSON (with description, image, etc.) needs to live somewhere publicly accessible. If the hosting goes down, your token loses its name and image.

## Options

### Arweave — permanent storage, pay once

Arweave is a blockchain specifically for **permanent data storage**. You pay once, and the data stays forever. No renewals, no subscriptions.

```
You → pay ~0.00005 AR (~$0.001) → data stored FOREVER
                                   across Arweave network nodes
```

- **Cost**: Near-zero for small files (JSON + images). ~$0.001 for a JSON file.
- **Permanence**: Guaranteed by the protocol — data is replicated and incentivized to stay
- **Speed**: Served via gateways like `arweave.net` — fast enough for metadata
- **Used by**: Metaplex (default for NFTs), most Solana projects

**How it works**: Arweave miners store data and get paid from an endowment pool. The protocol is designed so the cost of storage decreases over time (storage gets cheaper), but the endowment covers it for 200+ years.

### IPFS — content-addressed, needs pinning

IPFS (InterPlanetary File System) is a peer-to-peer network where files are addressed by their **content hash**, not a URL.

```
Traditional: https://example.com/catcoin.json  (location-based — if server dies, file gone)
IPFS:        ipfs://QmX4z...abc                 (content-based — anyone with the file can serve it)
```

- **Cost**: Free to upload, BUT someone must "pin" (keep hosting) the file
- **Permanence**: NOT guaranteed — if nobody pins your file, it disappears
- **Pinning services**: Pinata, Infura, web3.storage — free tiers available, paid for guarantees
- **Used by**: Ethereum NFTs mostly, some Solana projects

**The catch**: IPFS itself doesn't guarantee persistence. You need a pinning service, which is essentially... a server. It's decentralized addressing but often centralized hosting.

### Comparison

### Cloudflare R2 — free, fast, reliable

Cloudflare R2 is S3-compatible object storage with a generous free tier (10 GB storage, 10 million reads/month). Files are served via Cloudflare's CDN — fast worldwide, practically never goes down.

- **Cost**: Free tier covers way more than token metadata needs
- **Permanence**: As long as you keep the account — not blockchain-permanent, but very reliable
- **Speed**: Cloudflare CDN — excellent
- **Best for**: Projects where you want control, reliability, and zero cost without blockchain storage

### Comparison

| | Arweave | IPFS + Pinning | Cloudflare R2 | GitHub (raw URL) |
|--|---------|---------------|---------------|-------------------|
| **Permanent?** | Yes (200+ years) | Only if pinned | While account exists | Can delete/go private |
| **Cost** | One-time (~$0.001) | Free + pinning | Free tier | Free |
| **Decentralized?** | Yes | Partially | No (Cloudflare) | No (GitHub) |
| **Speed** | Good (gateways) | Variable | Excellent (CDN) | Fast |
| **Reliability** | Protocol-guaranteed | Depends on pinner | Very high | High |
| **Best for** | Production tokens/NFTs | Ethereum ecosystem | Production + dev | Development/testing |

### For our devnet learning project

Any of these work — the token is on devnet and has no real value. We're using a **public GitHub raw URL** (simplest for learning). For production mainnet tokens, Arweave or Cloudflare R2 are solid choices.
