//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./FundRedirect.sol";

contract Factory {
    address[] public deployedContracts;

    function createContract(
        address payable redirectAddress,
        string memory solAddress
    ) public returns (address) {
        address newContract = address(
            new FundRedirect(redirectAddress, solAddress)
        );
        deployedContracts.push(newContract);
        return newContract;
    }

    function getDeployedContracts() public view returns (address[] memory) {
        return deployedContracts;
    }
}
