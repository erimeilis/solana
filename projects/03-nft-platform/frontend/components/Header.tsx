"use client";

import dynamic from "next/dynamic";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export function Header() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!wallet.publicKey) {
      setBalance(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const lamports = await connection.getBalance(wallet.publicKey!);
        if (!cancelled) setBalance(lamports / LAMPORTS_PER_SOL);
      } catch {
        if (!cancelled) setBalance(null);
      }
    };

    load();
    const id = connection.onAccountChange(wallet.publicKey, (info) => {
      if (!cancelled) setBalance(info.lamports / LAMPORTS_PER_SOL);
    });

    return () => {
      cancelled = true;
      connection.removeAccountChangeListener(id);
    };
  }, [connection, wallet.publicKey]);

  return (
    <header className="flex items-center justify-between p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
        Cool Cats
      </h1>
      <div className="flex items-center gap-3">
        {balance !== null && (
          <span className="hidden sm:inline text-sm text-slate-400">
            {balance.toFixed(2)} SOL
          </span>
        )}
        <WalletMultiButton />
      </div>
    </header>
  );
}
