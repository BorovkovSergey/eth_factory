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

const toAccountPK = "cfb12303a19cde580bb4dd771639b0d26bc68353645571a8cff516ab2ee113a0";
const toAccountPubkey = web3.eth.accounts.privateKeyToAccount(toAccountPK).address;


beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({
            data: compiledFactory.bytecode
        })
        .send({ from: accounts[0], gas: '5000000' });


    await factory.methods.createContract(toAccountPubkey, "So11111111111111111111111111111111111111112").send({ from: accounts[0], gas: '5000000' });

    [contractAddress] = await factory.methods.getDeployedContracts().call();
    redirectContract = await new web3.eth.Contract(compiledFundRedirect.abi, contractAddress);
});

describe('Factory Contract', () => {
    it("should do send funds over redirect contract", async () => {
        await web3.eth.sendTransaction({ from: accounts[0], to: contractAddress, value: web3.utils.toWei('1', 'ether') });

        const toAccountPubkeyBalance_after_send = await web3.eth.getBalance(toAccountPubkey);
        const redirectContractBalance_after_send = await web3.eth.getBalance(contractAddress);

        console.log("toAccountPubkey:", toAccountPubkey);
        console.log("contractAddress:", contractAddress);
        console.log("solAddress:", await redirectContract.methods.getSolAddress().call());
        console.log("");
        console.log("toAccountPubkeyBalance_after_send:", toAccountPubkeyBalance_after_send);
        console.log("redirectContractBalance_after_send:", redirectContractBalance_after_send);
    });
});