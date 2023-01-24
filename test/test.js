const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../build/contracts/Factory.json');
const compiledFundRedirect = require('../build/contracts/FundRedirect.json');

let accounts;
let factory;
let contractAddress;
let redirectContract;

const toPK = "cfb12303a19cde580bb4dd771639b0d26bc68353645571a8cff516ab2ee113a0";
const toAccountAddress = web3.eth.accounts.privateKeyToAccount(toPK).address;


const fromPK = "cfb12303a19cde580bb4dd771639b0d26bc68353645571a8cff516ab2ee113a1";
const fromAccountAddress = web3.eth.accounts.privateKeyToAccount(fromPK).address;


before(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({
            data: compiledFactory.bytecode
        })
        .send({ from: accounts[0], gas: '600000' });


    await factory.methods.createContract(toAccountAddress, "So11111111111111111111111111111111111111112").send({ from: accounts[0], gas: '600000' });

    [contractAddress] = await factory.methods.getDeployedContracts().call();
    redirectContract = await new web3.eth.Contract(compiledFundRedirect.abi, contractAddress);
});

describe('Factory Contract', () => {
    it("should do send funds over redirect contract", async () => {
        await web3.eth.sendTransaction({ from: accounts[0], to: fromAccountAddress, value: web3.utils.toWei('10', 'ether') });

        const fromAccountBalance = await web3.eth.getBalance(fromAccountAddress);
        assert.equal(fromAccountBalance.toString(10), "10000000000000000000");

        const directTx = {
            from: fromAccountAddress,
            to: toAccountAddress,
            value: web3.utils.toWei('1', 'ether'),
            gas: 50000,
            gasPrice: web3.utils.toWei('20', 'gwei'),
            nonce: await web3.eth.getTransactionCount(fromAccountAddress)
        };
        const directSignedTx = await web3.eth.accounts.signTransaction(directTx, fromPK);
        await web3.eth.sendSignedTransaction(directSignedTx.rawTransaction);

        const toAccountBalance_afterDirectlySend = await web3.eth.getBalance(toAccountAddress);
        const fromAccountResultBalance_afterDirectlySend = await web3.eth.getBalance(fromAccountAddress);
        assert.equal(toAccountBalance_afterDirectlySend.toString(10), "1000000000000000000");
        assert.equal(fromAccountResultBalance_afterDirectlySend.toString(10), "8999580000000000000");

        const redirectTx = {
            from: fromAccountAddress,
            to: contractAddress,
            value: web3.utils.toWei('1', 'ether'),
            gas: 50000,
            gasPrice: web3.utils.toWei('20', 'gwei'),
            nonce: 1
        };
        const redirectSignedTx = await web3.eth.accounts.signTransaction(redirectTx, fromPK);
        await web3.eth.sendSignedTransaction(redirectSignedTx.rawTransaction);

        const toAccountBalance_afterRedirectSend = await web3.eth.getBalance(toAccountAddress);
        const fromAccountResultBalance_afterRedirectSend = await web3.eth.getBalance(fromAccountAddress);
        assert.equal(toAccountBalance_afterRedirectSend.toString(10), "2000000000000000000");
        assert.equal(fromAccountResultBalance_afterRedirectSend.toString(10), "7998992540000000000");
    });
});