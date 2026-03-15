# Transactions & Instructions

## One transaction, many instructions

A Solana transaction can contain **multiple instructions** bundled together. They all execute atomically — if any one fails, the entire transaction is rolled back.

When Solscan shows badges like `5+` or `2+`, it means that transaction contained multiple instructions:

```
Transaction (single atomic unit)
├── Instruction 1: createAccount (allocate space)
├── Instruction 2: initializeMint (set decimals, authority)
├── Instruction 3: assign (set owner program)
└── ...
```

The `spl-token` CLI bundles these automatically. In Project 2 (Anchor), you'll compose instructions yourself.

## mintToChecked vs mintTo

Same operation, but `mintToChecked` requires confirming the expected decimals as a safety check:

```
mintTo:        "mint 1000000 tokens"                  (trusts the caller)
mintToChecked: "mint 1000000 tokens, expect 9 decimals" (double-checks)
```

Prevents accidentally minting a wrong amount if you're confused about decimals. The CLI uses `mintToChecked` by default. No functional difference.

## Transaction fees

Every transaction costs a small fee paid to validators:

| Instructions in tx | Typical fee |
|-------------------|-------------|
| 1-2 instructions | ~0.000005 SOL |
| 3-5 instructions | ~0.00001 SOL |

Fee scales slightly with the number of instructions/signers, but stays tiny.
