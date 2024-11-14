import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "@ton/crypto";
import { TonClient, WalletContractV4, internal } from "@ton/ton";

async function main() {
    const mnemonic = require('fs').readFileSync("./.mnemonic", { encoding: "utf-8" });
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const client = new TonClient({ endpoint });
    console.log(`address:`, wallet.address)
    if (!await client.isContractDeployed(wallet.address)) {
        return console.log("wallet is not deployed");
    }
    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: "EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e",
                value: "0.0005",
                body: "1111111",
                bounce: false,
            })
        ]
    });

    // wait until confirmed
    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log("waiting for transaction to confirm...");
        await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
        console.log({ currentSeqno })
    }
    console.log("transaction confirmed!");
}

main();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
