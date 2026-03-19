# Phantom Wallet Setup for Devnet

## Install

Chrome Web Store: https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa

## Switch to Devnet

1. Tap your **profile avatar** (top-left corner)
2. Tap **Settings** (gear icon)
3. Tap **Developer Settings**
4. Turn on **Testnet Mode**
5. Tap **Solana** and select **Devnet**

You'll see a banner: "You are currently in Testnet Mode."

To go back to mainnet: same path, turn off Testnet Mode.

## Get Devnet SOL (REQUIRED before using dApps)

Phantom starts with **0 SOL on devnet**. You MUST airdrop before interacting with any dApp — every transaction needs SOL to pay fees and rent.

1. In Phantom, click **Receive** → copy your Solana address
2. Go to https://faucet.solana.com
3. Paste your Phantom address
4. Request airdrop

Without devnet SOL, Phantom will show "insufficient SOL" and refuse to confirm transactions.

## Why a separate wallet?

Your CLI keypair (`~/.config/solana/id.json`) and Phantom are **different wallets** with different addresses and separate balances:

| Wallet | Used for | SOL balance |
|--------|----------|-------------|
| CLI keypair (`Eg4y...B29`) | Terminal commands, deploying programs | ~8.3 SOL |
| Phantom (your Phantom address) | Browser dApps, signing in frontend | 0 SOL (needs airdrop!) |

When you use the Vault DApp frontend, **Phantom** signs the transactions — so Phantom's address is the "user" in the vault, not your CLI keypair. They are two separate identities on the same network.

Sources:
- https://help.phantom.com/hc/en-us/articles/28951369255699-Use-developer-settings-in-Phantom
- https://docs.phantom.com/developer-powertools/testnet-mode
