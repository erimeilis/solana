"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import idl from "@/lib/vault.json";
import type { Vault } from "@/lib/vault";

const PROGRAM_ID = new PublicKey(idl.address);

export const VaultApp: FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [vaultPublicKey, setVaultPublicKey] = useState<PublicKey | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [deposited, setDeposited] = useState<number | null>(null);
  const [vaultTotal, setVaultTotal] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Build Anchor program instance
  const getProgram = useCallback(() => {
    if (!wallet.publicKey) return null;
    const provider = new AnchorProvider(
      connection,
      wallet as any,
      AnchorProvider.defaultOptions()
    );
    return new Program<Vault>(idl as any, provider);
  }, [connection, wallet]);

  // Derive PDAs
  const getPDAs = useCallback(
    (vaultKey: PublicKey) => {
      if (!wallet.publicKey) return null;

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault_pda"), vaultKey.toBuffer()],
        PROGRAM_ID
      );

      const [userAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("user"),
          vaultKey.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        PROGRAM_ID
      );

      return { vaultPda, userAccount };
    },
    [wallet.publicKey]
  );

  // Fetch balances
  const refreshBalances = useCallback(async () => {
    if (!wallet.publicKey || !vaultPublicKey) return;

    const program = getProgram();
    if (!program) return;

    try {
      // SOL balance
      const sol = await connection.getBalance(wallet.publicKey);
      setSolBalance(sol / LAMPORTS_PER_SOL);

      // Vault total
      const vault = await program.account.vault.fetch(vaultPublicKey);
      setVaultTotal(vault.totalDeposited.toNumber() / LAMPORTS_PER_SOL);

      // User deposit
      const pdas = getPDAs(vaultPublicKey);
      if (!pdas) return;

      try {
        const userAcc = await program.account.userAccount.fetch(
          pdas.userAccount
        );
        setDeposited(userAcc.deposited.toNumber() / LAMPORTS_PER_SOL);
      } catch {
        // UserAccount doesn't exist yet (never deposited)
        setDeposited(0);
      }
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    }
  }, [wallet.publicKey, vaultPublicKey, connection, getProgram, getPDAs]);

  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  // Initialize vault
  const handleInitialize = useCallback(async () => {
    const program = getProgram();
    if (!program || !wallet.publicKey) return;

    setLoading(true);
    setStatus("Initializing vault...");

    try {
      const vaultKeypair = Keypair.generate();

      await program.methods
        .initialize()
        .accountsPartial({
          vault: vaultKeypair.publicKey,
          authority: wallet.publicKey,
        })
        .signers([vaultKeypair])
        .rpc();

      setVaultPublicKey(vaultKeypair.publicKey);
      setStatus(
        `Vault created: ${vaultKeypair.publicKey.toBase58().slice(0, 16)}...`
      );
      await refreshBalances();
    } catch (err: any) {
      console.error("Initialize failed:", err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [getProgram, wallet.publicKey, refreshBalances]);

  // Deposit
  const handleDeposit = useCallback(async () => {
    const program = getProgram();
    if (!program || !wallet.publicKey || !vaultPublicKey) return;

    const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    if (isNaN(lamports) || lamports <= 0) {
      setStatus("Enter a valid amount");
      return;
    }

    const pdas = getPDAs(vaultPublicKey);
    if (!pdas) return;

    setLoading(true);
    setStatus(`Depositing ${amount} SOL...`);

    try {
      await program.methods
        .deposit(new BN(lamports))
        .accountsPartial({
          user: wallet.publicKey,
          vault: vaultPublicKey,
          userAccount: pdas.userAccount,
          vaultPda: pdas.vaultPda,
        })
        .rpc();

      setStatus(`Deposited ${amount} SOL`);
      setAmount("");
      await refreshBalances();
    } catch (err: any) {
      console.error("Deposit failed:", err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [getProgram, wallet.publicKey, vaultPublicKey, amount, getPDAs, refreshBalances]);

  // Withdraw
  const handleWithdraw = useCallback(async () => {
    const program = getProgram();
    if (!program || !wallet.publicKey || !vaultPublicKey) return;

    const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    if (isNaN(lamports) || lamports <= 0) {
      setStatus("Enter a valid amount");
      return;
    }

    const pdas = getPDAs(vaultPublicKey);
    if (!pdas) return;

    setLoading(true);
    setStatus(`Withdrawing ${amount} SOL...`);

    try {
      await program.methods
        .withdraw(new BN(lamports))
        .accountsPartial({
          user: wallet.publicKey,
          vault: vaultPublicKey,
          userAccount: pdas.userAccount,
          vaultPda: pdas.vaultPda,
        })
        .rpc();

      setStatus(`Withdrew ${amount} SOL`);
      setAmount("");
      await refreshBalances();
    } catch (err: any) {
      console.error("Withdraw failed:", err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [getProgram, wallet.publicKey, vaultPublicKey, amount, getPDAs, refreshBalances]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-8">
      <header className="w-full max-w-md flex justify-between items-center mb-12">
        <h1 className="text-2xl font-bold">Vault DApp</h1>
        <WalletMultiButton />
      </header>

      {!wallet.connected ? (
        <p className="text-gray-400 text-lg">
          Connect your wallet to get started
        </p>
      ) : !vaultPublicKey ? (
        <div className="w-full max-w-md space-y-6">
          <div className="bg-gray-900 rounded-xl p-6 text-center">
            <p className="text-gray-400 mb-4">No vault found. Create one to start depositing SOL.</p>
            <button
              onClick={handleInitialize}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold w-full"
            >
              {loading ? "Creating..." : "Create Vault"}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-6">
          {/* Balances */}
          <div className="bg-gray-900 rounded-xl p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Your SOL Balance</span>
              <span className="font-mono">
                {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : "..."}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Your Deposit</span>
              <span className="font-mono text-green-400">
                {deposited !== null ? `${deposited.toFixed(4)} SOL` : "..."}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-800 pt-3">
              <span className="text-gray-400">Vault Total</span>
              <span className="font-mono text-purple-400">
                {vaultTotal !== null ? `${vaultTotal.toFixed(4)} SOL` : "..."}
              </span>
            </div>
          </div>

          {/* Amount input */}
          <div className="bg-gray-900 rounded-xl p-6 space-y-4">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount in SOL"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-600"
            />

            <div className="flex gap-3">
              <button
                onClick={handleDeposit}
                disabled={loading || !amount}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-3 rounded-lg font-semibold"
              >
                {loading ? "..." : "Deposit"}
              </button>
              <button
                onClick={handleWithdraw}
                disabled={loading || !amount}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-3 rounded-lg font-semibold"
              >
                {loading ? "..." : "Withdraw"}
              </button>
            </div>
          </div>

          {/* Status */}
          {status && (
            <div className="bg-gray-900 rounded-xl p-4 text-sm text-gray-300">
              {status}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
