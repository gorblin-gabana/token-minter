"use client";
import bs58 from "bs58";

// Integration points for your actual backend functions
import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeInstruction,
  getMintLen,
  ExtensionType,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
} from "@solana/spl-token";
import { createUmi as createUmiWithEndpoint } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import { createV1, mplCore } from "@metaplex-foundation/mpl-core";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";

const CUSTOM_MPL_CORE_PROGRAM =
  process.env.NEXT_PUBLIC_GORB_CUSTOM_MPL_CORE_PROGRAM ||
  "BvoSmPBF6mBRxBMY9FPguw1zUoUg3xrc5CaWf7y5ACkc";
const GORBCHAIN_RPC =
  process.env.NEXT_PUBLIC_GORB_RPC_URL || "https://rpc.gorbchain.xyz";

// Gorbagan chain specific program IDs
const TOKEN22_PROGRAM = new PublicKey(
  "FGyzDo6bhE7gFmSYymmFnJ3SZZu3xWGBA7sNHXR7QQsn"
);
const ASSOCIATED_TOKEN_PROGRAM = new PublicKey(
  "4YpYoLVTQ8bxcne9GneN85RUXeN7pqGTwgPcY71ZL5gX"
);

// Helper to calculate metadata space
function calculateMetadataSpace(
  name: string,
  symbol: string,
  uri: string
): number {
  const borshMetadataSize =
    32 + // update_authority
    32 + // mint
    4 +
    name.length +
    4 +
    symbol.length +
    4 +
    uri.length +
    4; // additional_metadata vec
  const tlvOverhead = 2 + 2;
  const totalMetadataSpace = tlvOverhead + borshMetadataSize;
  return Math.ceil(totalMetadataSpace * 1.1); // 10% padding
}

export async function mintGorbToken({
  connection,
  wallet,
  name,
  symbol,
  supply,
  decimals,
  uri,
  freezeAuth = null,
}: {
  connection: Connection;
  wallet: any; // Wallet adapter (adapter, not context)
  name: string;
  symbol: string;
  supply: string | number;
  decimals: string | number;
  uri: string;
  freezeAuth: PublicKey | null;
}) {
  console.log("[mintGorbToken] Starting token mint process...");
  console.log("Params:", { name, symbol, supply, decimals, uri });
  console.log("wallet:", wallet);

  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }
  const payer = wallet;
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  const extensions = [ExtensionType.MetadataPointer];
  const mintLen = getMintLen(extensions);
  console.log("Mint account size (with extensions):", mintLen);
  const rentExemptionAmount =
    await connection.getMinimumBalanceForRentExemption(mintLen);
  console.log("Rent exemption amount:", rentExemptionAmount);

  // 1. Create mint account and initialize
  console.log("Creating and initializing mint account...");
  const createAndInitializeTx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint,
      lamports: rentExemptionAmount,
      space: mintLen,
      programId: TOKEN22_PROGRAM,
    }),
    createInitializeMetadataPointerInstruction(
      mint,
      payer.publicKey,
      mint,
      TOKEN22_PROGRAM
    ),
    createInitializeMintInstruction(
      mint,
      Number(decimals),
      payer.publicKey,
      freezeAuth ? freezeAuth : null,
      TOKEN22_PROGRAM
    )
  );
  createAndInitializeTx.feePayer = payer.publicKey;
  const { blockhash } = await connection.getLatestBlockhash();
  createAndInitializeTx.recentBlockhash = blockhash;
  createAndInitializeTx.partialSign(mintKeypair);
  const signedTx = await wallet.signTransaction(createAndInitializeTx);
  const createMintSignature = await connection.sendRawTransaction(
    signedTx.serialize(),
    { skipPreflight: true }
  );
  await connection.confirmTransaction(createMintSignature, "confirmed");
  console.log(
    "Mint account created and initialized! Signature:",
    createMintSignature
  );
  console.log("Mint address:", mint.toBase58());

  // 2. Initialize metadata
  const accountInfo = await connection.getAccountInfo(mint);
  if (accountInfo) {
    const metadataSpace = calculateMetadataSpace(name, symbol, uri);
    const newSize = accountInfo.data.length + metadataSpace;
    const additionalRent =
      (await connection.getMinimumBalanceForRentExemption(newSize)) -
      (await connection.getMinimumBalanceForRentExemption(
        accountInfo.data.length
      ));
    console.log("Current mint account size:", accountInfo.data.length);
    console.log("Metadata space needed:", metadataSpace);
    console.log("Total size needed:", newSize);
    console.log("Additional rent needed:", additionalRent);
    if (additionalRent > 0) {
      const transferIx = SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: mint,
        lamports: additionalRent,
      });
      const transferTx = new Transaction().add(transferIx);
      transferTx.feePayer = payer.publicKey;
      const { blockhash: blockhash2 } = await connection.getLatestBlockhash();
      transferTx.recentBlockhash = blockhash2;
      const signedTx2 = await wallet.signTransaction(transferTx);
      const sig2 = await connection.sendRawTransaction(signedTx2.serialize(), {
        skipPreflight: true,
      });
      await connection.confirmTransaction(sig2, "confirmed");
      console.log("Additional rent transferred. Signature:", sig2);
    }
    const initMetadataInstruction = createInitializeInstruction({
      programId: TOKEN22_PROGRAM,
      metadata: mint,
      updateAuthority: payer.publicKey,
      mint: mint,
      mintAuthority: payer.publicKey,
      name,
      symbol,
      uri,
    });
    const metadataTx = new Transaction().add(initMetadataInstruction);
    metadataTx.feePayer = payer.publicKey;
    const { blockhash: blockhash3 } = await connection.getLatestBlockhash();
    metadataTx.recentBlockhash = blockhash3;
    const signedTx3 = await wallet.signTransaction(metadataTx);
    const sig3 = await connection.sendRawTransaction(signedTx3.serialize(), {
      skipPreflight: true,
    });
    await connection.confirmTransaction(sig3, "confirmed");
    console.log("Metadata initialized! Signature:", sig3);
  } else {
    console.warn(
      "Could not fetch mint account info for metadata initialization."
    );
  }

  // 3. Create associated token account and mint tokens
  console.log("Creating associated token account...");
  const associatedToken = getAssociatedTokenAddressSync(
    mint,
    payer.publicKey,
    false,
    TOKEN22_PROGRAM,
    ASSOCIATED_TOKEN_PROGRAM
  );
  console.log("Associated token address:", associatedToken.toBase58());
  const ataInfo = await connection.getAccountInfo(associatedToken);
  const mintInstructions: any[] = [];
  if (!ataInfo) {
    // Add instruction to create ATA
    mintInstructions.push(
      createAssociatedTokenAccountInstruction(
        payer.publicKey, // payer
        associatedToken, // ata
        payer.publicKey, // owner
        mint, // mint
        TOKEN22_PROGRAM,
        ASSOCIATED_TOKEN_PROGRAM
      )
    );
  }
  // Add mintTo instruction
  const supplyBigInt = BigInt(supply) * BigInt(10 ** Number(decimals));
  mintInstructions.push(
    createMintToInstruction(
      mint,
      associatedToken,
      payer.publicKey,
      supplyBigInt,
      [],
      TOKEN22_PROGRAM
    )
  );
  // Build transaction
  const mintTx = new Transaction().add(...mintInstructions);
  mintTx.feePayer = payer.publicKey;
  const { blockhash: mintBlockhash } = await connection.getLatestBlockhash();
  mintTx.recentBlockhash = mintBlockhash;
  // Sign with wallet
  const mintSignedTx = await wallet.signTransaction(mintTx);
  const mintSig = await connection.sendRawTransaction(
    mintSignedTx.serialize(),
    { skipPreflight: true }
  );
  await connection.confirmTransaction(mintSig, "confirmed");
  console.log("Token account created and tokens minted! Signature:", mintSig);
  return {
    tokenAddress: mint.toBase58(),
    tokenAccount: associatedToken.toBase58(),
    supply: supply,
    decimals: decimals,
    name,
    symbol,
    uri,
    signature: mintSig,
    success: true,
  };
}

