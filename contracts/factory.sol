//SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "./FundRedirectLib.sol";
import "./FundRedirect.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

contract Factory is Ownable {
    address public libraryAddress;

    address[] public deployedContracts;

    constructor(address _libraryAddress) {
        libraryAddress = _libraryAddress;
    }

    function cloneContract(
        address payable redirectAddress,
        string memory solAddress
    ) public returns (address) {
        address clone = Clones.clone(libraryAddress);
        FundRedirectLib(clone).initialize(redirectAddress, solAddress);

        deployedContracts.push(clone);

        return clone;
    }

    function cloneAndCreateContractPayable(
        address payable redirectAddress,
        string memory solAddress
    ) public returns (address) {
        address clone = Clones.clone(libraryAddress);
        FundRedirectLib f = FundRedirectLib(clone);
        f.initialize(redirectAddress, solAddress);

        FundRedirect newContract = new FundRedirect(f);
        address newContractAddress = address(newContract);

        deployedContracts.push(newContractAddress);

        return newContractAddress;
    }

    function getDeployedContracts() public view returns (address[] memory) {
        return deployedContracts;
    }
}
