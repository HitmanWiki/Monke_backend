const { Connection, Keypair, PublicKey } = require('@solana/web3.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  try {
    const { programId, network = 'devnet' } = req.body;
    
    if (!programId) {
      return res.status(400).json({ error: 'programId is required' });
    }
    
    const PROGRAM_ID = new PublicKey(programId);
    const TOKEN_MINT = new PublicKey(
      process.env.TOKEN_MINT || 'BZP9h9kBEnrBV1N6kmqTbfrJx262Qzre2Mg1NrBHpump'
    );
    
    // Find PDAs
    const [adminConfigPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("admin_config")], PROGRAM_ID
    );
    const [oracleConfigPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("oracle_config")], PROGRAM_ID
    );
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault")], PROGRAM_ID
    );
    const [ultimatePoolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ultimate_pool")], PROGRAM_ID
    );
    
    // Vault token account
    const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
    );
    const TOKEN_PROGRAM_ID = new PublicKey(
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    );
    
    const [vaultTokenAccount] = PublicKey.findProgramAddressSync(
      [vaultPda.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), TOKEN_MINT.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    
    res.json({
      success: true,
      programId: programId,
      accounts: {
        adminConfig: adminConfigPda.toString(),
        oracleConfig: oracleConfigPda.toString(),
        vault: vaultPda.toString(),
        ultimatePool: ultimatePoolPda.toString(),
        vaultTokenAccount: vaultTokenAccount.toString(),
      },
      tokenMint: TOKEN_MINT.toString(),
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};