export async function mintGorbNFT({
  wallet,
  name,
  symbol,
  uri,
  description,
  royalty = 500,
}: {
  wallet: any; // Wallet adapter instance
  name: string;
  symbol: string;
  uri: string;
  description: string;
  royalty?: number;
}) {
  try {
    console.log(
      "🚀 Starting NFT deployment with custom MPL Core program on Gorbchain..."
    );

    // 1. Verify wallet connection
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected!");
    }
    console.log(
      "👤 Using wallet adapter with public key:",
      wallet.publicKey.toBase58()
    );

    // 2. Create Umi instance with wallet adapter identity and custom endpoint
    const connection = new Connection(GORBCHAIN_RPC, {
      commitment: "confirmed",
      wsEndpoint: "wss://rpc.gorbchain.xyz/ws/",
    });
    const umi = (createUmiWithEndpoint as any)(connection);
    umi.use(walletAdapterIdentity(wallet));
    umi.use(mplCore());

    console.log("🔧 Umi configured with wallet adapter identity");
    console.log("🔧 Program ID:", CUSTOM_MPL_CORE_PROGRAM);

    // 3. Check balance (using web3.js Connection)
    const balance = await connection.getBalance(wallet.publicKey);
    console.log("💰 Current balance:", balance / 1e9, "SOL");

    if (balance < 0.1 * 1e9) {
      console.log(
        "⚠️ Low balance! Make sure you have enough SOL for transaction fees."
      );
    }

    // 4. Prepare NFT Data
    console.log("📋 NFT Details:");
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Description:", description);
    console.log("  URI:", uri);
    console.log("  Royalty:", royalty, "bps");

    // 5. Generate asset signer
    const asset = generateSigner(umi);
    console.log("🔑 Generated asset address:", asset.publicKey);

    // 6. Create NFT with timeout protection
    console.log("🎨 Creating NFT on Gorbchain...");

    const createPromise = createV1(umi, {
      asset,
      name,
      uri,
      // sellerFeeBasisPoints: royalty,
      plugins: [],
    }).sendAndConfirm(umi);
    // @ts-ignore
    createPromise.sellerFeeBasisPoints = royalty;

    const createResult: any = await createPromise;

    console.log("✅ NFT created successfully!");
    console.log("📝 Transaction signature:", createResult.signature);
    const signature = bs58.encode(createResult.signature);

    // 7. Generate explorer links
    const explorerLink = `https://explorer.gorbchain.xyz/address/${asset.publicKey}`;
    const txExplorerLink = `https://explorer.gorbchain.xyz/tx/${signature}`;

    console.log("\n🎉 SUCCESS! Your NFT has been deployed on Gorbchain!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 NFT Address:", asset.publicKey);
    console.log("🔗 View NFT:", explorerLink);
    console.log("🔗 View Transaction:", txExplorerLink);
    console.log("🏷️ Name:", name);
    console.log("🏷️ Symbol:", symbol);
    console.log("📄 Metadata URI:", uri);
    console.log("👑 Royalty:", royalty, "bps");
    console.log("🔧 Custom Program:", CUSTOM_MPL_CORE_PROGRAM);
    console.log("🌐 Network: Gorbchain");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      nftAddress: asset.publicKey,
      signature: signature,
      explorerLink,
      txExplorerLink,
      metadataUri: uri,
    };
  } catch (error: any) {
    console.error("❌ Error deploying NFT:", error);

    // Preserve original error logging
    if (error.logs) {
      console.log("📋 Detailed transaction logs:", error.logs);
    } else if (typeof error.getLogs === "function") {
      try {
        const logs = await error.getLogs();
        console.log("📋 Detailed transaction logs:", logs);
      } catch (logError) {
        console.log("📋 Could not retrieve detailed logs");
      }
    }

    // Preserve original error messages
    if (typeof error.message === "string") {
      if (error.message.includes("timeout")) {
        console.log(
          "💡 Transaction timed out. This might be due to network issues or RPC overload."
        );
        console.log("💡 Try running the script again.");
      } else if (error.message.includes("insufficient funds")) {
        console.log(
          "💡 Make sure you have enough SOL for transaction fees on Gorbchain"
        );
      } else if (error.message.includes("network")) {
        console.log("💡 Check your connection to Gorbchain RPC");
        console.log("💡 Current RPC:", GORBCHAIN_RPC);
      } else if (error.message.includes("program that does not exist")) {
        console.log(
          "💡 Make sure your MPL Core program is deployed to Gorbchain"
        );
        console.log("💡 Program ID should be:", CUSTOM_MPL_CORE_PROGRAM);
      }
    }

    throw error;
  }
}

