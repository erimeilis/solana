# DeFi Concepts: Staking, Lending, Escrow, DAOs

**DeFi = Decentralized Finance** — financial services built on blockchain instead of banks. No middlemen, no opening hours, no permission needed. Just programs (smart contracts) that anyone can use.

## Staking

**What**: You lock up your tokens to help secure the network or a protocol, and earn rewards in return.

**Traditional analogy**: A fixed deposit at a bank. You lock money for a period, bank uses it, you earn interest.

**How it works on Solana**:
```
You: "Here's 100 SOL, I'm staking it"
     │
     └──▶ Validator uses your stake to participate in consensus
          (more stake = more voting power = more trusted)
          │
          └──▶ You earn ~7% APY in SOL rewards
```

**Why it exists**: Solana uses Proof of Stake — validators need SOL staked to them to participate. More stake = the network trusts them more. Stakers earn rewards for contributing to network security.

**Real examples on Solana**:
- **Native staking**: Stake SOL directly to a validator
- **Marinade Finance**: Liquid staking — you stake SOL, get mSOL back (tradeable receipt). You earn yield AND can still use mSOL in DeFi
- **Jito**: MEV-aware staking with extra rewards

## Lending / Borrowing

**What**: Deposit assets to earn interest. Borrow assets by putting up collateral.

**Traditional analogy**: A bank that gives you a loan, but requires your house as collateral. If you can't repay, they take the house.

**How it works on-chain**:
```
Lender (Alice):                          Borrower (Bob):
"I deposit 1000 USDC into the pool"      "I deposit 10 SOL as collateral"
     │                                        │
     └──▶ Lending Pool (vault) ◀──────────────┘
          │                                    │
          └── Alice earns 5% APY               └── Bob borrows 500 USDC
                                                   (must keep collateral > loan)
                                                   │
                                                   └── If SOL price drops too much:
                                                       AUTOMATIC LIQUIDATION
                                                       (pool sells Bob's SOL to repay)
```

**Why on-chain?**: No bank decides whether Bob gets a loan. No credit score. If the math works (collateral > loan), the program approves it instantly. Liquidation is automatic — no lawyers, no courts.

**Real examples on Solana**:
- **MarginFi**: Lending/borrowing with multiple asset types
- **Kamino**: Lending with automated yield strategies
- **Solend**: One of the first Solana lending protocols

## Escrow

**What**: A trusted third party holds funds until both sides fulfill their obligations. On-chain, the "third party" is the program.

**Traditional analogy**: Buying a house — your money goes to an escrow agent who holds it until paperwork is done, then releases it to the seller.

**How it works on-chain**:
```
Buyer:                              Seller:
"I want to buy this NFT for 5 SOL"  "I want to sell it"
     │                                   │
     └──▶ Escrow Program ◀───────────────┘
          │
          ├── Buyer deposits 5 SOL
          ├── Seller deposits NFT
          │
          └── Program checks both sides deposited
              │
              ├── YES → Swap: NFT to Buyer, SOL to Seller
              └── TIMEOUT → Return everything to original owners
```

**Why on-chain?**: No trusted third party needed. The program can't cheat, run away, or go bankrupt. The swap either happens correctly or it doesn't happen at all — atomically (all or nothing in a single transaction).

**Real examples**:
- Every DEX (decentralized exchange) uses escrow under the hood
- NFT marketplaces: Magic Eden, Tensor
- Freelance platforms: deposit payment in escrow, release when work is delivered

## DAO (Decentralized Autonomous Organization)

**What**: An organization where decisions are made by token holders voting on-chain, not by a CEO or board of directors.

**Traditional analogy**: A company where every shareholder votes on every decision, and the votes are executed automatically. No board can override the shareholders.

**How it works**:
```
DAO Treasury (vault):
├── Holds: 500,000 USDC (community funds)
│
├── Proposal #42: "Pay developer 5000 USDC for new feature"
│   ├── Vote: 73% YES, 27% NO
│   └── Result: PASSED → Program automatically sends 5000 USDC to developer
│
├── Proposal #43: "Buy 100 SOL for treasury"
│   ├── Vote: 45% YES, 55% NO
│   └── Result: REJECTED → Nothing happens
│
└── Rules (enforced by program, not people):
    ├── Quorum: 30% of token holders must vote
    ├── Threshold: 60% must say YES
    └── Timelock: 48 hours between passing and execution
```

**Why on-chain?**: The treasury is a vault controlled by the program. The program only releases funds when a vote passes. No single person has the keys. No one can embezzle. The rules are public and enforced by code.

**Real examples on Solana**:
- **Realms**: Solana's DAO governance platform
- **Jupiter DAO**: Governs the Jupiter DEX (biggest swap aggregator on Solana)
- **Marinade DAO**: Governs the Marinade staking protocol

## How they all connect

All of these are variations of the vault pattern:

```
Staking:   deposit tokens → vault holds → release with rewards
Lending:   deposit collateral → vault holds → borrow against it
Escrow:    both sides deposit → vault holds → swap when conditions met
DAO:       community deposits → vault holds → release by vote
```

That's why we're building a vault — it's the foundation for everything in DeFi.
