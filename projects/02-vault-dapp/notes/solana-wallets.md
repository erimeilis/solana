# Solana Wallets

## What is a wallet (browser extension)?

In Project 1, we used a CLI keypair — a JSON file with your private key. That works for terminal commands, but websites can't read your local files (for good reason).

A **wallet extension** (like Phantom) is a browser extension that:
1. **Stores your private key** securely inside the browser
2. **Signs transactions** when a website asks (you approve each one)
3. **Never exposes the private key** to the website — only the signature

```
Without wallet extension:
Website → "give me your private key" → DANGEROUS

With wallet extension:
Website → "please sign this transaction" → Phantom pops up → you click Approve
         (website never sees your key, only gets the signed transaction back)
```

It's like a browser-based version of the CLI keypair, but with a UI and security layer.

## Phantom

The most popular Solana wallet. ~10M+ users.

- **Browser extension**: Chrome, Firefox, Brave, Edge
- **Mobile app**: iOS, Android
- **Multi-chain**: Solana, Ethereum, Bitcoin, Polygon, Sui, Monad
- **Features**: Token display, NFT gallery, swap, staking, dApp browser
- **Website**: https://phantom.app

## Alternatives

| Wallet | Type | Chains | Notes |
|--------|------|--------|-------|
| **Phantom** | Extension + Mobile | Solana, ETH, BTC, + more | Most popular, best UX |
| **Solflare** | Extension + Mobile | Solana only | Solana-focused, good staking UI |
| **Backpack** | Extension + Mobile | Solana, Ethereum | By the xNFT team, built-in apps |
| **Glow** | Extension + Mobile | Solana only | Fast, lightweight |
| **Ledger** | Hardware device | Multi-chain | Physical device, most secure, no hot key |

## Hot wallet vs cold wallet

| | Hot wallet (Phantom, Solflare) | Cold wallet (Ledger) |
|--|-------------------------------|---------------------|
| **Key stored in** | Browser / phone (software) | Physical device (hardware) |
| **Convenience** | Instant, always available | Need the device plugged in |
| **Security** | Vulnerable if browser/phone compromised | Key never leaves the device |
| **Best for** | Daily use, devnet testing, small amounts | Large holdings, mainnet production |

For devnet learning, a hot wallet (Phantom) is perfect. For mainnet with real money, serious users add a Ledger.

## Wallet Standard

Solana has a **Wallet Standard** — a protocol that lets any wallet work with any dApp automatically. Our frontend code doesn't mention Phantom specifically:

```typescript
// We pass an empty wallets array — Wallet Standard wallets are auto-detected
const wallets = useMemo(() => [], []);
```

This means if you have Solflare or Backpack installed instead of Phantom, it will show up automatically. The `WalletMultiButton` component detects all installed wallets and lets the user pick.

## Your wallets right now

You have **two separate wallets**:

| Wallet | Address | Where | SOL |
|--------|---------|-------|-----|
| CLI keypair | `Eg4yxfELo5kyets2jQv83t9ET1MtS3hBeGSjHLyueB29` | `~/.config/solana/id.json` | ~8.3 SOL |
| Phantom | (your Phantom address) | Browser extension | 0 SOL (needs airdrop) |

They are different identities on the same network. The CLI keypair deployed the program and created catCoin. Phantom will interact with the Vault DApp frontend.
