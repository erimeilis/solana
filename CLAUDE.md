# Solana Learning Project

## Project Overview
Personal learning repository for Solana blockchain development. Contains progressive projects from beginner to advanced.

## Tech Stack
- **Smart Contracts**: Rust + Anchor framework
- **Frontend**: TypeScript, Next.js, React
- **Wallet**: @solana/wallet-adapter
- **NFTs**: Metaplex, Umi SDK
- **Testing**: Solana Test Validator, Surfpool

## Project Structure
```
solana/
├── docs/                    # Learning documentation
├── projects/
│   ├── 01-token-creator/    # Project 1: SPL Token creation
│   ├── 02-vault-dapp/       # Project 2: Deposit/withdraw vault
│   └── 03-nft-platform/     # Project 3: NFT minting dApp
└── scripts/                 # Utility scripts
```

## Development Rules

### Solana-Specific
- Always use devnet for testing (never mainnet without explicit confirmation)
- Use Anchor framework for all smart contracts
- Follow Solana account model patterns (PDAs, ATAs)
- Test with `anchor test` before deployment

### Code Style
- Rust: Follow Rust conventions, use `cargo fmt` and `cargo clippy`
- TypeScript: Use strict mode, proper typing for Solana types
- Use camelCase for TypeScript, snake_case for Rust

### Commands
```bash
# Solana CLI
solana config set --url devnet     # Switch to devnet
solana airdrop 2                   # Get test SOL
solana balance                     # Check balance

# Anchor
anchor build                       # Build programs
anchor test                        # Run tests
anchor deploy                      # Deploy to configured cluster

# Local development
solana-test-validator              # Start local validator
```

## Environment
- Network: devnet (default), localnet for testing
- Wallet: ~/.config/solana/id.json (devnet keypair)

## Resources
- [Solana Docs](https://solana.com/developers)
- [Anchor Book](https://www.anchor-lang.com/)
- [Solana Playground](https://beta.solpg.io/)
