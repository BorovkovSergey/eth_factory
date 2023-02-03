//SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "./FundRedirectLib.sol";

contract FundRedirect {
    FundRedirectLib public lib;

    constructor(FundRedirectLib _lib) {
        lib = _lib;
    }

    receive() external payable {
        lib.getRedirectAddress().transfer(msg.value);
    }

    function withdraw(MyToken token) public {
        lib.withdraw(token, address(this));
    }
}
