# Anatomy of an Anchor Program

Every Anchor program has four parts:

```rust
// 1. PROGRAM ID — unique address of this program on-chain
declare_id!("YourProgramId...");

// 2. INSTRUCTIONS — functions users can call
#[program]
pub mod my_program {
    use super::*;

    pub fn do_something(ctx: Context<DoSomething>, arg: u64) -> Result<()> {
        // your logic
        Ok(())
    }
}

// 3. ACCOUNT VALIDATION — what accounts each instruction needs
#[derive(Accounts)]
pub struct DoSomething<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyData>,
    pub signer: Signer<'info>,
}

// 4. DATA STRUCTURES — what data you store on-chain
#[account]
pub struct MyData {
    pub value: u64,
}
```

## Part 1: `declare_id!`

Your program's address on Solana. Generated when you run `anchor init` or `anchor keys list`. Every deployed program has a unique address, just like every wallet or token mint.

## Part 2: `#[program]` — Instructions

Each `pub fn` inside `#[program]` becomes an instruction users can call. Every instruction:
- Takes `ctx: Context<SomeStruct>` as first argument — provides access to validated accounts
- Can take additional arguments (u64, String, etc.)
- Returns `Result<()>` — Ok or Error

```rust
pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    //          ↑ accounts struct        ↑ user-provided argument
    ctx.accounts.user_account.deposited += amount;
    Ok(())
}
```

## Part 3: `#[derive(Accounts)]` — Account Validation

This is Anchor's most powerful feature. You declare what accounts an instruction needs, and Anchor validates ALL of them before your code runs.

### Common account types

| Type | Meaning |
|------|---------|
| `Account<'info, T>` | Deserializes into type T, checks owner |
| `Signer<'info>` | Must have signed the transaction |
| `SystemAccount<'info>` | A regular wallet (no program data) |
| `Program<'info, T>` | A program (e.g. System Program) |
| `UncheckedAccount<'info>` | No validation — you must check manually (use `/// CHECK:` comment to explain why) |

### Common constraints (attributes)

| Constraint | Meaning |
|-----------|---------|
| `#[account(init, payer = x, space = n)]` | Create new account, x pays rent, n bytes |
| `#[account(mut)]` | Account will be modified |
| `#[account(seeds = [...], bump)]` | PDA — derived from these seeds |
| `#[account(has_one = authority)]` | Verify field matches another account |
| `#[account(close = recipient)]` | Close account, send rent to recipient |

### Example with comments

```rust
#[derive(Accounts)]
pub struct Deposit<'info> {
    // Must sign the transaction — proves identity
    #[account(mut)]
    pub user: Signer<'info>,

    // PDA derived from ["user", user_pubkey]
    // init_if_needed: create if first deposit, skip if already exists
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 8,
        seeds = [b"user", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,

    // The vault PDA that holds SOL
    // No type checking (UncheckedAccount) because it's just a SOL holder
    /// CHECK: PDA for holding SOL, validated by seeds
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault_pda: UncheckedAccount<'info>,

    // Required for creating accounts and transferring SOL
    pub system_program: Program<'info, System>,
}
```

## Part 4: `#[account]` — Data Structures

Define what data your program stores. Anchor handles serialization (Rust struct → bytes on-chain) and deserialization (bytes → Rust struct) automatically using Borsh encoding.

```rust
#[account]
pub struct UserAccount {
    pub owner: Pubkey,    // 32 bytes
    pub deposited: u64,   // 8 bytes
}
// Space needed: 8 (discriminator) + 32 + 8 = 48 bytes
```

### Space calculation

Every `#[account]` struct needs a `space` value when creating it:

| Type | Size |
|------|------|
| Discriminator (always) | 8 bytes |
| bool | 1 byte |
| u8 / i8 | 1 byte |
| u16 / i16 | 2 bytes |
| u32 / i32 | 4 bytes |
| u64 / i64 | 8 bytes |
| u128 / i128 | 16 bytes |
| Pubkey | 32 bytes |
| String | 4 + length |
| Vec<T> | 4 + (count × size_of_T) |
| Option<T> | 1 + size_of_T |

The **discriminator** is an 8-byte hash Anchor adds to identify the account type. It prevents one instruction from accidentally reading an account meant for another.
