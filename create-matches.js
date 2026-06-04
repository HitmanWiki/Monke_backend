// create-matches.js - Creates all 104 World Cup matches on-chain
require('dotenv').config();
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js');
const bs58 = require('bs58');

// Config
const PROGRAM_ID = '8ZPvMMXMAhDNGroTNHbcGtLYjD5r1Le6iZduuqXiBRCc';
const RPC_URL = 'https://api.devnet.solana.com';
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Base58 admin private key

// All 104 World Cup 2026 matches
const MATCHES = [
  { id: 1, home: "Mexico", away: "South Africa", date: "2026-06-12T00:30:00Z" },
  { id: 2, home: "Korea Republic", away: "Czechia", date: "2026-06-12T07:30:00Z" },
  { id: 3, home: "Czechia", away: "South Africa", date: "2026-06-18T21:30:00Z" },
  { id: 4, home: "Mexico", away: "Korea Republic", date: "2026-06-19T06:30:00Z" },
  { id: 5, home: "Czechia", away: "Mexico", date: "2026-06-25T06:30:00Z" },
  { id: 6, home: "South Africa", away: "Korea Republic", date: "2026-06-25T06:30:00Z" },
  { id: 7, home: "Canada", away: "Bosnia and Herzegovina", date: "2026-06-13T00:30:00Z" },
  { id: 8, home: "Qatar", away: "Switzerland", date: "2026-06-14T00:30:00Z" },
  { id: 9, home: "Switzerland", away: "Bosnia and Herzegovina", date: "2026-06-19T00:30:00Z" },
  { id: 10, home: "Canada", away: "Qatar", date: "2026-06-19T03:30:00Z" },
  { id: 11, home: "Switzerland", away: "Canada", date: "2026-06-25T00:30:00Z" },
  { id: 12, home: "Bosnia and Herzegovina", away: "Qatar", date: "2026-06-25T00:30:00Z" },
  { id: 13, home: "Brazil", away: "Morocco", date: "2026-06-14T03:30:00Z" },
  { id: 14, home: "Haiti", away: "Scotland", date: "2026-06-14T06:30:00Z" },
  { id: 15, home: "Scotland", away: "Morocco", date: "2026-06-20T03:30:00Z" },
  { id: 16, home: "Brazil", away: "Haiti", date: "2026-06-20T06:00:00Z" },
  { id: 17, home: "Scotland", away: "Brazil", date: "2026-06-25T03:30:00Z" },
  { id: 18, home: "Morocco", away: "Haiti", date: "2026-06-25T03:30:00Z" },
  { id: 19, home: "USA", away: "Paraguay", date: "2026-06-13T06:30:00Z" },
  { id: 20, home: "Australia", away: "Türkiye", date: "2026-06-14T09:30:00Z" },
  { id: 21, home: "USA", away: "Australia", date: "2026-06-20T00:30:00Z" },
  { id: 22, home: "Türkiye", away: "Paraguay", date: "2026-06-20T08:30:00Z" },
  { id: 23, home: "Türkiye", away: "USA", date: "2026-06-26T07:30:00Z" },
  { id: 24, home: "Paraguay", away: "Australia", date: "2026-06-26T07:30:00Z" },
  { id: 25, home: "Germany", away: "Curaçao", date: "2026-06-14T22:30:00Z" },
  { id: 26, home: "Côte d'Ivoire", away: "Ecuador", date: "2026-06-15T04:30:00Z" },
  { id: 27, home: "Germany", away: "Côte d'Ivoire", date: "2026-06-21T01:30:00Z" },
  { id: 28, home: "Ecuador", away: "Curaçao", date: "2026-06-21T05:30:00Z" },
  { id: 29, home: "Curaçao", away: "Côte d'Ivoire", date: "2026-06-26T01:30:00Z" },
  { id: 30, home: "Ecuador", away: "Germany", date: "2026-06-26T01:30:00Z" },
  { id: 31, home: "Netherlands", away: "Japan", date: "2026-06-15T01:30:00Z" },
  { id: 32, home: "Sweden", away: "Tunisia", date: "2026-06-15T07:30:00Z" },
  { id: 33, home: "Netherlands", away: "Sweden", date: "2026-06-20T22:30:00Z" },
  { id: 34, home: "Tunisia", away: "Japan", date: "2026-06-21T09:30:00Z" },
  { id: 35, home: "Japan", away: "Sweden", date: "2026-06-26T04:30:00Z" },
  { id: 36, home: "Tunisia", away: "Netherlands", date: "2026-06-26T04:30:00Z" },
  { id: 37, home: "Belgium", away: "Egypt", date: "2026-06-16T00:30:00Z" },
  { id: 38, home: "IR Iran", away: "New Zealand", date: "2026-06-16T06:30:00Z" },
  { id: 39, home: "Belgium", away: "IR Iran", date: "2026-06-22T00:30:00Z" },
  { id: 40, home: "New Zealand", away: "Egypt", date: "2026-06-22T06:30:00Z" },
  { id: 41, home: "Egypt", away: "IR Iran", date: "2026-06-27T08:30:00Z" },
  { id: 42, home: "New Zealand", away: "Belgium", date: "2026-06-27T08:30:00Z" },
  { id: 43, home: "Spain", away: "Cabo Verde", date: "2026-06-15T21:30:00Z" },
  { id: 44, home: "Saudi Arabia", away: "Uruguay", date: "2026-06-16T03:30:00Z" },
  { id: 45, home: "Spain", away: "Saudi Arabia", date: "2026-06-21T21:30:00Z" },
  { id: 46, home: "Uruguay", away: "Cabo Verde", date: "2026-06-22T03:30:00Z" },
  { id: 47, home: "Cabo Verde", away: "Saudi Arabia", date: "2026-06-27T05:30:00Z" },
  { id: 48, home: "Uruguay", away: "Spain", date: "2026-06-27T05:30:00Z" },
  { id: 49, home: "France", away: "Senegal", date: "2026-06-17T00:30:00Z" },
  { id: 50, home: "Iraq", away: "Norway", date: "2026-06-17T03:30:00Z" },
  { id: 51, home: "France", away: "Iraq", date: "2026-06-23T02:30:00Z" },
  { id: 52, home: "Norway", away: "Senegal", date: "2026-06-23T05:30:00Z" },
  { id: 53, home: "Norway", away: "France", date: "2026-06-27T00:30:00Z" },
  { id: 54, home: "Senegal", away: "Iraq", date: "2026-06-27T00:30:00Z" },
  { id: 55, home: "Argentina", away: "Algeria", date: "2026-06-17T06:30:00Z" },
  { id: 56, home: "Austria", away: "Jordan", date: "2026-06-17T09:30:00Z" },
  { id: 57, home: "Argentina", away: "Austria", date: "2026-06-22T22:30:00Z" },
  { id: 58, home: "Jordan", away: "Algeria", date: "2026-06-23T08:30:00Z" },
  { id: 59, home: "Algeria", away: "Austria", date: "2026-06-28T07:30:00Z" },
  { id: 60, home: "Jordan", away: "Argentina", date: "2026-06-28T07:30:00Z" },
  { id: 61, home: "Portugal", away: "Congo DR", date: "2026-06-17T22:30:00Z" },
  { id: 62, home: "Uzbekistan", away: "Colombia", date: "2026-06-18T07:30:00Z" },
  { id: 63, home: "Portugal", away: "Uzbekistan", date: "2026-06-23T22:30:00Z" },
  { id: 64, home: "Colombia", away: "Congo DR", date: "2026-06-24T07:30:00Z" },
  { id: 65, home: "Colombia", away: "Portugal", date: "2026-06-28T05:00:00Z" },
  { id: 66, home: "Congo DR", away: "Uzbekistan", date: "2026-06-28T05:00:00Z" },
  { id: 67, home: "England", away: "Croatia", date: "2026-06-18T01:30:00Z" },
  { id: 68, home: "Ghana", away: "Panama", date: "2026-06-18T04:30:00Z" },
  { id: 69, home: "England", away: "Ghana", date: "2026-06-24T01:30:00Z" },
  { id: 70, home: "Panama", away: "Croatia", date: "2026-06-24T04:30:00Z" },
  { id: 71, home: "Panama", away: "England", date: "2026-06-28T02:30:00Z" },
  { id: 72, home: "Croatia", away: "Ghana", date: "2026-06-28T02:30:00Z" },
  { id: 73, home: "2A", away: "2B", date: "2026-06-29T00:30:00Z" },
  { id: 74, home: "1C", away: "2F", date: "2026-06-29T22:30:00Z" },
  { id: 75, home: "1E", away: "3ABCDF", date: "2026-06-30T02:00:00Z" },
  { id: 76, home: "1F", away: "2C", date: "2026-06-30T06:30:00Z" },
  { id: 77, home: "2E", away: "2I", date: "2026-06-30T22:30:00Z" },
  { id: 78, home: "1I", away: "3CDFGH", date: "2026-07-01T02:30:00Z" },
  { id: 79, home: "1A", away: "3CEFHI", date: "2026-07-01T06:30:00Z" },
  { id: 80, home: "1L", away: "3EHIJK", date: "2026-07-01T21:30:00Z" },
  { id: 81, home: "1G", away: "3AEHIJ", date: "2026-07-02T01:30:00Z" },
  { id: 82, home: "1D", away: "3BEFIJ", date: "2026-07-02T05:30:00Z" },
  { id: 83, home: "1H", away: "2J", date: "2026-07-03T00:30:00Z" },
  { id: 84, home: "2K", away: "2L", date: "2026-07-03T04:30:00Z" },
  { id: 85, home: "1B", away: "3EFGIJ", date: "2026-07-03T08:30:00Z" },
  { id: 86, home: "2D", away: "2G", date: "2026-07-03T23:30:00Z" },
  { id: 87, home: "1J", away: "2H", date: "2026-07-04T03:30:00Z" },
  { id: 88, home: "1K", away: "3DEIJL", date: "2026-07-04T07:00:00Z" },
  { id: 89, home: "W73", away: "W75", date: "2026-07-04T22:30:00Z" },
  { id: 90, home: "W74", away: "W77", date: "2026-07-05T02:30:00Z" },
  { id: 91, home: "W76", away: "W78", date: "2026-07-06T01:30:00Z" },
  { id: 92, home: "W79", away: "W80", date: "2026-07-06T05:30:00Z" },
  { id: 93, home: "W83", away: "W84", date: "2026-07-07T00:30:00Z" },
  { id: 94, home: "W81", away: "W82", date: "2026-07-07T05:30:00Z" },
  { id: 95, home: "W86", away: "W88", date: "2026-07-07T21:30:00Z" },
  { id: 96, home: "W85", away: "W87", date: "2026-07-08T01:30:00Z" },
  { id: 97, home: "W89", away: "W90", date: "2026-07-10T01:30:00Z" },
  { id: 98, home: "W93", away: "W94", date: "2026-07-11T00:30:00Z" },
  { id: 99, home: "W91", away: "W92", date: "2026-07-12T02:30:00Z" },
  { id: 100, home: "W95", away: "W96", date: "2026-07-12T06:30:00Z" },
  { id: 101, home: "W97", away: "W98", date: "2026-07-15T00:30:00Z" },
  { id: 102, home: "W99", away: "W100", date: "2026-07-16T00:30:00Z" },
  { id: 103, home: "RU101", away: "RU102", date: "2026-07-19T02:30:00Z" },
  { id: 104, home: "W101", away: "W102", date: "2026-07-20T00:30:00Z" }
];

