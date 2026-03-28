"use client";

type NftDisplay = {
  mint: string;
  name: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
};

type Props = {
  nfts: NftDisplay[];
  isLoading: boolean;
};

function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div
        className="w-full aspect-square"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s ease-in-out infinite",
        }}
      />
      <div className="p-4 space-y-3">
        <div
          className="h-5 w-32 rounded"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-6 w-20 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NftCard({ nft }: { nft: NftDisplay }) {
  return (
    <div
      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-amber-500/30 transition-colors"
      style={{ animation: "fade-in 0.4s ease-out" }}
    >
      {nft.image ? (
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full aspect-square object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-square flex items-center justify-center bg-white/5 text-6xl">
          🐱
        </div>
      )}
      <div className="p-4">
        <h4 className="font-bold text-lg mb-2">{nft.name}</h4>
        {nft.attributes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {nft.attributes.map((attr) => (
              <span
                key={attr.trait_type}
                className="text-xs px-2 py-1 rounded-full bg-white/10 text-slate-300"
              >
                {attr.trait_type}: {attr.value}
              </span>
            ))}
          </div>
        )}
        <a
          href={`https://explorer.solana.com/address/${nft.mint}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-amber-400 hover:text-amber-300 mt-3 inline-block"
        >
          View on Explorer
        </a>
      </div>
    </div>
  );
}

export function NftGallery({ nfts, isLoading }: Props) {
  if (isLoading) {
    return (
      <section className="mt-12 sm:mt-16">
        <h3 className="text-2xl font-bold text-center mb-8">
          Loading your cats...
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 sm:mt-16">
      <h3 className="text-2xl font-bold text-center mb-8">
        {nfts.length > 0 ? "Your Cool Cats" : "No Cool Cats yet"}
      </h3>
      {nfts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {nfts.map((nft) => (
            <NftCard key={nft.mint} nft={nft} />
          ))}
        </div>
      )}
    </section>
  );
}
