import TonWeb from "tonweb";

const nacl = TonWeb.utils.nacl; 
const tonweb = new TonWeb();
const keyPair = nacl.sign.keyPair();

console.log(keyPair)
const publicKey = keyPair.publicKey;
const secretKey = keyPair.secretKey;

const wallet = tonweb.wallet.create({publicKey});

const address = await wallet.getAddress();

const nonBounceableAddress = address.toString(true, true, false);

const seqno = await wallet.methods.seqno().call();

await wallet.deploy(secretKey).send(); // deploy wallet to blockchain


const fee = await wallet.methods.transfer({
    secretKey,
    toAddress: '0QDJwEY55FobezXjCsq9k9sdBo-1bL96M2SHahleLRq_tBer',
    amount: TonWeb.utils.toNano(1), // 0.01 TON
    seqno: seqno,
    payload: 'Hello',
    sendMode: 3,
}).estimateFee();

const Cell = TonWeb.boc.Cell;
const cell = new Cell();
cell.bits.writeUint(0, 32);
cell.bits.writeAddress(address);
cell.bits.writeGrams(1);
console.log(cell.print());
const bocBytes = cell.toBoc();
const history = await tonweb.getTransactions(address);
const balance = await tonweb.getBalance(address);

tonweb.sendBoc(bocBytes);