class BN {
  constructor(num) {
    this.num = BigInt(num);
  }
  toArrayLike(Buffer, endian, len) {
    const buf = Buffer.alloc(len);
    buf.writeBigUInt64LE(this.num);
    return buf;
  }
}

async function createAllMatches() {
  if (!PRIVATE_KEY) {
    console.error('❌ Set PRIVATE_KEY in .env file');
    process.exit(1);
  }
  
  const secretKey = bs58.decode(PRIVATE_KEY);
  const adminKeypair = Keypair.fromSecretKey(secretKey);
  
  console.log('👤 Admin:', adminKeypair.publicKey.toString());
  
  const connection = new Connection(RPC_URL, 'confirmed');
  const programId = new PublicKey(PROGRAM_ID);
  
  const balance = await connection.getBalance(adminKeypair.publicKey);
  console.log('💰 Balance:', (balance / 1e9).toFixed(4), 'SOL');
  
  const [adminConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("admin_config")], programId
  );
  
  console.log('\n📋 Creating 104 World Cup matches...\n');
  
  let success = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const match of MATCHES) {
    try {
      const startTime = Math.floor(new Date(match.date).getTime() / 1000);
      const betDeadline = startTime - 300; // 5 min before kickoff
      
      const [matchPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("match"), new BN(match.id).toArrayLike(Buffer, 'le', 8)],
        programId
      );
      
      // Check if match already exists
      const existing = await connection.getAccountInfo(matchPda);
      if (existing && existing.data.length > 0) {
        console.log(`⏭️  Match ${match.id}: ${match.home} vs ${match.away} - ALREADY EXISTS`);
        skipped++;
        continue;
      }
      
      // Create match instruction
      const ix = new TransactionInstruction({
        keys: [
          { pubkey: adminKeypair.publicKey, isSigner: true, isWritable: true },
          { pubkey: adminConfigPda, isSigner: false, isWritable: false },
          { pubkey: matchPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: programId,
        data: Buffer.concat([
          Buffer.from([1]), // create_match instruction
          new BN(match.id).toArrayLike(Buffer, 'le', 8),
          new BN(startTime).toArrayLike(Buffer, 'le', 8),
          new BN(betDeadline).toArrayLike(Buffer, 'le', 8),
        ])
      });
      
      const tx = new Transaction().add(ix);
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = adminKeypair.publicKey;
      
      const signature = await sendAndConfirmTransaction(connection, tx, [adminKeypair]);
      
      console.log(`✅ Match ${match.id}: ${match.home} vs ${match.away} - ${signature.slice(0, 8)}...`);
      success++;
      
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 200));
      
    } catch (error) {
      console.log(`❌ Match ${match.id}: ${match.home} vs ${match.away} - ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n========================================');
  console.log('  RESULTS');
  console.log('========================================');
  console.log('  ✅ Created:', success);
  console.log('  ⏭️  Skipped:', skipped);
  console.log('  ❌ Failed:', failed);
  console.log('  📊 Total:', MATCHES.length);
  console.log('========================================');
}

createAllMatches().catch(console.error);