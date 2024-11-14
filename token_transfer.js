import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "@ton/crypto";
import { Address, TonClient, WalletContractV4, internal, JettonWallet, address } from "@ton/ton";

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
    console.log(`查看Hamster合约信息`)
    console.log(
        await client.getContractState("kQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy-UrdrPX6i")
    )
    // token transfer
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: "kQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy-UrdrPX6i",
                value: "0.000001",
                body: "1111111",
                bounce: false,
            })
        ]
    })
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