export async function mintGorbNFTToken22({
  connection,
  wallet,
  name,
  symbol,
  uri,
  description,
  freezeAuth = null,
}: {
  connection: Connection;
  wallet: any;
  name: string;
  symbol: string;
  uri: string;
  description: string;
  freezeAuth: PublicKey | null;
}) {
  try {
    console.log("🚀 Creating NFT using Token22 on Gorbchain...");

    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    const payer = wallet;
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    // NFTs have supply of 1 and 0 decimals
    const supply = 1;
    const decimals = 0;

    const extensions = [ExtensionType.MetadataPointer];
    const mintLen = getMintLen(extensions);
    const rentExemptionAmount =
      await connection.getMinimumBalanceForRentExemption(mintLen);

    console.log("📋 NFT Details:");
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Description:", description);
    console.log("  URI:", uri);
    console.log("🔑 NFT Address:", mint.toBase58());

    // 1. Create mint account and initialize
    const createAndInitializeTx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        lamports: rentExemptionAmount,
        space: mintLen,
        programId: TOKEN22_PROGRAM,
      }),
      createInitializeMetadataPointerInstruction(
        mint,
        payer.publicKey,
        mint,
        TOKEN22_PROGRAM
      ),
      createInitializeMintInstruction(
        mint,
        decimals,
        payer.publicKey,
        freezeAuth ? freezeAuth : null,
        TOKEN22_PROGRAM
      )
    );

    createAndInitializeTx.feePayer = payer.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    createAndInitializeTx.recentBlockhash = blockhash;
    createAndInitializeTx.partialSign(mintKeypair);

    const signedTx = await wallet.signTransaction(createAndInitializeTx);
    const createMintSignature = await connection.sendRawTransaction(
      signedTx.serialize(),
      { skipPreflight: true }
    );
    await connection.confirmTransaction(createMintSignature, "confirmed");
    console.log("✅ NFT mint account created! Signature:", createMintSignature);

    // 2. Initialize metadata
    const metadataSpace = calculateMetadataSpace(name, symbol, uri);
    const accountInfo = await connection.getAccountInfo(mint);

    if (accountInfo) {
      const newSize = accountInfo.data.length + metadataSpace;
      const additionalRent =
        (await connection.getMinimumBalanceForRentExemption(newSize)) -
        (await connection.getMinimumBalanceForRentExemption(
          accountInfo.data.length
        ));

      if (additionalRent > 0) {
        const transferIx = SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: mint,
          lamports: additionalRent,
        });
        const transferTx = new Transaction().add(transferIx);
        transferTx.feePayer = payer.publicKey;
        const { blockhash: blockhash2 } = await connection.getLatestBlockhash();
        transferTx.recentBlockhash = blockhash2;
        const signedTx2 = await wallet.signTransaction(transferTx);
        const sig2 = await connection.sendRawTransaction(
          signedTx2.serialize(),
          { skipPreflight: true }
        );
        await connection.confirmTransaction(sig2, "confirmed");
      }

      const initMetadataInstruction = createInitializeInstruction({
        programId: TOKEN22_PROGRAM,
        metadata: mint,
        updateAuthority: payer.publicKey,
        mint: mint,
        mintAuthority: payer.publicKey,
        name,
        symbol,
        uri,
      });

      const metadataTx = new Transaction().add(initMetadataInstruction);
      metadataTx.feePayer = payer.publicKey;
      const { blockhash: blockhash3 } = await connection.getLatestBlockhash();
      metadataTx.recentBlockhash = blockhash3;
      const signedTx3 = await wallet.signTransaction(metadataTx);
      const metadataSig = await connection.sendRawTransaction(
        signedTx3.serialize(),
        { skipPreflight: true }
      );
      await connection.confirmTransaction(metadataSig, "confirmed");
      console.log("✅ NFT metadata initialized! Signature:", metadataSig);
    }

    // 3. Mint the NFT to the creator
    const associatedToken = getAssociatedTokenAddressSync(
      mint,
      payer.publicKey,
      false,
      TOKEN22_PROGRAM,
      ASSOCIATED_TOKEN_PROGRAM
    );

    const ataInfo = await connection.getAccountInfo(associatedToken);
    const mintInstructions: any[] = [];

    if (!ataInfo) {
      mintInstructions.push(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          associatedToken,
          payer.publicKey,
          mint,
          TOKEN22_PROGRAM,
          ASSOCIATED_TOKEN_PROGRAM
        )
      );
    }

    mintInstructions.push(
      createMintToInstruction(
        mint,
        associatedToken,
        payer.publicKey,
        BigInt(supply), // Mint 1 NFT
        [],
        TOKEN22_PROGRAM
      )
    );

    const mintTx = new Transaction().add(...mintInstructions);
    mintTx.feePayer = payer.publicKey;
    const { blockhash: mintBlockhash } = await connection.getLatestBlockhash();
    mintTx.recentBlockhash = mintBlockhash;
    const mintSignedTx = await wallet.signTransaction(mintTx);
    const mintSig = await connection.sendRawTransaction(
      mintSignedTx.serialize(),
      { skipPreflight: true }
    );
    await connection.confirmTransaction(mintSig, "confirmed");

    console.log("🎉 SUCCESS! Your NFT has been created on Gorbchain!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 NFT Address:", mint.toBase58());
    console.log("🏷️ Name:", name);
    console.log("🏷️ Symbol:", symbol);
    console.log("📄 Metadata URI:", uri);
    console.log("🎨 Using Token22 Program");
    console.log("🌐 Network: Gorbchain");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      nftAddress: mint.toBase58(),
      signature: mintSig,
      metadataUri: uri,
      success: true,
    };
  } catch (error: any) {
    console.error("❌ Error creating NFT with Token22:", error);
    throw error;
  }
}

