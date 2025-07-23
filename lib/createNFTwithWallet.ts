import { 
  createUmi, 
  generateSigner, 
  keypairIdentity, 
  publicKey,
  PublicKey,
  Signer
} from '@metaplex-foundation/umi-bundle-defaults';
import { createV1, mplCore } from '@metaplex-foundation/mpl-core';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { Connection } from '@solana/web3.js';

// Constants
const CUSTOM_MPL_CORE_PROGRAM = "GMTAp1moCdGh4TEwFTcCJKeKL3UMEDB6vKpo2uxM9h4s";
const GORBCHAIN_RPC = "https://rpc.gorbchain.xyz";

export async function mintGorbMPLCoreNFT({
  connection,
  wallet,
  name,
  symbol,
  uri,
  description,
}: {
  connection: Connection;
  wallet: WalletAdapter;
  name: string;
  symbol: string;
  uri: string;
  description: string;
}) {
  try {
    console.log("🚀 Creating NFT with MPL Core on Gorbchain...");

    // Validate wallet connection
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    // Create Umi instance
    const umi = createUmi(connection.rpcEndpoint)
      .use(mplCore({ programId: publicKey(CUSTOM_MPL_CORE_PROGRAM) }));

    // Create a signer from the wallet adapter
    const walletSigner: Signer = {
      publicKey: publicKey(wallet.publicKey.toBase58()),
      signMessage: async (message: Uint8Array) => {
        const signature = await wallet.signMessage!(message);
        return signature;
      },
      signTransaction: async (transaction: any) => {
        const signed = await wallet.signTransaction!(transaction);
        return signed;
      },
      signAllTransactions: async (transactions: any[]) => {
        const signed = await wallet.signAllTransactions!(transactions);
        return signed;
      },
    };

    umi.use(keypairIdentity(walletSigner));

    console.log("🔧 Umi configured with MPL Core plugin");
    console.log("🔧 Program ID:", CUSTOM_MPL_CORE_PROGRAM);
    console.log("👤 Using wallet:", walletSigner.publicKey);

    // Prepare NFT data
    console.log("📋 NFT Details:");
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Description:", description);
    console.log("  URI:", uri);

    // Generate asset signer
    const asset = generateSigner(umi);
    console.log("🔑 Generated asset address:", asset.publicKey);

    // Create the NFT
    console.log("🎨 Creating NFT with custom MPL Core program...");
    
    const result = await createV1(umi, {
      asset,
      name,
      uri,
      sellerFeeBasisPoints: 500, // 5% royalty
      plugins: [],
    }).sendAndConfirm(umi, {
      send: { 
        commitment: "confirmed",
        skipPreflight: false,
        maxRetries: 3
      }
    });

    console.log("✅ NFT created successfully!");
    console.log("📝 Transaction signature:", result.signature);

    // Generate explorer links
    const explorerLink = `https://explorer.gorbchain.xyz/address/${asset.publicKey}`;
    const txExplorerLink = `https://explorer.gorbchain.xyz/tx/${result.signature}`;

    console.log("\n🎉 SUCCESS! Your NFT has been deployed on Gorbchain!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 NFT Address:", asset.publicKey);
    console.log("🔗 View NFT:", explorerLink);
    console.log("🔗 View Transaction:", txExplorerLink);
    console.log("🏷️ Name:", name);
    console.log("🏷️ Symbol:", symbol);
    console.log("📄 Metadata URI:", uri);
    console.log("🔧 Custom Program:", CUSTOM_MPL_CORE_PROGRAM);
    console.log("🌐 Network: Gorbchain");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      nftAddress: asset.publicKey.toString(),
      signature: result.signature,
      explorerLink,
      txExplorerLink,
      metadataUri: uri,
      success: true,
    };

  } catch (error: any) {
    console.error("❌ Error deploying NFT:", error);
    
    // Provide helpful error messages
    if (error.message.includes("insufficient funds")) {
      console.log("💡 Make sure you have enough SOL for transaction fees on Gorbchain");
    } else if (error.message.includes("network")) {
      console.log("💡 Check your connection to Gorbchain RPC");
      console.log("💡 Current RPC:", GORBCHAIN_RPC);
    } else if (error.message.includes("program that does not exist")) {
      console.log("💡 Make sure your MPL Core program is deployed to Gorbchain");
      console.log("💡 Program ID should be:", CUSTOM_MPL_CORE_PROGRAM);
    }
    
    throw error;
  }
}