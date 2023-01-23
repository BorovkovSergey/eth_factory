//SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

contract FundRedirect {
    address payable public redirectAddress;
    string public solAddress;

    constructor(address payable _redirectAddress, string memory _solAddress) {
        redirectAddress = _redirectAddress;
        solAddress = _solAddress;
    }

    receive() external payable {
        redirectAddress.transfer(msg.value);
    }

    function getSolAddress() public view returns (string memory) {
        return solAddress;
    }
}
