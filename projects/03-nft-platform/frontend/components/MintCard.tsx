"use client";

import { MINT_LIMIT_PER_WALLET, MINT_PRICE_SOL, TOTAL_SUPPLY } from "@/lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";

type Props = {
  itemsMinted: number;
  walletMintCount: number;
  isMinting: boolean;
  message: { text: string; type: "success" | "error" | "info" } | null;
  onMint: () => void;
};

export function MintCard({
  itemsMinted,
  walletMintCount,
  isMinting,
  message,
  onMint,
}: Props) {
  const wallet = useWallet();
  const remaining = TOTAL_SUPPLY - itemsMinted;
  const isSoldOut = remaining <= 0;
  const limitReached = walletMintCount >= MINT_LIMIT_PER_WALLET;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-300 mb-2">
          <span>Minted</span>
          <span>
            {itemsMinted} / {TOTAL_SUPPLY}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(itemsMinted / TOTAL_SUPPLY) * 100}%` }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6 text-sm">
        <Row label="Price" value={`${MINT_PRICE_SOL} SOL`} />
        <Row label="Remaining" value={String(remaining)} />
        <Row
          label="Your Mints"
          value={
            wallet.publicKey
              ? `${walletMintCount} / ${MINT_LIMIT_PER_WALLET}`
              : "-"
          }
        />
      </div>

      {/* Mint Button */}
      {!wallet.publicKey ? (
        <p className="text-center text-slate-400 text-sm py-4">
          Connect your wallet to mint
        </p>
      ) : isSoldOut ? (
        <p className="text-center text-amber-400 font-bold py-4">SOLD OUT</p>
      ) : limitReached ? (
        <p className="text-center text-amber-400 font-bold py-4">
          Wallet mint limit reached
        </p>
      ) : (
        <button
          onClick={onMint}
          disabled={isMinting}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:from-amber-300 hover:to-orange-400 active:scale-[0.98] disabled:opacity-50 disabled:hover:from-amber-400 disabled:hover:to-orange-500"
          style={
            !isMinting
              ? { animation: "pulse-glow 3s ease-in-out infinite" }
              : undefined
          }
        >
          {isMinting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full" />
              Minting...
            </span>
          ) : (
            `Mint for ${MINT_PRICE_SOL} SOL`
          )}
        </button>
      )}

      {/* Status Message */}
      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm text-center transition-all ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : message.type === "error"
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
          }`}
          style={{ animation: "fade-in 0.3s ease-out" }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
