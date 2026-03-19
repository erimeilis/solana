import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { expect } from "chai";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";

describe("vault", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.vault as Program<Vault>;

  // The vault config account — we'll generate a fresh one for each test suite run
  const vaultAccount = Keypair.generate();

  // Derive the vault PDA that will hold SOL
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_pda"), vaultAccount.publicKey.toBuffer()],
    program.programId
  );

  // The main user (test wallet provided by Anchor)
  const user = provider.wallet;

  // Derive the user's deposit tracker PDA
  const [userAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("user"),
      vaultAccount.publicKey.toBuffer(),
      user.publicKey.toBuffer(),
    ],
    program.programId
  );

  // A second user for testing unauthorized withdrawal
  const otherUser = Keypair.generate();
  const [otherUserAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("user"),
      vaultAccount.publicKey.toBuffer(),
      otherUser.publicKey.toBuffer(),
    ],
    program.programId
  );

  it("initializes the vault", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        vault: vaultAccount.publicKey,
        authority: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([vaultAccount])
      .rpc();

    console.log("Initialize tx:", tx);

    // Verify the vault account was created correctly
    const vault = await program.account.vault.fetch(vaultAccount.publicKey);
    expect(vault.authority.toString()).to.equal(user.publicKey.toString());
    expect(vault.totalDeposited.toNumber()).to.equal(0);
  });

  it("deposits SOL into the vault", async () => {
    const depositAmount = 1 * LAMPORTS_PER_SOL; // 1 SOL

    // Get balance before deposit
    const balanceBefore = await provider.connection.getBalance(
      user.publicKey
    );

    const tx = await program.methods
      .deposit(new anchor.BN(depositAmount))
      .accounts({
        user: user.publicKey,
        vault: vaultAccount.publicKey,
        userAccount: userAccount,
        vaultPda: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Deposit tx:", tx);

    // Verify user account tracks the deposit
    const userAcc = await program.account.userAccount.fetch(userAccount);
    expect(userAcc.deposited.toNumber()).to.equal(depositAmount);
    expect(userAcc.owner.toString()).to.equal(user.publicKey.toString());

    // Verify vault total updated
    const vault = await program.account.vault.fetch(vaultAccount.publicKey);
    expect(vault.totalDeposited.toNumber()).to.equal(depositAmount);

    // Verify SOL actually moved to vault PDA
    const vaultPdaBalance = await provider.connection.getBalance(vaultPda);
    expect(vaultPdaBalance).to.equal(depositAmount);

    // Verify user lost SOL (deposit + fees)
    const balanceAfter = await provider.connection.getBalance(user.publicKey);
    expect(balanceAfter).to.be.lessThan(balanceBefore - depositAmount);
  });

  it("deposits more SOL (accumulates)", async () => {
    const depositAmount = 0.5 * LAMPORTS_PER_SOL; // 0.5 SOL

    await program.methods
      .deposit(new anchor.BN(depositAmount))
      .accounts({
        user: user.publicKey,
        vault: vaultAccount.publicKey,
        userAccount: userAccount,
        vaultPda: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Verify deposits accumulated: 1 + 0.5 = 1.5 SOL
    const userAcc = await program.account.userAccount.fetch(userAccount);
    expect(userAcc.deposited.toNumber()).to.equal(1.5 * LAMPORTS_PER_SOL);

    const vault = await program.account.vault.fetch(vaultAccount.publicKey);
    expect(vault.totalDeposited.toNumber()).to.equal(1.5 * LAMPORTS_PER_SOL);
  });

  it("withdraws SOL from the vault", async () => {
    const withdrawAmount = 0.5 * LAMPORTS_PER_SOL; // 0.5 SOL

    const balanceBefore = await provider.connection.getBalance(user.publicKey);

    const tx = await program.methods
      .withdraw(new anchor.BN(withdrawAmount))
      .accounts({
        user: user.publicKey,
        vault: vaultAccount.publicKey,
        userAccount: userAccount,
        vaultPda: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Withdraw tx:", tx);

    // Verify user account decreased: 1.5 - 0.5 = 1.0 SOL
    const userAcc = await program.account.userAccount.fetch(userAccount);
    expect(userAcc.deposited.toNumber()).to.equal(1 * LAMPORTS_PER_SOL);

    // Verify vault total decreased
    const vault = await program.account.vault.fetch(vaultAccount.publicKey);
    expect(vault.totalDeposited.toNumber()).to.equal(1 * LAMPORTS_PER_SOL);

    // Verify user got SOL back
    const balanceAfter = await provider.connection.getBalance(user.publicKey);
    expect(balanceAfter).to.be.greaterThan(balanceBefore);
  });

  it("fails to withdraw more than deposited", async () => {
    const tooMuch = 999 * LAMPORTS_PER_SOL;

    try {
      await program.methods
        .withdraw(new anchor.BN(tooMuch))
        .accounts({
          user: user.publicKey,
          vault: vaultAccount.publicKey,
          userAccount: userAccount,
          vaultPda: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // If we get here, the test should fail
      expect.fail("Should have thrown InsufficientFunds error");
    } catch (err) {
      expect(err.toString()).to.include("InsufficientFunds");
    }
  });

  it("fails to deposit zero", async () => {
    try {
      await program.methods
        .deposit(new anchor.BN(0))
        .accounts({
          user: user.publicKey,
          vault: vaultAccount.publicKey,
          userAccount: userAccount,
          vaultPda: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      expect.fail("Should have thrown InvalidAmount error");
    } catch (err) {
      expect(err.toString()).to.include("InvalidAmount");
    }
  });

  it("fails when wrong user tries to withdraw", async () => {
    // Fund otherUser via transfer (airdrop can fail on local validator)
    const transferTx = new anchor.web3.Transaction().add(
      SystemProgram.transfer({
        fromPubkey: user.publicKey,
        toPubkey: otherUser.publicKey,
        lamports: 1 * LAMPORTS_PER_SOL,
      })
    );
    await provider.sendAndConfirm(transferTx);

    // otherUser tries to withdraw from OUR user account — should fail
    // The PDA seeds won't match because they include user.key(), not otherUser.key()
    // So Anchor will reject with a seeds constraint error
    try {
      await program.methods
        .withdraw(new anchor.BN(0.1 * LAMPORTS_PER_SOL))
        .accounts({
          user: otherUser.publicKey,
          vault: vaultAccount.publicKey,
          userAccount: userAccount, // OUR account, not theirs
          vaultPda: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([otherUser])
        .rpc();

      expect.fail("Should have thrown an error");
    } catch (err) {
      // Seeds constraint will fail — the PDA derived from otherUser's key
      // won't match userAccount (which was derived from our key)
      expect(err.toString()).to.include("Error");
    }
  });
});