export async function mintGorbNFTToken22SingleTx({
  connection,
  wallet,
  name,
  symbol,
  uri,
  description,
}: {
  connection: Connection;
  wallet: any;
  name: string;
  symbol: string;
  uri: string;
  description: string;
}) {
  try {
    console.log(
      "🚀 Creating NFT using Token22 (Single Transaction) on Gorbchain..."
    );

    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    const payer = wallet;
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    // NFTs have supply of 1 and 0 decimals
    const supply = 1;
    const decimals = 0;

    console.log("📋 NFT Details:");
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Description:", description);
    console.log("  URI:", uri);
    console.log("🔑 NFT Address:", mint.toBase58());

    // Calculate space requirements - create mint account with base space first (like working approach)
    const extensions = [ExtensionType.MetadataPointer];
    const mintLen = getMintLen(extensions);
    const metadataSpace = calculateMetadataSpace(name, symbol, uri);
    const mintRent = await connection.getMinimumBalanceForRentExemption(
      mintLen
    );
    const totalSpace = mintLen + metadataSpace;
    const totalRent = await connection.getMinimumBalanceForRentExemption(
      totalSpace
    );
    const additionalRent = totalRent - mintRent;

    console.log("💰 Mint space needed:", mintLen, "bytes");
    console.log("💰 Metadata space needed:", metadataSpace, "bytes");
    console.log("💰 Mint rent needed:", mintRent / 1e9, "SOL");
    console.log(
      "💰 Additional rent for metadata:",
      additionalRent / 1e9,
      "SOL"
    );

    // Get associated token account
    const associatedToken = getAssociatedTokenAddressSync(
      mint,
      payer.publicKey,
      false,
      TOKEN22_PROGRAM,
      ASSOCIATED_TOKEN_PROGRAM
    );

    // Check if ATA already exists
    const ataInfo = await connection.getAccountInfo(associatedToken);

    // Build all instructions in one transaction (following working pattern)
    const allInstructions: any[] = [];

    // 1. Create mint account with BASE space only (like working approach)
    allInstructions.push(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        lamports: mintRent,
        space: mintLen,
        programId: TOKEN22_PROGRAM,
      })
    );

    // 2. Initialize metadata pointer
    allInstructions.push(
      createInitializeMetadataPointerInstruction(
        mint,
        payer.publicKey,
        mint,
        TOKEN22_PROGRAM
      )
    );

    // 3. Initialize mint
    allInstructions.push(
      createInitializeMintInstruction(
        mint,
        decimals,
        payer.publicKey,
        payer.publicKey,
        TOKEN22_PROGRAM
      )
    );

    // 4. Add space for metadata (like working approach)
    if (additionalRent > 0) {
      allInstructions.push(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: mint,
          lamports: additionalRent,
        })
      );
    }

    // 5. Initialize metadata
    allInstructions.push(
      createInitializeInstruction({
        programId: TOKEN22_PROGRAM,
        metadata: mint,
        updateAuthority: payer.publicKey,
        mint: mint,
        mintAuthority: payer.publicKey,
        name,
        symbol,
        uri,
      })
    );

    // 6. Create ATA if needed
    if (!ataInfo) {
      allInstructions.push(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          associatedToken,
          payer.publicKey,
          mint,
          TOKEN22_PROGRAM,
          ASSOCIATED_TOKEN_PROGRAM
        )
      );
    }

    // 7. Mint the NFT
    allInstructions.push(
      createMintToInstruction(
        mint,
        associatedToken,
        payer.publicKey,
        BigInt(supply),
        [],
        TOKEN22_PROGRAM
      )
    );

    // Create single transaction with all instructions
    const completeTx = new Transaction().add(...allInstructions);
    completeTx.feePayer = payer.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    completeTx.recentBlockhash = blockhash;

    // DO NOT SIGN YET

    // SIMULATE TRANSACTION FIRST
    console.log("🧪 Running detailed simulation before sending...");
    const simulationResult = await simulateTransactionDetailed(
      connection,
      completeTx,
      wallet
    );

    if (!simulationResult.success) {
      console.log("❌ SIMULATION FAILED - NOT SENDING TRANSACTION");
      throw new Error(
        `Transaction simulation failed: ${JSON.stringify(
          simulationResult.error
        )}`
      );
    }

    // Sign with wallet FIRST
    const walletSignedTx = await wallet.signTransaction(completeTx);
    // Then sign with mint keypair
    walletSignedTx.partialSign(mintKeypair);

    console.log(
      "📦 Sending single transaction with",
      allInstructions.length,
      "instructions..."
    );

    // Send transaction
    const signature = await connection.sendRawTransaction(
      walletSignedTx.serialize(),
      {
        skipPreflight: false, // Don't skip preflight since we already simulated
        maxRetries: 3,
      }
    );

    console.log("📤 Transaction sent! Signature:", signature);
    console.log("⏳ Waiting for confirmation...");

    // Check transaction status properly
    const statusResult = await checkTransactionStatus(connection, signature);

    if (!statusResult.success) {
      console.log("❌ TRANSACTION FAILED AFTER SENDING");
      throw new Error(
        `Transaction failed: ${JSON.stringify(statusResult.error)}`
      );
    }

    console.log(
      "🎉 SUCCESS! Your NFT has been created in ONE transaction on Gorbchain!"
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 NFT Address:", mint.toBase58());
    console.log("🏷️ Name:", name);
    console.log("🏷️ Symbol:", symbol);
    console.log("📄 Metadata URI:", uri);
    console.log("🎨 Using Token22 Program");
    console.log("🌐 Network: Gorbchain");
    console.log("📦 Single Transaction:", signature);
    console.log("⚡ Instructions Count:", allInstructions.length);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      nftAddress: mint.toBase58(),
      signature: signature,
      metadataUri: uri,
      success: true,
      instructionsCount: allInstructions.length,
    };
  } catch (error: any) {
    console.error("❌ Error creating NFT with single transaction:", error);
    throw error;
  }
}

