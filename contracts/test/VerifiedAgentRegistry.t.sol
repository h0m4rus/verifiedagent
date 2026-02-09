// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/VerifiedAgentRegistry.sol";

contract VerifiedAgentRegistryTest is Test {
    VerifiedAgentRegistry public registry;
    
    address public owner = address(1);
    address public user = address(2);
    address public chaosClaw = address(3);
    address public oracle = address(4);
    
    // Mock USDC
    address public usdc = address(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913);
    
    function setUp() public {
        vm.startPrank(owner);
        registry = new VerifiedAgentRegistry(usdc);
        vm.stopPrank();
    }
    
    function test_RegisterAgent() public {
        // Mock USDC approval and transfer
        vm.mockCall(
            usdc,
            abi.encodeWithSelector(IERC20.transferFrom.selector, user, address(registry), 5 * 10**6),
            abi.encode(true)
        );
        
        vm.startPrank(user);
        
        bytes32 agentId = registry.registerAgent(
            "ipfs://QmTest",
            1 // Basic tier
        );
        
        assertTrue(agentId != bytes32(0));
        
        VerifiedAgentRegistry.Agent memory agent = registry.getAgent(agentId);
        assertEq(agent.owner, user);
        assertEq(agent.metadataURI, "ipfs://QmTest");
        assertEq(uint256(agent.status), uint256(VerifiedAgentRegistry.Status.Active));
        
        vm.stopPrank();
    }
    
    function test_Revert_InvalidTier() public {
        vm.startPrank(user);
        
        vm.expectRevert("Invalid tier");
        registry.registerAgent("ipfs://QmTest", 0);
        
        vm.expectRevert("Invalid tier");
        registry.registerAgent("ipfs://QmTest", 4);
        
        vm.stopPrank();
    }
    
    function test_RenewSubscription() public {
        // First register
        vm.mockCall(
            usdc,
            abi.encodeWithSelector(IERC20.transferFrom.selector, user, address(registry), 5 * 10**6),
            abi.encode(true)
        );
        
        vm.startPrank(user);
        bytes32 agentId = registry.registerAgent("ipfs://QmTest", 1);
        
        // Fast forward past expiration
        vm.warp(block.timestamp + 31 days);
        
        // Renew
        vm.mockCall(
            usdc,
            abi.encodeWithSelector(IERC20.transferFrom.selector, user, address(registry), 5 * 10**6),
            abi.encode(true)
        );
        
        registry.renewSubscription(agentId, 1);
        
        assertTrue(registry.isSubscriptionActive(agentId));
        
        vm.stopPrank();
    }
    
    function test_VerifyAgent() public {
        // Setup
        vm.mockCall(
            usdc,
            abi.encodeWithSelector(IERC20.transferFrom.selector, user, address(registry), 5 * 10**6),
            abi.encode(true)
        );
        
        vm.startPrank(user);
        bytes32 agentId = registry.registerAgent("ipfs://QmTest", 1);
        vm.stopPrank();
        
        // Verify as ChaosClaw
        vm.startPrank(owner);
        registry.setChaosClawVerifier(chaosClaw);
        vm.stopPrank();
        
        vm.startPrank(chaosClaw);
        registry.verifyAgent(agentId, 85, true, "ipfs://QmReport");
        vm.stopPrank();
        
        // Check verification
        assertTrue(registry.isVerified(agentId));
        
        VerifiedAgentRegistry.Agent memory agent = registry.getAgent(agentId);
        assertTrue(agent.lastVerified > 0);
    }
    
    function test_UpdateReputation() public {
        // Setup
        vm.mockCall(
            usdc,
            abi.encodeWithSelector(IERC20.transferFrom.selector, user, address(registry), 5 * 10**6),
            abi.encode(true)
        );
        
        vm.startPrank(user);
        bytes32 agentId = registry.registerAgent("ipfs://QmTest", 1);
        vm.stopPrank();
        
        // Add oracle
        vm.startPrank(owner);
        registry.setReputationOracle(oracle, true);
        vm.stopPrank();
        
        // Update reputation
        vm.startPrank(oracle);
        registry.updateReputation(agentId, 500);
        vm.stopPrank();
        
        VerifiedAgentRegistry.Agent memory agent = registry.getAgent(agentId);
        assertEq(agent.reputationScore, 500);
    }
    
    function test_SuspendAgent() public {
        // Setup
        vm.mockCall(
            usdc,
            abi.encodeWithSelector(IERC20.transferFrom.selector, user, address(registry), 5 * 10**6),
            abi.encode(true)
        );
        
        vm.startPrank(user);
        bytes32 agentId = registry.registerAgent("ipfs://QmTest", 1);
        vm.stopPrank();
        
        // Suspend
        vm.startPrank(owner);
        registry.suspendAgent(agentId, "Terms of service violation");
        vm.stopPrank();
        
        VerifiedAgentRegistry.Agent memory agent = registry.getAgent(agentId);
        assertEq(uint256(agent.status), uint256(VerifiedAgentRegistry.Status.Suspended));
    }
    
    function test_GetFee() public {
        assertEq(registry.getFee(1), 5 * 10**6);  // $5
        assertEq(registry.getFee(2), 10 * 10**6); // $10
        assertEq(registry.getFee(3), 20 * 10**6); // $20
    }
    
    function test_SetFees() public {
        vm.startPrank(owner);
        registry.setFees(6 * 10**6, 12 * 10**6, 25 * 10**6);
        vm.stopPrank();
        
        assertEq(registry.getFee(1), 6 * 10**6);
        assertEq(registry.getFee(2), 12 * 10**6);
        assertEq(registry.getFee(3), 25 * 10**6);
    }
    
    function test_Revert_NonOwnerSetFees() public {
        vm.startPrank(user);
        vm.expectRevert();
        registry.setFees(6 * 10**6, 12 * 10**6, 25 * 10**6);
        vm.stopPrank();
    }
}
