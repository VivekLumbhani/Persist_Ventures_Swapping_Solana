const { Keypair } = require('@solana/web3.js');


const keypair = Keypair.generate();

const secretKey = keypair.secretKey;


console.log('SECRET_KEY=[' + secretKey.toString() + ']');


const fs = require('fs');
fs.writeFileSync('keypair.json', JSON.stringify(Array.from(secretKey)));
console.log('Secret key saved to keypair.json');
