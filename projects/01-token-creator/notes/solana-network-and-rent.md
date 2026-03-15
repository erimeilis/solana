# Solana Network & Rent

## What is the Solana network?

~1400+ real computers (**validators**) worldwide, all running the same software and agreeing on every transaction. When you create an account or send a transaction, it's processed and stored by ALL of them simultaneously.

```
┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐
│Validator 1│  │Validator 2│  │Validator 3│  │   ...    │
│ Tokyo     │  │ Frankfurt │  │ New York  │  │  ~1400+  │
└─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬────┘
      └──────────────┴──────┬───────┴──────────────┘
                            │
                   ALL store the SAME copy
                   of ALL data and agree
                   on every transaction
```

**Who runs validators?** Companies, individuals, anyone willing to run a powerful server. They earn SOL rewards (transaction fees + inflation).

## What is "space on the blockchain"?

Literally **bytes stored on all validators' hard drives**. Your Mint Account is 82 bytes, but it's replicated across ~1400 machines worldwide.

## Is rent "real server rent"?

Yes. Validators are real servers with real costs (hardware, electricity, bandwidth). The rent compensates the network for keeping your data alive on all machines forever.

The difference from normal hosting:
- **Normal server**: 1 machine, 1 company (AWS, Hetzner)
- **Blockchain**: ~1400 independent machines worldwide. Nobody can delete, censor, or change your data without your private key

That's what you pay for — **permanent, uncensorable, globally replicated storage**.

## Rent amounts

Rent is a **one-time deposit** (rent-exempt). Pay once, data stays forever.

| What | Size | Rent |
|------|------|------|
| Mint Account | 82 bytes | ~0.0015 SOL |
| Token Account | 165 bytes | ~0.002 SOL |
| Anchor program | few KB | ~0.01-0.1 SOL |
| Transaction fee | — | ~0.000005 SOL per tx |
