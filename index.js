import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToKeyPair } from "tonweb-mnemonic";
import TonWeb from "tonweb";
const Address = TonWeb.Address;

async function example() {
    const addressStr = '0QA91lQ0oNu4N44WVVXGf95mUY3VlxxrMhiN6PaKh9IN2QE4';
    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const provider = new TonWeb.HttpProvider(endpoint);
    const tonweb = new TonWeb(provider);
    const address = new TonWeb.Address(addressStr);


    // 获取TON余额
    const balance = await tonweb.getBalance(address);
    console.log('TON余额:', balance);

    console.log('\n查询指定hash的交易:')
    await sleep(500)
    const txHash = 'GiWwZzXJ8EMfvOb4oHD5z+LZm/tMu2Ean32RXd0z6H0=';
    const lt = "27995273000001";

    const txInfo = await tonweb.getTransactions(address, 10, lt, txHash);
    console.log('交易信息:', txInfo);



    // ---  转账逻辑 ---
    const mnemonic = require('fs').readFileSync("./.mnemonic", { encoding: "utf-8" });
    const key = await mnemonicToKeyPair(mnemonic.split(" "));


    // open wallet v4
    const WalletClass = tonweb.wallet.all.v4R2;
    const wallet = new WalletClass(provider, { publicKey: key.publicKey });


    const myAddress = await wallet.getAddress();
    console.log('address=', myAddress.toString(true, true, true, false));
    const seqno = await wallet.methods.seqno().call();
    console.log('seqno=', seqno);

    const deploy = wallet.deploy(key.secretKey); // deploy method
    const deployFee = await deploy.estimateFee()  // get estimate fee of deploy
    console.log(deployFee);
    const deploySended = await deploy.send() // deploy wallet contract to blockchain
    console.log(deploySended);
    const deployQuery = await deploy.getQuery();   // get deploy query Cell
    console.log(deployQuery);
    const transfer = wallet.methods.transfer({
        secretKey: key.secretKey,
        toAddress: "0QDJwEY55FobezXjCsq9k9sdBo-1bL96M2SHahleLRq_tBer",
        amount: TonWeb.utils.toNano("0.00001"),
        seqno: seqno,
        payload: "Hello",
        sendMode: 3,
    });

    const transferFee = await transfer.estimateFee();   // get estimate fee of transfer
    console.log(transferFee);
    console.log(`转账开始:`)
    await sleep(100);
    const transferSended = await transfer.send();  // send transfer query to blockchain
    console.log(transferSended);

    const transferQuery = await transfer.getQuery(); // get transfer query Cell
    console.log(transferQuery);


    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log("waiting for transaction to confirm...");
        await sleep(1500);
        currentSeqno = await wallet.methods.seqno().call() || 0;
    }

    console.log("transaction confirmed! Hash:", transferResult.transaction.hash); // 打印交易哈希



    // 购买Coffee:
    const jettonMasterContract = new tonweb.Contract(provider, {
        address: new TonWeb.Address('EQA9dayEKflrL-wIf-GKGizj26pvX0QCIxwmRgqzg5U_c3YB')
    });

    const stateInit = await jettonMasterContract.createStateInit();
    console.log(stateInit.stateInit());




    const jettonMasterAddress = new Address('EQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy-UrdrPcUo');

    async function fetchJettonMetadata() {
        try {
            const contract = new tonweb.Contract(tonweb.provider, {
                code: "b5ee9c720101040100a6000285080179512f0b1815976de4cc614336e3252dbea24e3a45290191c6916d622ae7cdfe211a56b90a6f27e9f2c5241dd6b2c716d530d50027787d2a0e4223997141d188c001020842020f1ad3d8a46bd283321dde639195fb72602e9b31b1727fecc25e2edc10966df4010003006e68747470733a2f2f6170692e68616d737465726b6f6d6261742e696f2f7075626c69632f746f6b656e2f6d657461646174612e6a736f6e",
                address: new Address("EQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy-UrdrPcUo")
            });
            const data = await contract.createStateInit()

            console.log(data)
        } catch (error) {
            console.error('Error fetching jetton metadata:', error);
        }
    }

    fetchJettonMetadata();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


example();