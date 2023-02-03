const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../build/contracts/Factory.json');
const compiledFundRedirect = require('../build/contracts/FundRedirect.json');
const compiledFundFundRedirectLib = require('../build/contracts/FundRedirectLib.json');
const compiledMyToken = require('../build/contracts/MyToken.json');

let accounts;
let factory;
let contractAddress;
let redirectContract;
let myTokenAddress;
let libAddress;

const toPK = "cfb12303a19cde580bb4dd771639b0d26bc68353645571a8cff516ab2ee113a0";
const toAccountAddress = web3.eth.accounts.privateKeyToAccount(toPK).address;

let MyTokenContract;
let MyLibContract;

before(async () => {
    accounts = await web3.eth.getAccounts();

    // DEPLOY MYTOKEN
    {
        const contract = new web3.eth.Contract(compiledMyToken.abi);

        const deploy = contract.deploy({
            data: compiledMyToken.bytecode,
        });
        const deployTransaction = deploy.encodeABI();
        const gasEstimate = await web3.eth.estimateGas({ data: deployTransaction });
        const deployReceipt = await deploy.send({
            from: accounts[0],
            gas: gasEstimate,
            gasPrice: web3.utils.toWei('20', 'gwei')
        });

        myTokenAddress = deployReceipt.options.address;

        MyTokenContract = new web3.eth.Contract(compiledMyToken.abi, myTokenAddress);
    }
    // DEPLOY LIB
    {
        const contractLib = new web3.eth.Contract(compiledFundFundRedirectLib.abi);

        const deployLib = contractLib.deploy({
            data: compiledFundFundRedirectLib.bytecode,
        });
        const deployTransactionLib = deployLib.encodeABI();

        const gasEstimateLib = await web3.eth.estimateGas({ data: deployTransactionLib });
        const deployReceiptLib = await deployLib.send({
            from: accounts[0],
            gas: gasEstimateLib,
            gasPrice: web3.utils.toWei('20', 'gwei')
        });

        libAddress = deployReceiptLib.options.address;

        MyLibContract = new web3.eth.Contract(compiledFundFundRedirectLib.abi, libAddress);
    }
    // DEPLOY FACTORY
    {
        factory = await new web3.eth.Contract(compiledFactory.abi)
            .deploy({
                data: compiledFactory.bytecode,
                arguments: [libAddress],
            })
            .send({ from: accounts[0], gas: '1200000' });
    }
    {
        let create_contract = factory.methods.cloneAndCreateContractPayable(toAccountAddress, "So11111111111111111111111111111111111111112");

        const data = create_contract.encodeABI();

        // Estimate the gas cost of the method call
        create_contract.estimateGas({ from: accounts[0], data: data }, (error, gas) => {
            if (error) {
                console.log(error);
            } else {
                console.log("estimateGas create:", gas);
            }
        });

        await create_contract.send({ from: accounts[0], gas: '2200000' });
    }

    [contractAddress] = await factory.methods.getDeployedContracts().call();
    redirectContract = await new web3.eth.Contract(compiledFundRedirect.abi, contractAddress);
});

describe('Factory Contract', () => {
    it("should do send funds over redirect contract", async () => {
        const password = "testpassword";
        const fromAccountAddress = await web3.eth.personal.newAccount(password);
        await web3.eth.personal.unlockAccount(fromAccountAddress, password, 600);

        await web3.eth.sendTransaction({ from: accounts[0], to: fromAccountAddress, value: web3.utils.toWei('10', 'ether') });

        const fromAccountBalance = await web3.eth.getBalance(fromAccountAddress);
        assert.equal(fromAccountBalance.toString(10), "10000000000000000000");

        // DIRECT TRANSFER
        await web3.eth.sendTransaction({ from: fromAccountAddress, to: toAccountAddress, value: web3.utils.toWei('1', 'ether') });

        const toAccountBalance_afterDirectlySend = await web3.eth.getBalance(toAccountAddress);
        const fromAccountResultBalance_afterDirectlySend = await web3.eth.getBalance(fromAccountAddress);
        assert.equal(toAccountBalance_afterDirectlySend.toString(10), "1000000000000000000");
        assert.equal(fromAccountResultBalance_afterDirectlySend.toString(10), "8999958000000000000");

        // REDIRECT TRANSFER
        await web3.eth.sendTransaction({ from: fromAccountAddress, to: contractAddress, value: web3.utils.toWei('1', 'ether') });

        const toAccountBalance_afterRedirectSend = await web3.eth.getBalance(toAccountAddress);

        const fromAccountResultBalance_afterRedirectSend = await web3.eth.getBalance(fromAccountAddress);

        assert.equal(toAccountBalance_afterRedirectSend.toString(10), "2000000000000000000");

        assert.equal(fromAccountResultBalance_afterRedirectSend.toString(10), "7999891986000000000");

        // ERC 20 TOKENS
        await MyTokenContract.methods.transfer(fromAccountAddress, "10").send({
            value: 0,
            from: accounts[0],
            gasLimit: 2000000
        });

        const fromAccountERC20Balance = await MyTokenContract.methods.balanceOf(fromAccountAddress).call();
        assert.equal(fromAccountERC20Balance.toString(10), "10");

        await MyTokenContract.methods.transfer(contractAddress, 2).send({ from: fromAccountAddress })
            .catch(console.error);


        const fromAccountResultBalance_afterRedirectSendERC20 = await web3.eth.getBalance(fromAccountAddress);
        assert.equal(fromAccountResultBalance_afterRedirectSendERC20.toString(10), "7999788658000000000");

        await redirectContract.methods.withdraw(myTokenAddress).send({ from: fromAccountAddress });

        const fromAccountResultBalance_afterRedirectSendERC20_withdraw = await web3.eth.getBalance(fromAccountAddress);
        assert.equal(fromAccountResultBalance_afterRedirectSendERC20_withdraw.toString(10), "7999690880000000000");


        const fromAccountERC20Balance_erc20Send = await MyTokenContract.methods.balanceOf(fromAccountAddress).call();
        assert.equal(fromAccountERC20Balance_erc20Send.toString(10), "8");

        const toAccountERC20Balance_erc20Send = await MyTokenContract.methods.balanceOf(toAccountAddress).call();
        assert.equal(toAccountERC20Balance_erc20Send.toString(10), "2");


        const contractAddressERC20Balance_erc20Send = await MyTokenContract.methods.balanceOf(contractAddress).call();
        assert.equal(contractAddressERC20Balance_erc20Send.toString(10), "0");
    });
});