export async function mintGorbTokenSingleTx({
  connection,
  wallet,
  name,
  symbol,
  supply,
  decimals,
  uri,
}: {
  connection: Connection;
  wallet: any;
  name: string;
  symbol: string;
  supply: string | number;
  decimals: string | number;
  uri: string;
}) {
  try {
    console.log(
      "🚀 Creating Token using Token22 (Single Transaction) on Gorbchain..."
    );
    console.log("Params:", { name, symbol, supply, decimals, uri });

    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    const payer = wallet;
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    // Calculate all space requirements upfront
    const extensions = [ExtensionType.MetadataPointer];
    const mintLen = getMintLen(extensions);
    const metadataSpace = calculateMetadataSpace(name, symbol, uri);
    const totalSpace = mintLen + metadataSpace;
    const totalRent = await connection.getMinimumBalanceForRentExemption(
      totalSpace
    );

    console.log("💰 Total space needed:", totalSpace, "bytes");
    console.log("💰 Total rent needed:", totalRent / 1e9, "SOL");
    console.log("🔑 Token Address:", mint.toBase58());

    // Get associated token account
    const associatedToken = getAssociatedTokenAddressSync(
      mint,
      payer.publicKey,
      false,
      TOKEN22_PROGRAM,
      ASSOCIATED_TOKEN_PROGRAM
    );

    // Check if ATA already exists
    const ataInfo = await connection.getAccountInfo(associatedToken);

    // Build all instructions in one transaction
    const allInstructions: any[] = [];

    // 1. Create mint account with full space
    allInstructions.push(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        lamports: totalRent,
        space: totalSpace,
        programId: TOKEN22_PROGRAM,
      })
    );

    // 2. Initialize metadata pointer
    allInstructions.push(
      createInitializeMetadataPointerInstruction(
        mint,
        payer.publicKey,
        mint,
        TOKEN22_PROGRAM
      )
    );

    // 3. Initialize mint
    allInstructions.push(
      createInitializeMintInstruction(
        mint,
        Number(decimals),
        payer.publicKey,
        payer.publicKey,
        TOKEN22_PROGRAM
      )
    );

    // 4. Initialize metadata
    allInstructions.push(
      createInitializeInstruction({
        programId: TOKEN22_PROGRAM,
        metadata: mint,
        updateAuthority: payer.publicKey,
        mint: mint,
        mintAuthority: payer.publicKey,
        name,
        symbol,
        uri,
      })
    );

    // 5. Create ATA if needed
    if (!ataInfo) {
      allInstructions.push(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          associatedToken,
          payer.publicKey,
          mint,
          TOKEN22_PROGRAM,
          ASSOCIATED_TOKEN_PROGRAM
        )
      );
    }

    // 6. Mint tokens
    const supplyBigInt = BigInt(supply) * BigInt(10 ** Number(decimals));
    allInstructions.push(
      createMintToInstruction(
        mint,
        associatedToken,
        payer.publicKey,
        supplyBigInt,
        [],
        TOKEN22_PROGRAM
      )
    );

    // Create single transaction with all instructions
    const completeTx = new Transaction().add(...allInstructions);
    completeTx.feePayer = payer.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    completeTx.recentBlockhash = blockhash;

    // Sign with mint keypair
    completeTx.partialSign(mintKeypair);

    // SIMULATE TRANSACTION FIRST
    console.log("🧪 Running detailed simulation before sending...");
    const simulationResult = await simulateTransactionDetailed(
      connection,
      completeTx,
      wallet
    );

    if (!simulationResult.success) {
      console.log("❌ SIMULATION FAILED - NOT SENDING TRANSACTION");
      throw new Error(
        `Transaction simulation failed: ${JSON.stringify(
          simulationResult.error
        )}`
      );
    }

    // Sign with wallet
    const signedTx = await wallet.signTransaction(completeTx);

    console.log(
      "📦 Sending single transaction with",
      allInstructions.length,
      "instructions..."
    );

    // Send transaction
    const signature = await connection.sendRawTransaction(
      signedTx.serialize(),
      {
        skipPreflight: false, // Don't skip preflight since we already simulated
        maxRetries: 3,
      }
    );

    console.log("📤 Transaction sent! Signature:", signature);
    console.log("⏳ Waiting for confirmation...");

    // Check transaction status properly
    const statusResult = await checkTransactionStatus(connection, signature);

    if (!statusResult.success) {
      console.log("❌ TRANSACTION FAILED AFTER SENDING");
      throw new Error(
        `Transaction failed: ${JSON.stringify(statusResult.error)}`
      );
    }

    console.log(
      "🎉 SUCCESS! Your Token has been created in ONE transaction on Gorbchain!"
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 Token Address:", mint.toBase58());
    console.log("🏷️ Name:", name);
    console.log("🏷️ Symbol:", symbol);
    console.log("📊 Supply:", supply);
    console.log("📊 Decimals:", decimals);
    console.log("📄 Metadata URI:", uri);
    console.log("🎨 Using Token22 Program");
    console.log("🌐 Network: Gorbchain");
    console.log("📦 Single Transaction:", signature);
    console.log("⚡ Instructions Count:", allInstructions.length);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      tokenAddress: mint.toBase58(),
      tokenAccount: associatedToken.toBase58(),
      supply: supply,
      decimals: decimals,
      name,
      symbol,
      uri,
      signature: signature,
      success: true,
      instructionsCount: allInstructions.length,
    };
  } catch (error: any) {
    console.error("❌ Error creating Token with single transaction:", error);
    throw error;
  }
}

