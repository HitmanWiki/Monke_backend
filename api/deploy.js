const { Connection, Keypair, Transaction, sendAndConfirmTransaction, BpfLoader, BPF_LOADER_PROGRAM_ID } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  try {
    const { network = 'devnet' } = req.body;
    
    console.log('🚀 Deploying to:', network);
    
    const RPC_URLS = {
      devnet: 'https://api.devnet.solana.com',
      mainnet: process.env.RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=9e676d35-b97a-4f46-b454-a41e9b7c28be'
    };
    
    const connection = new Connection(RPC_URLS[network], 'confirmed');
    
    // Use ADMIN_PRIVATE_KEY from your existing .env
    const privateKeyStr = process.env.ADMIN_PRIVATE_KEY;
    if (!privateKeyStr) {
      return res.status(400).json({ 
        error: 'ADMIN_PRIVATE_KEY not set in .env' 
      });
    }
    
    const deployerKeypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(privateKeyStr))
    );
    
    console.log('👤 Deployer:', deployerKeypair.publicKey.toString());
    
    // Check balance
    const balance = await connection.getBalance(deployerKeypair.publicKey);
    console.log('💰 Balance:', (balance / 1e9).toFixed(4), 'SOL');
    
    // Find program file
    const possiblePaths = [
      path.join(process.cwd(), 'programs', 'worldcup_betting.so'),
      path.join('/tmp', 'programs', 'worldcup_betting.so'),
    ];
    
    let programPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        programPath = p;
        console.log('📁 Found:', p);
        break;
      }
    }
    
    if (!programPath) {
      return res.status(400).json({ 
        error: 'No program file found',
        solutions: {
          upload: 'POST /api/upload-program with .so file',
          github: 'Add worldcup_betting.so to programs/ folder'
        }
      });
    }
    
    const programData = fs.readFileSync(programPath);
    console.log('📦 Size:', programData.length, 'bytes');
    
    const deployCost = await connection.getMinimumBalanceForRentExemption(programData.length);
    console.log('💲 Cost:', (deployCost / 1e9).toFixed(4), 'SOL');
    
    if (balance < deployCost + 5000000) {
      return res.status(400).json({
        error: `Insufficient balance`,
        needed: ((deployCost + 5000000) / 1e9).toFixed(4) + ' SOL',
        current: (balance / 1e9).toFixed(4) + ' SOL',
      });
    }
    
    const programKeypair = Keypair.generate();
    const programId = programKeypair.publicKey;
    
    console.log('📋 Program ID:', programId.toString());
    
    const tx = new Transaction().add(
      ...BpfLoader.load({
        connection,
        payer: deployerKeypair,
        programId: programKeypair,
        elfBytes: programData,
      })
    );
    
    const signature = await sendAndConfirmTransaction(
      connection, tx, 
      [deployerKeypair, programKeypair],
      { commitment: 'confirmed' }
    );
    
    console.log('✅ Deployed!');
    
    res.json({
      success: true,
      programId: programId.toString(),
      signature: signature,
      network: network,
      solscan: `https://solscan.io/account/${programId.toString()}?cluster=${network}`,
      deployer: deployerKeypair.publicKey.toString(),
      nextStep: 'Call /api/initialize with this programId'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
};