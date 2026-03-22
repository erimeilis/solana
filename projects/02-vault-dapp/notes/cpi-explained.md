# CPI — Cross-Program Invocation

## What is CPI?

Your program can call other programs. That's a CPI. In our vault:
- Our **Vault program** calls the **System Program** to transfer SOL

It's like calling a function in another library — except the "library" is another on-chain program.

```
User calls:    Vault Program::deposit(1 SOL)
                    │
                    └── Vault Program calls:  System Program::transfer(1 SOL)
                                              (from user wallet → vault PDA)
```

## Why CPI?

You can't transfer SOL directly from your program — the System Program owns all wallet accounts. Only it can move SOL. So your program asks it politely via CPI.

Same for tokens: to transfer SPL tokens, your program would CPI into the SPL Token Program.

## How CPI works in Anchor

```rust
// Build a CPI context — "I want to call System Program's transfer"
let cpi_context = CpiContext::new(
    ctx.accounts.system_program.to_account_info(),  // which program to call
    anchor_lang::system_program::Transfer {          // which instruction
        from: ctx.accounts.user.to_account_info(),   // from user
        to: ctx.accounts.vault_pda.to_account_info(), // to vault PDA
    },
);

// Execute the CPI
anchor_lang::system_program::transfer(cpi_context, amount)?;
```

## CPI with PDA signing

When the **vault PDA** needs to send SOL back (withdrawal), it has no private key — so how does it "sign"? The program uses `CpiContext::new_with_signer` and provides the seeds used to derive the PDA:

```rust
let seeds = &[b"vault".as_ref(), &[bump]];
let signer_seeds = &[&seeds[..]];

let cpi_context = CpiContext::new_with_signer(
    ctx.accounts.system_program.to_account_info(),
    Transfer {
        from: ctx.accounts.vault_pda.to_account_info(),
        to: ctx.accounts.user.to_account_info(),
    },
    signer_seeds,  // proves the program derived this PDA
);
```

The Solana runtime verifies: "Yes, these seeds + this program ID produce this PDA address." That's the proof. No private key needed.

## CPI depth limit

Solana allows up to **4 levels** of CPI depth (program A calls B calls C calls D). Our vault only goes 1 level deep (Vault → System Program), so this isn't a concern here.
