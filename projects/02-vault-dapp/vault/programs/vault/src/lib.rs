use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("5FejKgQNfWe677DxbEpiyZeoRNyQEZfL1pU7Nixtz7Yh");

#[program]
pub mod vault {
    use super::*;

    /// Creates the vault. Whoever calls this becomes the authority.
    /// The vault PDA will hold deposited SOL.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.total_deposited = 0;
        msg!("Vault initialized by {}", vault.authority);
        Ok(())
    }

    /// User deposits SOL into the vault PDA.
    /// A UserAccount PDA tracks how much this specific user deposited.
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        // Can't deposit zero
        require!(amount > 0, VaultError::InvalidAmount);

        // CPI: call System Program to transfer SOL from user to vault PDA
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.vault_pda.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        // Update the user's deposit record
        let user_account = &mut ctx.accounts.user_account;
        user_account.owner = ctx.accounts.user.key();
        user_account.deposited = user_account.deposited.checked_add(amount)
            .ok_or(VaultError::Overflow)?;

        // Update vault total
        let vault = &mut ctx.accounts.vault;
        vault.total_deposited = vault.total_deposited.checked_add(amount)
            .ok_or(VaultError::Overflow)?;

        msg!("{} deposited {} lamports", ctx.accounts.user.key(), amount);
        Ok(())
    }

    /// User withdraws SOL from the vault PDA back to their wallet.
    /// Can only withdraw up to what they deposited.
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        // Can't withdraw zero
        require!(amount > 0, VaultError::InvalidAmount);

        // Can't withdraw more than deposited
        require!(
            ctx.accounts.user_account.deposited >= amount,
            VaultError::InsufficientFunds
        );

        // Transfer SOL from vault PDA back to user via CPI.
        // The vault PDA has no private key — we prove ownership with seeds.
        let vault_key = ctx.accounts.vault.key();
        let bump = ctx.bumps.vault_pda;
        let signer_seeds: &[&[&[u8]]] = &[&[b"vault_pda", vault_key.as_ref(), &[bump]]];

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.vault_pda.to_account_info(),
                to: ctx.accounts.user.to_account_info(),
            },
            signer_seeds,
        );
        system_program::transfer(cpi_context, amount)?;

        // Update the user's deposit record
        let user_account = &mut ctx.accounts.user_account;
        user_account.deposited = user_account.deposited.checked_sub(amount)
            .ok_or(VaultError::Overflow)?;

        // Update vault total
        let vault = &mut ctx.accounts.vault;
        vault.total_deposited = vault.total_deposited.checked_sub(amount)
            .ok_or(VaultError::Overflow)?;

        msg!("{} withdrew {} lamports", ctx.accounts.user.key(), amount);
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Account validation structs — Anchor checks these BEFORE your code runs
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// The vault config account — stores authority and total deposits.
    /// `init` = create it now, `payer` = authority pays rent.
    /// `space` = 8 (discriminator) + 32 (Pubkey) + 8 (u64) = 48 bytes.
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8
    )]
    pub vault: Account<'info, Vault>,

    /// Whoever initializes the vault becomes the authority.
    /// `mut` because they pay for the vault account's rent.
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Required by `init` — the System Program creates the account.
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    /// The user depositing SOL. Must sign the transaction.
    #[account(mut)]
    pub user: Signer<'info>,

    /// The vault config account — we update total_deposited.
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    /// Per-user deposit tracker. PDA derived from ["user", vault, user_pubkey].
    /// `init_if_needed` = create on first deposit, reuse on subsequent deposits.
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 8,
        seeds = [b"user", vault.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,

    /// The vault PDA that holds the actual SOL.
    /// Derived from ["vault_pda", vault_pubkey].
    /// CHECK: This is a PDA used only to hold SOL — no data to deserialize.
    #[account(
        mut,
        seeds = [b"vault_pda", vault.key().as_ref()],
        bump
    )]
    pub vault_pda: UncheckedAccount<'info>,

    /// Required for creating accounts and transferring SOL via CPI.
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    /// The user withdrawing SOL. Must sign the transaction.
    #[account(mut)]
    pub user: Signer<'info>,

    /// The vault config account — we update total_deposited.
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    /// Per-user deposit tracker. Must exist (they must have deposited before).
    /// `has_one = owner` verifies that user_account.owner == user.key().
    #[account(
        mut,
        seeds = [b"user", vault.key().as_ref(), user.key().as_ref()],
        bump,
        constraint = user_account.owner == user.key() @ VaultError::Unauthorized
    )]
    pub user_account: Account<'info, UserAccount>,

    /// The vault PDA that holds SOL. Same derivation as in Deposit.
    /// CHECK: PDA used only to hold SOL.
    #[account(
        mut,
        seeds = [b"vault_pda", vault.key().as_ref()],
        bump
    )]
    pub vault_pda: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

// ---------------------------------------------------------------------------
// Data structures — what we store on-chain
// ---------------------------------------------------------------------------

/// The vault's config account. One per vault.
#[account]
pub struct Vault {
    /// Who created the vault
    pub authority: Pubkey,     // 32 bytes
    /// Total SOL deposited across all users (in lamports)
    pub total_deposited: u64,  // 8 bytes
}

/// Per-user deposit record. One per user per vault. PDA.
#[account]
pub struct UserAccount {
    /// The user who owns this deposit record
    pub owner: Pubkey,      // 32 bytes
    /// How much this user has deposited (in lamports)
    pub deposited: u64,     // 8 bytes
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[error_code]
pub enum VaultError {
    #[msg("Insufficient funds for withdrawal")]
    InsufficientFunds,
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    #[msg("Arithmetic overflow")]
    Overflow,
}
