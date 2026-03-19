# Anchor Framework

## Why Anchor exists

Writing raw Solana programs means manually handling:
- Account deserialization (reading binary data into Rust structs)
- Account validation (is this the right type? is it owned by the right program? did the right person sign?)
- Error handling (custom error codes, readable messages)
- Serialization (writing Rust structs back to binary)
- IDL generation (describing your program's API)

Anchor automates all of this with Rust macros (`#[program]`, `#[derive(Accounts)]`, `#[account]`).

## Raw Solana vs Anchor — same program

### Raw Solana (simplified — real code is even longer):
```rust
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint, entrypoint::ProgramResult,
    msg, program_error::ProgramError,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;

    // Manually check ownership
    if account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Manually deserialize
    let mut data = account.try_borrow_mut_data()?;
    let mut value = u64::from_le_bytes(data[0..8].try_into().unwrap());

    // Logic
    value += 1;

    // Manually serialize back
    data[0..8].copy_from_slice(&value.to_le_bytes());

    msg!("Counter: {}", value);
    Ok(())
}
```

### Same thing with Anchor:
```rust
use anchor_lang::prelude::*;

declare_id!("...");

#[program]
pub mod counter {
    use super::*;
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        ctx.accounts.counter.count += 1;
        msg!("Counter: {}", ctx.accounts.counter.count);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}

#[account]
pub struct Counter {
    pub count: u64,
}
```

Anchor handles ownership checks, deserialization, serialization, and validation. You just write the logic.

## Anchor CLI commands

| Command | What it does |
|---------|-------------|
| `anchor init <name>` | Create new project |
| `anchor build` | Compile program, generate IDL |
| `anchor test` | Build, deploy to local validator, run tests |
| `anchor deploy` | Deploy to configured cluster |
| `anchor keys list` | Show program keypair address |

## IDL (Interface Definition Language)

When you run `anchor build`, it generates a JSON file at `target/idl/vault.json`. This describes your program's API:

```json
{
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        { "name": "vault", "isMut": true, "isSigner": false },
        { "name": "authority", "isMut": true, "isSigner": true }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Vault",
      "type": {
        "fields": [
          { "name": "authority", "type": "publicKey" },
          { "name": "balance", "type": "u64" }
        ]
      }
    }
  ]
}
```

TypeScript clients import this IDL to get type-safe access to your program — they know exactly what instructions exist, what accounts each needs, and what arguments to pass.