export async function mintGorbNFTToken22TwoTx({
  connection,
  wallet,
  name,
  symbol,
  uri,
  description,
  freezeAuth = null,
}: {
  connection: Connection;
  wallet: any;
  name: string;
  symbol: string;
  uri: string;
  description: string;
  freezeAuth: PublicKey | null;
}) {
  try {
    console.log(
      "🚀 Creating NFT using Token22 (2-Transaction Optimized) on Gorbchain...",
      +`with freezeAuth: ${freezeAuth}`
    );

    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    const payer = wallet;
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    // NFTs have supply of 1 and 0 decimals
    const supply = 1;
    const decimals = 0;

    console.log("📋 NFT Details:");
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Description:", description);
    console.log("  URI:", uri);
    console.log("🔑 NFT Address:", mint.toBase58());

    // Calculate space requirements
    const extensions = [ExtensionType.MetadataPointer];
    const mintLen = getMintLen(extensions);
    const metadataSpace = calculateMetadataSpace(name, symbol, uri);
    const mintRent = await connection.getMinimumBalanceForRentExemption(
      mintLen
    );

    console.log("💰 Mint space needed:", mintLen, "bytes");
    console.log("💰 Metadata space needed:", metadataSpace, "bytes");
    console.log("💰 Mint rent needed:", mintRent / 1e9, "SOL");

    // ===== TRANSACTION 1: Setup mint account =====
    console.log("📦 Transaction 1: Setting up mint account...");

    const tx1Instructions = [
      // Create mint account
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        lamports: mintRent,
        space: mintLen,
        programId: TOKEN22_PROGRAM,
      }),
      // Initialize metadata pointer
      createInitializeMetadataPointerInstruction(
        mint,
        payer.publicKey,
        mint,
        TOKEN22_PROGRAM
      ),
      // Initialize mint
      createInitializeMintInstruction(
        mint,
        decimals,
        payer.publicKey,
        null,
        TOKEN22_PROGRAM
      ),
    ];

    const tx1 = new Transaction().add(...tx1Instructions);
    tx1.feePayer = payer.publicKey;
    const { blockhash: blockhash1 } = await connection.getLatestBlockhash();
    tx1.recentBlockhash = blockhash1;
    tx1.partialSign(mintKeypair);

    const signedTx1 = await wallet.signTransaction(tx1);
    const sig1 = await connection.sendRawTransaction(signedTx1.serialize(), {
      skipPreflight: true,
      maxRetries: 3,
    });
    await connection.confirmTransaction(sig1, "confirmed");
    console.log("✅ Transaction 1 complete! Signature:", sig1);

    // ===== TRANSACTION 2: Add metadata space, initialize metadata, create ATA, and mint =====
    console.log("📦 Transaction 2: Completing NFT setup...");

    // Calculate additional rent needed for metadata
    const accountInfo = await connection.getAccountInfo(mint);
    if (!accountInfo) {
      throw new Error("Mint account not found after first transaction");
    }

    const newSize = accountInfo.data.length + metadataSpace;
    const additionalRent =
      (await connection.getMinimumBalanceForRentExemption(newSize)) -
      (await connection.getMinimumBalanceForRentExemption(
        accountInfo.data.length
      ));

    // Get associated token account
    const associatedToken = getAssociatedTokenAddressSync(
      mint,
      payer.publicKey,
      false,
      TOKEN22_PROGRAM,
      ASSOCIATED_TOKEN_PROGRAM
    );

    // Check if ATA already exists
    const ataInfo = await connection.getAccountInfo(associatedToken);

    const tx2Instructions = [];

    // Add space for metadata if needed
    if (additionalRent > 0) {
      tx2Instructions.push(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: mint,
          lamports: additionalRent,
        })
      );
    }

    // Initialize metadata
    tx2Instructions.push(
      createInitializeInstruction({
        programId: TOKEN22_PROGRAM,
        metadata: mint,
        updateAuthority: payer.publicKey,
        mint: mint,
        mintAuthority: payer.publicKey,
        name,
        symbol,
        uri,
      })
    );

    // Create ATA if needed
    if (!ataInfo) {
      tx2Instructions.push(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          associatedToken,
          payer.publicKey,
          mint,
          TOKEN22_PROGRAM,
          ASSOCIATED_TOKEN_PROGRAM
        )
      );
    }

    // Mint the NFT
    tx2Instructions.push(
      createMintToInstruction(
        mint,
        associatedToken,
        payer.publicKey,
        BigInt(supply),
        [],
        TOKEN22_PROGRAM
      )
    );

    const tx2 = new Transaction().add(...tx2Instructions);
    tx2.feePayer = payer.publicKey;
    const { blockhash: blockhash2 } = await connection.getLatestBlockhash();
    tx2.recentBlockhash = blockhash2;

    const signedTx2 = await wallet.signTransaction(tx2);
    const sig2 = await connection.sendRawTransaction(signedTx2.serialize(), {
      skipPreflight: true,
      maxRetries: 3,
    });
    await connection.confirmTransaction(sig2, "confirmed");
    console.log("✅ Transaction 2 complete! Signature:", sig2);

    console.log(
      "🎉 SUCCESS! Your NFT has been created in 2 optimized transactions on Gorbchain!"
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 NFT Address:", mint.toBase58());
    console.log("🏷️ Name:", name);
    console.log("🏷️ Symbol:", symbol);
    console.log("📄 Metadata URI:", uri);
    console.log("🎨 Using Token22 Program");
    console.log("🌐 Network: Gorbchain");
    console.log("📦 Transaction 1 (Setup):", sig1);
    console.log("📦 Transaction 2 (Complete):", sig2);
    console.log(
      "⚡ Total Instructions:",
      tx1Instructions.length + tx2Instructions.length
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      nftAddress: mint.toBase58(),
      signature: sig2, // Return the final signature
      metadataUri: uri,
      success: true,
      transactionCount: 2,
      setupSignature: sig1,
      completeSignature: sig2,
    };
  } catch (error: any) {
    console.error("❌ Error creating NFT with 2-transaction approach:", error);
    throw error;
  }
}

