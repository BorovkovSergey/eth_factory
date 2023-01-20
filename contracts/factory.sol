//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./relayer.sol";

contract Factory {
    address[] public deployedContracts;

    function createContract(string memory _contractCode)
        public
        returns (address)
    {
        bytes memory byteCode = abi.encode(_contractCode);
        address newContract = address(new FundRedirect(byteCode));
        deployedContracts.push(newContract);
        return newContract;
    }
}
