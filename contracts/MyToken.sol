//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract MyToken {
    // The address of the contract owner
    address owner;

    // The total supply of tokens
    uint256 totalSupply;

    // Mapping from addresses to their token balance
    mapping(address => uint256) public balanceOfMap;

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    // Event that is emitted when tokens are transferred
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Initializes the contract and sets the total supply and the owner
    constructor() {
        owner = msg.sender;
        totalSupply = 20000;
        balanceOfMap[owner] = totalSupply;
    }

    // Transfers the specified amount of tokens from the msg.sender to the specified address
    function transfer(address to, uint256 value) public {
        require(balanceOfMap[msg.sender] >= value && value > 0);
        balanceOfMap[msg.sender] -= value;
        balanceOfMap[to] += value;
        emit Transfer(msg.sender, to, value);
    }

    // Approves the specified address to transfer the specified amount of tokens on behalf of msg.sender
    function approve(address spender, uint256 value) public {
        require(spender != address(0));
        require(balanceOfMap[msg.sender] >= value && value > 0);
        emit Approval(msg.sender, spender, value);
    }

    // Transfers the specified amount of tokens from the approved address to the specified address
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public {
        require(balanceOfMap[from] >= value && value > 0);
        balanceOfMap[from] -= value;
        balanceOfMap[to] += value;
        emit Transfer(from, to, value);
    }

    // Returns the token balance of the specified address
    function balanceOf(address account) public view returns (uint256) {
        return balanceOfMap[account];
    }
}
