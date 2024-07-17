require('dotenv').config();
const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { Market, OpenOrders } = require('@project-serum/serum');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

const SOL_MINT_ADDRESS = 'So11111111111111111111111111111111111111112';
const USDC_MINT_ADDRESS = 'Your_USDC_MINT_Address';
const DOG_MINT_ADDRESS = 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm';
const SERUM_DEX_PROGRAM_ID = new PublicKey('9xQeWvG816bUx9EPSEh7PXA3LJgG1qj4KBwXiskxUGDN');


const SOL_USDC_MARKET_ADDRESS = new PublicKey('Your_SOL_USDC_Market_Address'); 
const USDC_DOG_MARKET_ADDRESS = new PublicKey('Your_USDC_DOG_Market_Address'); 

const connection = new Connection('https://api.mainnet-beta.solana.com');

async function swapSolForUsdc(wallet, amount) {
    const market = await Market.load(connection, SOL_USDC_MARKET_ADDRESS, {}, SERUM_DEX_PROGRAM_ID);

    const openOrdersAccount = new Keypair();
    const transaction = new Transaction();
    transaction.add(
        SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: openOrdersAccount.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(OpenOrders.getLayout(market)._span),
            space: OpenOrders.getLayout(market)._span,
            programId: SERUM_DEX_PROGRAM_ID,
        })
    );

    const order = {
        owner: wallet.publicKey,
        payer: wallet.publicKey,
        side: 'buy',
        price: 120, 
        size: amount, 
        orderType: 'limit',
    };
    transaction.add(market.makePlaceOrderInstruction(connection, order, openOrdersAccount.publicKey));

    transaction.sign(wallet, openOrdersAccount);
    const txid = await connection.sendTransaction(transaction, [wallet, openOrdersAccount]);
    console.log(`Transaction ID: ${txid}`);
}

async function swapUsdcForDog(wallet, amount) {
    const market = await Market.load(connection, USDC_DOG_MARKET_ADDRESS, {}, SERUM_DEX_PROGRAM_ID);

    const openOrdersAccount = new Keypair();
    const transaction = new Transaction();
    transaction.add(
        SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: openOrdersAccount.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(OpenOrders.getLayout(market)._span),
            space: OpenOrders.getLayout(market)._span,
            programId: SERUM_DEX_PROGRAM_ID,
        })
    );

    const order = {
        owner: wallet.publicKey,
        payer: wallet.publicKey,
        side: 'buy',
        price: 1, 
        size: amount,
        orderType: 'limit',
    };
    transaction.add(market.makePlaceOrderInstruction(connection, order, openOrdersAccount.publicKey));

    transaction.sign(wallet, openOrdersAccount);
    const txid = await connection.sendTransaction(transaction, [wallet, openOrdersAccount]);
    console.log(`Transaction ID: ${txid}`);
}

(async () => {
    const secretKey = Uint8Array.from(JSON.parse(process.env.SECRET_KEY));
    const wallet = Keypair.fromSecretKey(secretKey);
    await swapSolForUsdc(wallet, 0.1);
    await swapUsdcForDog(wallet, 0.1);
})();
