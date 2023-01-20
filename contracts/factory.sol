//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./relayer.sol";

contract Factory {
    address[] public deployedContracts;

    function createContract(address payable _redirectAddress)
        public
        returns (address)
    {
        address newContract = address(new FundRedirect(_redirectAddress));
        deployedContracts.push(newContract);
        return newContract;
    }
}
