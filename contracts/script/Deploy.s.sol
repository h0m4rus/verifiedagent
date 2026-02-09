// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {VerifiedAgentRegistry} from "../src/VerifiedAgentRegistry.sol";

contract DeployVerifiedAgentRegistry is Script {
    // Base Sepolia USDC address
    address constant USDC_SEPOLIA = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the registry contract
        VerifiedAgentRegistry registry = new VerifiedAgentRegistry(USDC_SEPOLIA);
        
        vm.stopBroadcast();
        
        // Log deployment
        console.log("VerifiedAgentRegistry deployed to:", address(registry));
        console.log("Network: Base Sepolia");
        console.log("USDC Token:", USDC_SEPOLIA);
        console.log("Owner:", msg.sender);
    }
}
