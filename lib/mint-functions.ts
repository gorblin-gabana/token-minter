"use client";

// Integration points for your actual backend functions
import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
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
} from "@solana/spl-token";

const CUSTOM_MPL_CORE_PROGRAM =
  process.env.NEXT_PUBLIC_GORB_CUSTOM_MPL_CORE_PROGRAM ||
  "GMTAp1moCdGh4TEwFTcCJKeKL3UMEDB6vKpo2uxM9h4s";
const GORBCHAIN_RPC =
  process.env.NEXT_PUBLIC_GORB_RPC_URL || "https://rpc.gorbchain.xyz";

// Gorbagan chain specific program IDs
const TOKEN22_PROGRAM = new PublicKey(
  "G22oYgZ6LnVcy7v8eSNi2xpNk1NcZiPD8CVKSTut7oZ6"
);
const ASSOCIATED_TOKEN_PROGRAM = new PublicKey(
  "GoATGVNeSXerFerPqTJ8hcED1msPWHHLxao2vwBYqowm"
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
