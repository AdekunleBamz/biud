/**
 * BiUD Mainnet Deployment Script v2
 * Deploys the BiUD username contract to Stacks mainnet
 */

const fs = require('fs');
const https = require('https');
const {
  makeContractDeploy,
  AnchorMode,
  PostConditionMode,
} = require('@stacks/transactions');

const PRIVATE_KEY = '75d9505011762184b07cca11cf33c8190bf060b736d297b4390d404b63d8ec8901';
const API_URL = 'api.mainnet.hiro.so';

function broadcastTx(txHex) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(txHex, 'hex');
    
    const options = {
      hostname: API_URL,
      port: 443,
      path: '/v2/transactions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({ raw: body, status: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function deployContract(contractPath, contractName, nonce) {
  console.log(`\nDeploying ${contractName}...`);
  
  const codeBody = fs.readFileSync(contractPath, 'utf8');
  
  const txOptions = {
    codeBody,
    contractName,
    senderKey: PRIVATE_KEY,
    network: 'mainnet',
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    fee: 500000n,
    nonce: BigInt(nonce),
  };

  console.log(`Creating transaction...`);
  const transaction = await makeContractDeploy(txOptions);
  
  // Get the serialized transaction as Uint8Array, then convert to hex
  const serialized = transaction.serialize();
  console.log(`TX size: ${serialized.length} bytes`);
  const txHex = Buffer.from(serialized).toString('hex');
  
  console.log(`Broadcasting to mainnet...`);
  const result = await broadcastTx(txHex);
  
  if (result.txid) {
    console.log(`✅ Transaction submitted!`);
    console.log(`   TXID: ${result.txid}`);
    console.log(`   Explorer: https://explorer.hiro.so/txid/${result.txid}?chain=mainnet`);
    return result.txid;
  } else if (result.error) {
    console.error(`❌ Error: ${result.error}`);
    console.error(`   Reason: ${result.reason || result.reason_data || 'Unknown'}`);
    return null;
  } else {
    console.log('Response:', result);
    return result.raw || null;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('BiUD Mainnet Deployment');
  console.log('='.repeat(60));
  
  // Get current nonce
  const nonceResponse = await fetch(
    `https://${API_URL}/extended/v1/address/SP31G2FZ5JN87BATZMP4ZRYE5F7WZQDNEXJ7G7X97/nonces`
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
