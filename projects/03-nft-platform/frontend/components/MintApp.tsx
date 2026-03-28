"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  mplCandyMachine,
  fetchCandyMachine,
  fetchCandyGuard,
  mintV2,
} from "@metaplex-foundation/mpl-candy-machine";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import {
  generateSigner,
  transactionBuilder,
  some,
} from "@metaplex-foundation/umi";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import {
  CANDY_MACHINE_ID,
  COLLECTION_IMAGE,
  TREASURY,
  MINT_LIMIT_PER_WALLET,
  TOTAL_SUPPLY,
  RPC_ENDPOINT,
} from "@/lib/constants";
import { Header } from "./Header";
import { MintCard } from "./MintCard";
import { NftGallery } from "./NftGallery";

type NftDisplay = {
  mint: string;
  name: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
};

const TOKEN_METADATA_PROGRAM = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

function getMetadataPda(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM
  );
  return pda;
}

export function MintApp() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [itemsMinted, setItemsMinted] = useState(0);
  const [walletMintCount, setWalletMintCount] = useState(0);
  const [isMinting, setIsMinting] = useState(false);
  const [ownedNfts, setOwnedNfts] = useState<NftDisplay[]>([]);
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function showMessage(text: string, type: "success" | "error" | "info", duration?: number) {
    clearTimeout(messageTimer.current);
    setMessage({ text, type });
    if (duration) {
      messageTimer.current = setTimeout(() => setMessage(null), duration);
    }
  }

  const umi = useMemo(() => {
    const u = createUmi(RPC_ENDPOINT).use(mplCandyMachine());
    if (wallet.publicKey) {
      return u.use(walletAdapterIdentity(wallet));
    }
    return u;
  }, [wallet, wallet.publicKey]);

  const loadCandyMachine = useCallback(async () => {
    try {
      const cm = await fetchCandyMachine(umi, CANDY_MACHINE_ID);
      setItemsMinted(Number(cm.itemsRedeemed));
    } catch (err) {
      console.error("Failed to fetch candy machine:", err);
    }
  }, [umi]);

  useEffect(() => {
    loadCandyMachine();
  }, [loadCandyMachine]);

  const loadOwnedNfts = useCallback(async () => {
    if (!wallet.publicKey) return;

    setIsLoadingNfts(true);
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        wallet.publicKey,
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
        }
      );

      const nftMints = tokenAccounts.value
        .filter((ta) => {
          const info = ta.account.data.parsed.info;
          return (
            info.tokenAmount.uiAmount === 1 &&
            info.tokenAmount.decimals === 0
          );
        })
        .map((ta) => new PublicKey(ta.account.data.parsed.info.mint));

      const nfts: NftDisplay[] = [];

      for (const mint of nftMints) {
        try {
          const metadataPda = getMetadataPda(mint);
          const accountInfo = await connection.getAccountInfo(metadataPda);
          if (!accountInfo?.data) continue;

          const data = accountInfo.data;
          let offset = 1 + 32 + 32;

          const nameLen = data.readUInt32LE(offset);
          offset += 4;
          const name = data
            .subarray(offset, offset + nameLen)
            .toString("utf8")
            .replace(/\0/g, "");
          offset += nameLen;

          const symbolLen = data.readUInt32LE(offset);
          offset += 4;
          offset += symbolLen;

          const uriLen = data.readUInt32LE(offset);
          offset += 4;
          const uri = data
            .subarray(offset, offset + uriLen)
            .toString("utf8")
            .replace(/\0/g, "");

          if (!name.startsWith("Cool Cat")) continue;

          if (uri) {
            try {
              const res = await fetch(uri);
              const json = await res.json();
              nfts.push({
                mint: mint.toBase58(),
                name: json.name ?? name,
                image: json.image ?? "",
                attributes: json.attributes ?? [],
              });
            } catch {
              nfts.push({ mint: mint.toBase58(), name, image: "", attributes: [] });
            }
          }
        } catch {
          // Skip unparseable NFTs
        }
      }

      setOwnedNfts(nfts);
      setWalletMintCount(nfts.length);
    } catch (err) {
      console.error("Failed to load owned NFTs:", err);
    } finally {
      setIsLoadingNfts(false);
    }
  }, [connection, wallet.publicKey]);

  useEffect(() => {
    loadOwnedNfts();
  }, [loadOwnedNfts]);

  const handleMint = async () => {
    if (!wallet.publicKey) {
      showMessage("Connect your wallet first", "error", 5000);
      return;
    }

    if (walletMintCount >= MINT_LIMIT_PER_WALLET) {
      showMessage(`Mint limit reached (${MINT_LIMIT_PER_WALLET} per wallet)`, "error", 5000);
      return;
    }

    setIsMinting(true);
    showMessage("Minting your Cool Cat...", "info");

    try {
      const cm = await fetchCandyMachine(umi, CANDY_MACHINE_ID);
      const candyGuard = await fetchCandyGuard(umi, cm.mintAuthority);
      const nftMint = generateSigner(umi);

      const tx = transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .add(
          mintV2(umi, {
            candyMachine: cm.publicKey,
            candyGuard: candyGuard.publicKey,
            nftMint,
            collectionMint: cm.collectionMint,
            collectionUpdateAuthority: cm.authority,
            tokenStandard: TokenStandard.NonFungible,
            mintArgs: {
              solPayment: some({ destination: TREASURY }),
              mintLimit: some({ id: 1 }),
            },
          })
        );

      await tx.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
      });

      showMessage("Minted! Loading your cat...", "info");

      await new Promise((r) => setTimeout(r, 3000));
      await loadOwnedNfts();
      await loadCandyMachine();

      showMessage("Cool Cat minted successfully!", "success", 8000);
    } catch (err: unknown) {
      console.error("Mint failed:", err);
      const raw = err instanceof Error ? err.message : "Unknown error";

      // Friendly error messages
      let friendly = raw;
      if (raw.includes("block height exceeded") || raw.includes("expired")) {
        friendly = "Transaction timed out. Please try again.";
      } else if (raw.includes("insufficient funds") || raw.includes("0x1")) {
        friendly = "Insufficient SOL balance for this mint.";
      } else if (raw.includes("User rejected")) {
        friendly = "Transaction cancelled.";
      } else if (raw.length > 80) {
        friendly = "Transaction failed. Please try again.";
      }

      showMessage(friendly, "error", 8000);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {/* Hero */}
        <section className="text-center py-10 sm:py-16">
          <div className="mb-6 inline-block">
            <img
              src={COLLECTION_IMAGE}
              alt="Cool Cats Collection"
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-2 border-amber-400/30 shadow-lg shadow-amber-500/10"
            />
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Cool Cats Collection
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
            {TOTAL_SUPPLY} unique, randomly generated cats living on the Solana
            blockchain. Each Cool Cat has unique traits — fur, eyes, expression,
            and accessories.
          </p>
        </section>

        {/* Mint Card */}
        <section className="max-w-md mx-auto">
          <MintCard
            itemsMinted={itemsMinted}
            walletMintCount={walletMintCount}
            isMinting={isMinting}
            message={message}
            onMint={handleMint}
          />
        </section>

        {/* Gallery */}
        {wallet.publicKey && (
          <NftGallery nfts={ownedNfts} isLoading={isLoadingNfts} />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-500">
        <p>Cool Cats on Solana Devnet</p>
        <a
          href={`https://explorer.solana.com/address/${CANDY_MACHINE_ID}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-500/50 hover:text-amber-400 mt-1 inline-block"
        >
          View Candy Machine on Explorer
        </a>
      </footer>
    </div>
  );
}
