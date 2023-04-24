// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract Bank {
    address public immutable owner;
    bytes32[] public whiteListedSymbols;
    mapping(bytes32 => address) whiteListedTokens;
    mapping(address => mapping(bytes32 => uint256)) whiteListedTokenBalances;

    constructor() {
        owner = msg.sender;
    }

    function whiteListTokens(bytes32 _symbol, address tokenAddress) public {
        require(msg.sender == owner, "only owner can whitelist the tokens");

        whiteListedTokens[_symbol] = tokenAddress;
        whiteListedSymbols.push(_symbol);
    }

    function getWhiteListedTokenSymbols()
        external
        view
        returns (bytes32[] memory)
    {
        return whiteListedSymbols;
    }

    function getWhiteListedTokenAddress(
        bytes32 symbol
    ) internal view returns (address) {
        return whiteListedTokens[symbol];
    }

    function getWhiteListedTokenBalances(
        bytes32 symbol
    ) external view returns (uint256) {
        return whiteListedTokenBalances[msg.sender][symbol];
    }

    receive() external payable {
        whiteListedSymbols.push("ETH");
        whiteListedTokenBalances[msg.sender]["ETH"] += msg.value;
    }

    function withdrawETH(uint256 amount) external payable {
        require(
            whiteListedTokenBalances[msg.sender]["ETH"] >= amount,
            " insufficient balance"
        );

        payable(msg.sender).transfer(amount);
        whiteListedTokenBalances[msg.sender]["ETH"] -= amount;
    }

    function depositTokens(bytes32 symbol, uint256 amount) external {
        whiteListedTokenBalances[msg.sender][symbol] += amount;
        IERC20(whiteListedTokens[symbol]).transferFrom(
            msg.sender,
            address(this),
            amount
        );
    }

    function withdrawTokens(bytes32 symbol, uint256 amount) external {
        require(
            whiteListedTokenBalances[msg.sender][symbol] >= amount,
            "insufficent balance"
        );

        IERC20(whiteListedTokens[symbol]).transfer(msg.sender, amount);
        whiteListedTokenBalances[msg.sender][symbol] -= amount;
    }

    function getTokenBalance(bytes32 symbol) external view returns (uint256) {
        return whiteListedTokenBalances[msg.sender][symbol];
    }
}
