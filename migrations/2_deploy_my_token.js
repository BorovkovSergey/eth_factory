var Migrations = artifacts.require("MyToken.sol");

module.exports = function (deployer) {
    // Deploy the Migrations contract as our only task
    deployer.deploy(Migrations);
};