//SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

contract FundRedirect {
    address payable public redirectAddress;

    constructor(address payable _redirectAddress) {
        redirectAddress = _redirectAddress;
    }

    function setRedirectAddress(address payable _address) public {
        require(
            msg.sender == redirectAddress,
            "Only owner can set redirect address."
        );
        redirectAddress = _address;
    }

    fallback() external payable {
        require(redirectAddress != address(0), "Redirect address not set.");
        redirectAddress.transfer(msg.value);
    }

    receive() external payable {
        // This function can be called by anyone to send ether to the contract
        // and it will be stored in the contract's balance
    }
}