export async function mintGorbTokenTwoTx({
  connection,
  wallet,
  name,
  symbol,
  supply,
  decimals,
  uri,
  freezeAuth = null,
}: {
  connection: Connection;
  wallet: any;
  name: string;
  symbol: string;
  supply: string | number;
  decimals: string | number;
  uri: string;
  freezeAuth: PublicKey | null;
}) {
  try {
    console.log(
      "🚀 Creating Token using Token22 (2-Transaction Optimized) on Gorbchain...",
      `freezeauth == ${freezeAuth}`
    );
    console.log("Params:", { name, symbol, supply, decimals, uri });

    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    const payer = wallet;
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    // Calculate space requirements
    const extensions = [ExtensionType.MetadataPointer];
    const mintLen = getMintLen(extensions);
    const metadataSpace = calculateMetadataSpace(name, symbol, uri);
    const mintRent = await connection.getMinimumBalanceForRentExemption(
      mintLen
    );

    console.log("💰 Mint space needed:", mintLen, "bytes");
    console.log("💰 Metadata space needed:", metadataSpace, "bytes");
    console.log("💰 Mint rent needed:", mintRent / 1e9, "SOL");
    console.log("🔑 Token Address:", mint.toBase58());

    // ===== TRANSACTION 1: Setup mint account =====
    console.log("📦 Transaction 1: Setting up mint account...");

    const tx1Instructions = [
      // Create mint account
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        lamports: mintRent,
        space: mintLen,
        programId: TOKEN22_PROGRAM,
      }),
      // Initialize metadata pointer
      createInitializeMetadataPointerInstruction(
        mint,
        payer.publicKey,
        mint,
        TOKEN22_PROGRAM
      ),
      // Initialize mint
      createInitializeMintInstruction(
        mint,
        Number(decimals),
        payer.publicKey,
        freezeAuth ? freezeAuth : null,
        TOKEN22_PROGRAM
      ),
    ];

    const tx1 = new Transaction().add(...tx1Instructions);
    tx1.feePayer = payer.publicKey;
    const { blockhash: blockhash1 } = await connection.getLatestBlockhash();
    tx1.recentBlockhash = blockhash1;
    tx1.partialSign(mintKeypair);

    const signedTx1 = await wallet.signTransaction(tx1);
    const sig1 = await connection.sendRawTransaction(signedTx1.serialize(), {
      skipPreflight: true,
      maxRetries: 3,
    });
    await connection.confirmTransaction(sig1, "confirmed");
    console.log("✅ Transaction 1 complete! Signature:", sig1);

    // ===== TRANSACTION 2: Add metadata space, initialize metadata, create ATA, and mint =====
    console.log("📦 Transaction 2: Completing token setup...");

    // Calculate additional rent needed for metadata
    const accountInfo = await connection.getAccountInfo(mint);
    if (!accountInfo) {
      throw new Error("Mint account not found after first transaction");
    }

    const newSize = accountInfo.data.length + metadataSpace;
    const additionalRent =
      (await connection.getMinimumBalanceForRentExemption(newSize)) -
      (await connection.getMinimumBalanceForRentExemption(
        accountInfo.data.length
      ));

    // Get associated token account
    const associatedToken = getAssociatedTokenAddressSync(
      mint,
      payer.publicKey,
      false,
      TOKEN22_PROGRAM,
      ASSOCIATED_TOKEN_PROGRAM
    );

    // Check if ATA already exists
    const ataInfo = await connection.getAccountInfo(associatedToken);

    const tx2Instructions = [];

    // Add space for metadata if needed
    if (additionalRent > 0) {
      tx2Instructions.push(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: mint,
          lamports: additionalRent,
        })
      );
    }

    // Initialize metadata
    tx2Instructions.push(
      createInitializeInstruction({
        programId: TOKEN22_PROGRAM,
        metadata: mint,
        updateAuthority: payer.publicKey,
        mint: mint,
        mintAuthority: payer.publicKey,
        name,
        symbol,
        uri,
      })
    );

    // Create ATA if needed
    if (!ataInfo) {
      tx2Instructions.push(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          associatedToken,
          payer.publicKey,
          mint,
          TOKEN22_PROGRAM,
          ASSOCIATED_TOKEN_PROGRAM
        )
      );
    }

    // Mint tokens
    const supplyBigInt = BigInt(supply) * BigInt(10 ** Number(decimals));
    tx2Instructions.push(
      createMintToInstruction(
        mint,
        associatedToken,
        payer.publicKey,
        supplyBigInt,
        [],
        TOKEN22_PROGRAM
      )
    );

    const tx2 = new Transaction().add(...tx2Instructions);
    tx2.feePayer = payer.publicKey;
    const { blockhash: blockhash2 } = await connection.getLatestBlockhash();
    tx2.recentBlockhash = blockhash2;

    const signedTx2 = await wallet.signTransaction(tx2);
    const sig2 = await connection.sendRawTransaction(signedTx2.serialize(), {
      skipPreflight: true,
      maxRetries: 3,
    });
    await connection.confirmTransaction(sig2, "confirmed");
    console.log("✅ Transaction 2 complete! Signature:", sig2);

    console.log(
      "🎉 SUCCESS! Your Token has been created in 2 optimized transactions on Gorbchain!"
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 Token Address:", mint.toBase58());
    console.log("🏷️ Name:", name);
    console.log("🏷️ Symbol:", symbol);
    console.log("📊 Supply:", supply);
    console.log("📊 Decimals:", decimals);
    console.log("📄 Metadata URI:", uri);
    console.log("🎨 Using Token22 Program");
    console.log("🌐 Network: Gorbchain");
    console.log("📦 Transaction 1 (Setup):", sig1);
    console.log("📦 Transaction 2 (Complete):", sig2);
    console.log(
      "⚡ Total Instructions:",
      tx1Instructions.length + tx2Instructions.length
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      tokenAddress: mint.toBase58(),
      tokenAccount: associatedToken.toBase58(),
      supply: supply,
      decimals: decimals,
      name,
      symbol,
      uri,
      signature: sig2,
      success: true,
      transactionCount: 2,
      setupSignature: sig1,
      completeSignature: sig2,
    };
  } catch (error: any) {
    console.error(
      "❌ Error creating Token with 2-transaction approach:",
      error
    );
    throw error;
  }
}

