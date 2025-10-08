// contracts/TestUSDC.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestUSDC is ERC20 {
    constructor() ERC20("USDC Test", "USDC") {
        _mint(msg.sender, 1000000 * 10 ** 6); // 1M tokens avec 6 décimales
    }
}
