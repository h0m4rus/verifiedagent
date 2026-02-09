// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title VerifiedAgentRegistry
 * @dev ERC-8004 compatible registry for AI agent identity and reputation
 * @notice Agents register onchain identity, pay subscription, build reputation
 */
contract VerifiedAgentRegistry is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    struct Agent {
        bytes32 agentId;
        address owner;
        string metadataURI;      // IPFS/Arweave hash
        uint256 createdAt;
        uint256 lastVerified;
        uint256 reputationScore; // 0-10000
        Status status;
        uint256 subscriptionExpiresAt;
    }
    
    enum Status {
        Inactive,
        Active,
        Suspended,
        Revoked
    }
    
    // ============ State Variables ============
    
    IERC20 public paymentToken;  // USDC on Base
    
    // Fees in USDC (6 decimals)
    uint256 public basicFee = 5 * 10**6;     // $5/month
    uint256 public proFee = 10 * 10**6;      // $10/month  
    uint256 public teamFee = 20 * 10**6;     // $20/month
    
    // Storage
    mapping(bytes32 => Agent) public agents;
    mapping(address => bytes32[]) public ownerToAgents;
    bytes32[] public allAgentIds;
    
    // Verification
    mapping(bytes32 => Verification[]) public agentVerifications;
    address public chaosClawVerifier;
    
    // Reputation oracles
    mapping(address => bool) public reputationOracles;
    
    // ============ Events ============
    
    event AgentRegistered(
        bytes32 indexed agentId,
        address indexed owner,
        string metadataURI,
        uint256 subscriptionExpiresAt
    );
    
    event AgentVerified(
        bytes32 indexed agentId,
        uint256 score,
        uint256 timestamp
    );
    
    event ReputationUpdated(
        bytes32 indexed agentId,
        uint256 oldScore,
        uint256 newScore,
        int256 delta
    );
    
    event SubscriptionRenewed(
        bytes32 indexed agentId,
        uint256 tier,
        uint256 expiresAt
    );
    
    event AgentSuspended(bytes32 indexed agentId, string reason);
    event AgentRevoked(bytes32 indexed agentId, string reason);
    
    // ============ Structs ============
    
    struct Verification {
        uint256 timestamp;
        uint256 score;      // 0-100
        bool passed;
        string reportURI;   // IPFS hash of full report
    }
    
    // ============ Modifiers ============
    
    modifier onlyChaosClaw() {
        require(msg.sender == chaosClawVerifier, "Only ChaosClaw");
        _;
    }
    
    modifier onlyOracle() {
        require(reputationOracles[msg.sender], "Only oracle");
        _;
    }
    
    modifier onlyAgentOwner(bytes32 agentId) {
        require(agents[agentId].owner == msg.sender, "Not agent owner");
        _;
    }
    
    modifier activeSubscription(bytes32 agentId) {
        require(
            agents[agentId].subscriptionExpiresAt > block.timestamp,
            "Subscription expired"
        );
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _paymentToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        chaosClawVerifier = msg.sender; // Owner is initial verifier
    }
    
    // ============ Registration ============
    
    /**
     * @notice Register a new agent identity
     * @param metadataURI IPFS/Arweave hash containing agent profile
     * @param tier Subscription tier (1=Basic, 2=Pro, 3=Team)
     * @return agentId Unique identifier for the agent
     */
    function registerAgent(
        string calldata metadataURI,
        uint256 tier
    ) external nonReentrant returns (bytes32 agentId) {
        require(tier >= 1 && tier <= 3, "Invalid tier");
        
        uint256 fee = getFee(tier);
        
        // Transfer payment
        require(
            paymentToken.transferFrom(msg.sender, address(this), fee),
            "Payment failed"
        );
        
        // Generate unique agentId
        agentId = keccak256(abi.encodePacked(
            msg.sender,
            metadataURI,
            block.timestamp,
            allAgentIds.length
        ));
        
        require(agents[agentId].createdAt == 0, "Agent exists");
        
        // Create agent
        agents[agentId] = Agent({
            agentId: agentId,
            owner: msg.sender,
            metadataURI: metadataURI,
            createdAt: block.timestamp,
            lastVerified: 0,
            reputationScore: 0,
            status: Status.Active,
            subscriptionExpiresAt: block.timestamp + 30 days
        });
        
        ownerToAgents[msg.sender].push(agentId);
        allAgentIds.push(agentId);
        
        emit AgentRegistered(
            agentId,
            msg.sender,
            metadataURI,
            block.timestamp + 30 days
        );
        
        return agentId;
    }
    
    // ============ Subscription Management ============
    
    /**
     * @notice Renew or upgrade subscription
     * @param agentId Agent to renew
     * @param tier New tier (1-3)
     */
    function renewSubscription(
        bytes32 agentId,
        uint256 tier
    ) external onlyAgentOwner(agentId) nonReentrant {
        require(tier >= 1 && tier <= 3, "Invalid tier");
        require(agents[agentId].status != Status.Revoked, "Agent revoked");
        
        uint256 fee = getFee(tier);
        
        // Transfer payment
        require(
            paymentToken.transferFrom(msg.sender, address(this), fee),
            "Payment failed"
        );
        
        // Calculate new expiration
        uint256 currentExpiry = agents[agentId].subscriptionExpiresAt;
        uint256 newExpiry = currentExpiry > block.timestamp 
            ? currentExpiry + 30 days 
            : block.timestamp + 30 days;
        
        agents[agentId].subscriptionExpiresAt = newExpiry;
        
        // Reactivate if suspended
        if (agents[agentId].status == Status.Suspended) {
            agents[agentId].status = Status.Active;
        }
        
        emit SubscriptionRenewed(agentId, tier, newExpiry);
    }
    
    /**
     * @notice Check if subscription is active
     */
    function isSubscriptionActive(bytes32 agentId) external view returns (bool) {
        return agents[agentId].subscriptionExpiresAt > block.timestamp;
    }
    
    // ============ Verification ============
    
    /**
     * @notice Record a ChaosClaw verification result
     * @dev Only callable by authorized ChaosClaw service
     */
    function verifyAgent(
        bytes32 agentId,
        uint256 score,
        bool passed,
        string calldata reportURI
    ) external onlyChaosClaw {
        require(agents[agentId].createdAt > 0, "Agent not found");
        
        agentVerifications[agentId].push(Verification({
            timestamp: block.timestamp,
            score: score,
            passed: passed,
            reportURI: reportURI
        }));
        
        if (passed) {
            agents[agentId].lastVerified = block.timestamp;
        } else {
            agents[agentId].status = Status.Suspended;
        }
        
        emit AgentVerified(agentId, score, block.timestamp);
    }
    
    /**
     * @notice Check if agent has valid verification
     */
    function isVerified(bytes32 agentId) external view returns (bool) {
        Agent memory agent = agents[agentId];
        if (agent.status != Status.Active) return false;
        
        // Must be verified within last 30 days
        return agent.lastVerified > 0 && 
               agent.lastVerified + 30 days > block.timestamp;
    }
    
    // ============ Reputation Management ============
    
    /**
     * @notice Update agent reputation score
     * @dev Only callable by registered reputation oracles (Reppo, etc.)
     */
    function updateReputation(
        bytes32 agentId,
        int256 delta
    ) external onlyOracle {
        require(agents[agentId].createdAt > 0, "Agent not found");
        
        uint256 oldScore = agents[agentId].reputationScore;
        
        if (delta > 0) {
            agents[agentId].reputationScore = uint256(
                min(int256(oldScore) + delta, 10000)
            );
        } else {
            agents[agentId].reputationScore = uint256(
                max(int256(oldScore) + delta, 0)
            );
        }
        
        emit ReputationUpdated(
            agentId,
            oldScore,
            agents[agentId].reputationScore,
            delta
        );
    }
    
    /**
     * @notice Batch reputation update for multiple agents
     */
    function batchUpdateReputation(
        bytes32[] calldata agentIds,
        int256[] calldata deltas
    ) external onlyOracle {
        require(agentIds.length == deltas.length, "Length mismatch");
        
        for (uint256 i = 0; i < agentIds.length; i++) {
            this.updateReputation(agentIds[i], deltas[i]);
        }
    }
    
    // ============ Admin Functions ============
    
    function suspendAgent(
        bytes32 agentId,
        string calldata reason
    ) external onlyOwner {
        agents[agentId].status = Status.Suspended;
        emit AgentSuspended(agentId, reason);
    }
    
    function revokeAgent(
        bytes32 agentId,
        string calldata reason
    ) external onlyOwner {
        agents[agentId].status = Status.Revoked;
        emit AgentRevoked(agentId, reason);
    }
    
    function setChaosClawVerifier(address _verifier) external onlyOwner {
        chaosClawVerifier = _verifier;
    }
    
    function setReputationOracle(address oracle, bool status) external onlyOwner {
        reputationOracles[oracle] = status;
    }
    
    function setFees(uint256 basic, uint256 pro, uint256 team) external onlyOwner {
        basicFee = basic;
        proFee = pro;
        teamFee = team;
    }
    
    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
    
    // ============ View Functions ============
    
    function getAgent(bytes32 agentId) external view returns (Agent memory) {
        return agents[agentId];
    }
    
    function getOwnerAgents(address owner) external view returns (bytes32[] memory) {
        return ownerToAgents[owner];
    }
    
    function getAgentVerifications(bytes32 agentId) 
        external 
        view 
        returns (Verification[] memory) 
    {
        return agentVerifications[agentId];
    }
    
    function getFee(uint256 tier) public view returns (uint256) {
        if (tier == 1) return basicFee;
        if (tier == 2) return proFee;
        if (tier == 3) return teamFee;
        revert("Invalid tier");
    }
    
    function getAllAgentIds() external view returns (bytes32[] memory) {
        return allAgentIds;
    }
    
    function getAgentCount() external view returns (uint256) {
        return allAgentIds.length;
    }
    
    // ============ Internal Helpers ============
    
    function min(int256 a, int256 b) internal pure returns (int256) {
        return a < b ? a : b;
    }
    
    function max(int256 a, int256 b) internal pure returns (int256) {
        return a > b ? a : b;
    }
}
