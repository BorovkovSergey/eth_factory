//SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "./MyToken.sol";

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

    function withdraw(MyToken token) public {
        uint256 amount = token.balanceOf(address(this));
        token.transfer(redirectAddress, amount);
        require(token.balanceOf(address(this)) == 0, "not 0");
    }

    function destroy() public {
        selfdestruct(payable(msg.sender));
    }

    function getSolAddress() public view returns (string memory) {
        return solAddress;
    }
}
