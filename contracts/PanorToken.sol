// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PanorToken is ERC20, Ownable {
    constructor() ERC20("Panor Token", "PANOR") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**18); // 1M PANOR iniciales
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}