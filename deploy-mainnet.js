/**
 * BiUD Mainnet Deployment Script
 * Deploys the BiUD username contract to Stacks mainnet
 */

const fs = require('fs');
const {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
} = require('@stacks/transactions');

const PRIVATE_KEY = '75d9505011762184b07cca11cf33c8190bf060b736d297b4390d404b63d8ec8901';
const NETWORK = 'mainnet';

async function deployContract(contractPath, contractName, nonce) {
  console.log(`\nDeploying ${contractName}...`);
  
  const codeBody = fs.readFileSync(contractPath, 'utf8');
  
  const txOptions = {
    codeBody,
    contractName,
    senderKey: PRIVATE_KEY,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    fee: 500000n, // 0.5 STX fee
    nonce: BigInt(nonce),
  };

  console.log(`Creating transaction...`);
  const transaction = await makeContractDeploy(txOptions);
  
  console.log(`Broadcasting to mainnet...`);
  
  try {
    const broadcastResponse = await broadcastTransaction(transaction, NETWORK);
    
    if (broadcastResponse.error) {
      console.error(`Error: ${broadcastResponse.error}`);
      console.error(`Reason: ${broadcastResponse.reason}`);
      return null;
    }
    
    console.log(`✅ Transaction submitted!`);
    console.log(`   TXID: ${broadcastResponse.txid}`);
    console.log(`   Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=mainnet`);
    
    return broadcastResponse.txid;
  } catch (err) {
    console.error('Broadcast error:', err.message);
    // Try manual broadcast
    const { serializeTransaction } = require('@stacks/transactions');
    const txHex = Buffer.from(serializeTransaction(transaction)).toString('hex');
    
    console.log('Trying manual broadcast...');
    const response = await fetch('https://api.mainnet.hiro.so/v2/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: Buffer.from(txHex, 'hex'),
    });
    const result = await response.text();
    console.log('Response:', result);
    return result;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('BiUD Mainnet Deployment');
  console.log('='.repeat(60));
  
  // Get current nonce
  const nonceResponse = await fetch(
    'https://api.mainnet.hiro.so/extended/v1/address/SP31G2FZ5JN87BATZMP4ZRYE5F7WZQDNEXJ7G7X97/nonces'
  );
  const nonceData = await nonceResponse.json();
  let nonce = nonceData.possible_next_nonce;
  
  console.log(`\nDeployer: SP31G2FZ5JN87BATZMP4ZRYE5F7WZQDNEXJ7G7X97`);
  console.log(`Starting nonce: ${nonce}`);
  
  // Deploy biud-username
  const txid1 = await deployContract(
    './contracts/biud-username.clar',
    'biud-username',
    nonce
  );
  
  if (txid1) {
    nonce++;
    
    // Deploy biud-resolver
    const txid2 = await deployContract(
      './contracts/biud-resolver.clar', 
      'biud-resolver',
      nonce
    );
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Deployment complete! Check explorer for confirmation.');
  console.log('='.repeat(60));
}

main().catch(console.error);