// Transaction simulation and debugging utility
export async function simulateTransactionDetailed(
  connection: Connection,
  transaction: Transaction,
  wallet: any
) {
  try {
    console.log("🔍 TRANSACTION SIMULATION STARTING...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Check wallet balance first
    const balance = await connection.getBalance(wallet.publicKey);
    console.log("💰 Wallet Balance:", balance / 1e9, "SOL");

    // Check if we have enough SOL for the transaction
    const estimatedFee = 0.01; // Conservative estimate
    if (balance < estimatedFee * 1e9) {
      console.log(
        "❌ INSUFFICIENT BALANCE - Need at least",
        estimatedFee,
        "SOL"
      );
      return { success: false, error: "Insufficient balance" };
    }

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    console.log("📊 Transaction Details:");
    console.log("  - Instructions:", transaction.instructions.length);
    console.log(
      "  - Accounts:",
      transaction.instructions
        .map((ix) => ix.keys.length)
        .reduce((a, b) => a + b, 0)
    );
    console.log("  - Recent Blockhash:", blockhash);
    console.log("  - Fee Payer:", wallet.publicKey.toBase58());

    // Log each instruction
    transaction.instructions.forEach((ix, index) => {
      console.log(`  📋 Instruction ${index + 1}:`);
      console.log(`    - Program ID: ${ix.programId.toBase58()}`);
      console.log(`    - Accounts: ${ix.keys.length}`);
      console.log(`    - Data Length: ${ix.data.length} bytes`);
    });

    // Simulate the transaction
    console.log("🧪 Running Transaction Simulation...");

    const simulationResult = await connection.simulateTransaction(transaction);

    console.log("📊 SIMULATION RESULTS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (simulationResult.value.err) {
      console.log("❌ SIMULATION FAILED:");
      console.log("   Error:", simulationResult.value.err);

      // Try to decode the error
      if (typeof simulationResult.value.err === "object") {
        console.log(
          "   Error Details:",
          JSON.stringify(simulationResult.value.err, null, 2)
        );
      }

      if (simulationResult.value.logs) {
        console.log("📜 Transaction Logs:");
        simulationResult.value.logs.forEach((log, index) => {
          console.log(`   ${index + 1}. ${log}`);
        });
      }

      return {
        success: false,
        error: simulationResult.value.err,
        logs: simulationResult.value.logs,
      };
    }

    console.log("✅ SIMULATION SUCCESSFUL!");
    console.log("   Compute Units Used:", simulationResult.value.unitsConsumed);

    if (simulationResult.value.accounts) {
      console.log(
        "   Accounts Modified:",
        simulationResult.value.accounts.length
      );
    }

    if (simulationResult.value.logs) {
      console.log("📜 Transaction Logs:");
      simulationResult.value.logs.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log}`);
      });
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      success: true,
      result: simulationResult.value,
      logs: simulationResult.value.logs,
    };
  } catch (error: any) {
    console.log("❌ SIMULATION ERROR:", error.message);
    return { success: false, error: error.message };
  }
}

// Enhanced transaction status checker
export async function checkTransactionStatus(
  connection: Connection,
  signature: string,
  maxRetries: number = 30
) {
  console.log("🔍 Checking transaction status:", signature);

  for (let i = 0; i < maxRetries; i++) {
    try {
      const status = await connection.getSignatureStatus(signature);
      console.log(`📊 Status check ${i + 1}/${maxRetries}:`, status?.value);

      if (
        status?.value?.confirmationStatus === "confirmed" ||
        status?.value?.confirmationStatus === "finalized"
      ) {
        if (status.value.err) {
          console.log("❌ TRANSACTION FAILED:");
          console.log("   Error:", status.value.err);
          return { success: false, error: status.value.err };
        }

        console.log("✅ Transaction confirmed successfully!");
        return { success: true, status: status.value };
      }

      // Wait before next check
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`⚠️ Error checking status (attempt ${i + 1}):`, error);
    }
  }

  console.log("⏰ Transaction status check timeout");
  return { success: false, error: "Transaction confirmation timeout" };
}
