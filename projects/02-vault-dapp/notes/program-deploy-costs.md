# Program Deploy Costs

## Our vault deployment

```
Binary size:        232 KB
On-chain allocated: 237 KB (headers + metadata)
Rent cost:          1.656 SOL (~$165 at $100/SOL)
IDL upload:         additional small cost
```

By default, Solana allocates **2x** the binary size for the program buffer — room for future upgrades. So even a 232KB binary may occupy ~464KB of on-chain space.

## Why so expensive compared to token accounts?

| What | Size | Rent |
|------|------|------|
| Token Account | 165 bytes | 0.002 SOL |
| Mint Account | 82 bytes | 0.001 SOL |
| **Program binary** | **~232 KB** | **~1.656 SOL** |

Programs are 1000x+ larger than data accounts. And rent scales linearly with size.

## Ways to reduce cost

### 1. Limit buffer size with `--max-len`

Don't allocate 2x if you don't need room for upgrades:
```bash
solana program deploy target/deploy/vault.so --max-len 237808
```

### 2. Make program non-upgradeable + reclaim rent

If the program is final and will never change:
```bash
# Renounce upgrade authority (IRREVERSIBLE)
solana program set-upgrade-authority <PROGRAM_ID> --final

# Close buffer accounts to reclaim SOL
solana program close --buffers
```

### 3. Optimize binary size at compile time

```toml
# Add to Cargo.toml
[profile.release]
opt-level = "z"      # optimize for size instead of speed
lto = true           # link-time optimization
strip = true         # strip debug symbols
```

### 4. Skip on-chain IDL

The IDL (API description) is uploaded on-chain by default. You can host it off-chain instead to save a small amount.

### 5. Close unused buffer accounts

Failed deploys or upgrades leave buffer accounts behind. Each one holds rent:
```bash
# List buffers
solana program show --buffers

# Close them and reclaim SOL
solana program close --buffers
```

## Rent is recoverable

Unlike transaction fees (which are burned), rent is a **deposit**. If you close the program account, all rent SOL returns to you. So deploying isn't "spending" — it's more like locking funds.

## Mainnet reality

On devnet: free (airdrop SOL).
On mainnet at $100/SOL: ~$165 for our small vault program. Larger programs (DEXes, lending protocols) can cost thousands. But for teams building DeFi products handling millions in TVL, this is trivial.
