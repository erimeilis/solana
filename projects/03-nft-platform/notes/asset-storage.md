# Asset Storage — Where NFT Images Live

## The Problem

NFT images are too expensive to store on Solana. A single 500KB image would cost ~3.5 SOL in rent. A collection of 100 images? 350 SOL (~$50,000). Not practical.

So the blockchain stores only a **link** (URI) to the image, and the actual image lives on external storage.

## Storage Options

```
                    Permanent?    Cost           Decentralized?
┌─────────────┐
│  Arweave    │     ✅ Forever    ~$8/100MB      ✅ Yes
│  (via Irys) │
├─────────────┤
│  IPFS       │     ⚠️ If pinned  Free-ish       ✅ Yes
│  (Pinata)   │
├─────────────┤
│  AWS S3     │     ❌ If you pay Monthly fee     ❌ No
│             │
└─────────────┘
```

## Our Choice: Arweave via Irys

**Arweave** is a blockchain designed specifically for permanent data storage. You pay once, and the data is stored forever — no monthly fees, no risk of it disappearing.

**Irys** (formerly Bundlr) is a service that makes uploading to Arweave easy. Instead of dealing with Arweave directly, you pay Irys in SOL, and they handle the Arweave upload.

```
You → SOL payment → Irys → stores on → Arweave (permanent)
                                         ↓
                              https://arweave.net/abc123
                              (this URL works forever)
```

### Why Not IPFS?

IPFS is peer-to-peer file sharing. Files only stay available if someone "pins" them (keeps a copy). If you stop paying your pinning service (Pinata, Infura), your NFT images vanish. Arweave doesn't have this problem.

### Why Not Regular Hosting (AWS, etc)?

If the company goes down, or you stop paying, the images are gone. NFTs are supposed to last forever — the storage should too.

## How Upload Works (What Sugar Does)

```
Your local files:                 After upload:

assets/                          Arweave URLs:
├── 0.png  ──upload──▶          https://arweave.net/img_abc123
├── 0.json ──upload──▶          https://arweave.net/json_def456
├── 1.png  ──upload──▶          https://arweave.net/img_ghi789
├── 1.json ──upload──▶          https://arweave.net/json_jkl012
└── collection.json ──▶         https://arweave.net/json_mno345
```

The JSON files get updated automatically — Sugar replaces the local image reference (`0.png`) with the Arweave URL (`https://arweave.net/img_abc123`) before uploading the JSON.

## Devnet vs Mainnet

On **devnet**, uploads to Irys/Arweave use devnet SOL — so it's free for testing. The files still get uploaded and accessible via URLs, but they may not persist forever (devnet storage is temporary).

On **mainnet**, you pay real SOL for permanent Arweave storage.

## Cost Estimation

For our cat collection (assuming 10 NFTs):
- ~10 images (say 200KB each) = ~2MB
- ~10 metadata JSON files (tiny) = ~10KB
- **Devnet cost**: 0 real SOL (uses devnet SOL)
- **Mainnet cost**: ~$0.16 (very cheap for small collections)
