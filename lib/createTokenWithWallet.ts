import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getAssociatedTokenAddressSync,
  createInitializeMetadataPointerInstruction,
  getMintLen,
  ExtensionType,
  createInitializeInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token";
import bs58 from "bs58";

// Constants
const TOKEN22_PROGRAM = new PublicKey("G22oYgZ6LnVcy7v8eSNi2xpNk1NcZiPD8CVKSTut7oZ6");
const ASSOCIATED_TOKEN_PROGRAM = new PublicKey("GoATGVNeSXerFerPqTJ8hcED1msPWHHLxao2vwBYqowm");

// Helper function to calculate metadata space
function calculateMetadataSpace(name: string, symbol: string, uri: string): number {
  const borshSize =
    32 + // update_authority
    32 + // mint
    4 + name.length +
    4 + symbol.length +
    4 + uri.length +
    4; // empty vector
  const tlv = 4;
  return Math.ceil((borshSize + tlv) * 1.1);
}

// Main function compatible with wallet extension
export async function createTokenWithWallet({
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
    console.log("🚀 Creating Token using Token2022 on Gorbchain...");
    console.log("Params:", { name, symbol, supply, decimals, uri });

    // Validate wallet connection
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    const payer = wallet;
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    // Calculate requirements
    const extensions: ExtensionType[] = [ExtensionType.MetadataPointer];
    const mintLen = getMintLen(extensions);
    const metadataSpace = calculateMetadataSpace(name, symbol, uri);
    const mintRent = await connection.getMinimumBalanceForRentExemption(mintLen);

    console.log("🔑 Token Address:", mint.toBase58());

    // ===== TRANSACTION 1: Create and Initialize Mint =====
    console.log("📦 Transaction 1: Creating mint account...");

    const tx1 = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        lamports: mintRent,
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
        freezeAuth,
        TOKEN22_PROGRAM
      )
    );

    tx1.feePayer = payer.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    tx1.recentBlockhash = blockhash;
    tx1.partialSign(mintKeypair);

    const signedTx1 = await wallet.signTransaction(tx1);
    const sig1 = await connection.sendRawTransaction(signedTx1.serialize(), {
      skipPreflight: true,
      maxRetries: 3,
    });
    await connection.confirmTransaction(sig1, "confirmed");
    console.log("✅ Mint Initialized:", sig1);

    // ===== TRANSACTION 2: Metadata, ATA, and Minting =====
    console.log("📦 Transaction 2: Finalizing token setup...");

    // Calculate additional rent for metadata
    const accountInfo = await connection.getAccountInfo(mint);
    if (!accountInfo) throw new Error("❌ Mint account not found after creation");

    const newSize = accountInfo.data.length + metadataSpace;
    const rentOld = await connection.getMinimumBalanceForRentExemption(accountInfo.data.length);
    const rentNew = await connection.getMinimumBalanceForRentExemption(newSize);
    const rentExtra = rentNew - rentOld;

    // Prepare ATA
    const associatedToken = getAssociatedTokenAddressSync(
      mint,
      payer.publicKey,
      false,
      TOKEN22_PROGRAM,
      ASSOCIATED_TOKEN_PROGRAM
    );

    const tx2 = new Transaction();
    
    // Add rent if needed
    if (rentExtra > 0) {
      tx2.add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: mint,
          lamports: rentExtra,
        })
      );
    }

    // Add metadata
    tx2.add(
      createInitializeInstruction({
        programId: TOKEN22_PROGRAM,
        metadata: mint,
        mint: mint,
        mintAuthority: payer.publicKey,
        updateAuthority: payer.publicKey,
        name,
        symbol,
        uri,
      })
    );

    // Add ATA creation if needed
    const ataInfo = await connection.getAccountInfo(associatedToken);
    if (!ataInfo) {
      tx2.add(
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

    // Add minting
    const mintAmount = BigInt(supply) * BigInt(10 ** Number(decimals));
    tx2.add(
      createMintToInstruction(
        mint,
        associatedToken,
        payer.publicKey,
        mintAmount,
        [],
        TOKEN22_PROGRAM
      )
    );

    tx2.feePayer = payer.publicKey;
    const { blockhash: blockhash2 } = await connection.getLatestBlockhash();
    tx2.recentBlockhash = blockhash2;

    const signedTx2 = await wallet.signTransaction(tx2);
    const sig2 = await connection.sendRawTransaction(signedTx2.serialize(), {
      skipPreflight: true,
      maxRetries: 3,
    });
    await connection.confirmTransaction(sig2, "confirmed");
    console.log("✅ Tokens Minted:", sig2);

    // Return results
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
    console.error("❌ Error creating token:", error.message || error);
    if (error.logs) console.error("Logs:", error.logs.join("\n"));
    throw error;
  }
}


// createTokenWithWallet({
//   connection: new Connection("https://rpc.gorbchain.xyz"),
//   wallet: yourWalletObject, // From wallet adapter
//   name: "Sentra AI",
//   symbol: "SENTRA",
//   supply: 123_123_123_123,
//   decimals: 6,
//   uri: "https://your.metadata.uri/",
//   freezeAuth: null // Or specify freeze authority
// });