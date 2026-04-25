// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/TokenAgua.sol";
import "../src/TokenAguaDAO.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Deploy token — el deployer es el owner inicial
        TokenAgua token = new TokenAgua(msg.sender);
        console.log("TokenAgua deployed at:", address(token));

        // 2. Deploy DAO apuntando al token
        TokenAguaDAO dao = new TokenAguaDAO(address(token));
        console.log("TokenAguaDAO deployed at:", address(dao));

        // 3. Autorizar al DAO como validador de reportes
        token.setValidador(address(dao), true);
        console.log("DAO autorizado como validador");

        vm.stopBroadcast();
    }
}
