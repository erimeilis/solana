# Transaction Atomicity on Solana

## The guarantee

Every Solana transaction is **atomic** — all state changes commit together, or none of them do. This is guaranteed by the **Solana runtime** (the validator software), not by Anchor or your code.

If anything fails at any point — an error, a panic, running out of compute units — ALL changes are rolled back as if nothing happened.

```
deposit instruction:
  1. Transfer SOL to vault         ✅
  2. Update user_account           ✅
  3. Update vault.total_deposited  ❌ fails
     │
     └── ENTIRE transaction rolls back
         - SOL returns to user
         - user_account reverts
         - nothing happened on-chain
```

## How it works under the hood

Your program doesn't write to the blockchain directly. The Solana runtime:

1. **Loads** all accounts into memory (copies)
2. **Runs** your program, which modifies the in-memory copies
3. **Checks** the result:
   - `Ok(())` → writes ALL modified copies back to chain (commit)
   - `Err(..)` → discards ALL modified copies (rollback)
   - Panic → discards everything
   - Out of compute units → discards everything

```
┌─────────────────────────────────────────────────┐
│  Solana Runtime (validator)                     │
│                                                 │
│  1. Load accounts → memory copies               │
│  2. Execute program on copies                   │
│  3. Program returns Ok or Err                   │
│     ├── Ok  → write copies to blockchain        │
│     └── Err → throw away copies                 │
│                                                 │
│  This happens REGARDLESS of what framework      │
│  you use (Anchor, raw Solana, anything)         │
└─────────────────────────────────────────────────┘
```

Nothing in your code "saves" as it goes. When you write:
```rust
user_account.deposited += amount;    // modifies in-memory copy
vault.total_deposited += amount;     // modifies in-memory copy
```
These are changes to RAM, not to the blockchain. Only the Solana runtime decides when (and whether) to persist them.

## What is Solana vs what is Anchor

| Responsibility | Who handles it |
|---------------|----------------|
| Transaction atomicity (all-or-nothing) | **Solana runtime** |
| Account loading and persistence | **Solana runtime** |
| Compute unit limits | **Solana runtime** |
| Account validation (types, signers, owners) | **Anchor** (generates checks) |
| Serialization / deserialization | **Anchor** (uses Borsh) |
| IDL generation | **Anchor** |
| Boilerplate reduction | **Anchor** |

Anchor makes writing programs easier. Solana makes them safe (atomic). They do different jobs.

## Why checked_add still matters

If atomicity is guaranteed, why bother with `checked_add`?

Because atomicity means "all or nothing" — it doesn't mean "correct." If `u64::MAX + 1` silently overflows to `0`, Solana will happily commit that wrong value. The transaction "succeeded" with bad data.

`checked_add` catches the overflow and returns an error → triggers rollback → no bad data committed.

```
Regular add:   u64::MAX + 1 = 0        → Solana commits 0 (WRONG but "success")
checked_add:   u64::MAX + 1 = Err(...)  → Solana rolls back (CORRECT)
```

Atomicity prevents partial updates. Checked math prevents incorrect updates. Both are needed.

## Comparison with traditional apps

| | Traditional server | Solana |
|--|-------------------|--------|
| Atomicity | You implement it (DB transactions, try/catch) | Free — runtime guarantees it |
| Partial failures | Possible if you forget transaction handling | Impossible — all or nothing |
| Rollback | Manual (compensating transactions, saga pattern) | Automatic |
| Data corruption | Possible from bugs in rollback logic | Impossible from partial writes |

This is one of the biggest advantages of building on blockchain — you get database-level transaction guarantees for free, enforced by the protocol.
