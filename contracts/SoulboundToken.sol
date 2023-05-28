// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ERC721Custom.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SoulboundToken is ERC721Custom, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    struct Soulbound {
        uint256 tokenId;
        uint256 timestamp;
        string diagnosis;
    }

    struct Entity {
        string entityName;
        uint entityType;
        bool active;
    }
    
    Counters.Counter private _tokenIdCounter;
    mapping(address => Entity) public entities;
    mapping(address => Soulbound[]) private _ownerSbts;
    mapping(address => string) private _patientNames;

    modifier onlyEntity() {
        require(entities[msg.sender].active, "Not an entity!");
        _;
    }

    constructor() ERC721Custom("SoulMed", "SMD", "") {
        _tokenIdCounter.increment();
    }

    function addEntity(address entity, string memory _entityName, uint _type) external onlyOwner {
        require(!entities[entity].active, "Entity already exists!");
        entities[entity] = Entity(_entityName, _type, true);
    }

    function safeMint(address to, string memory diagnosis) external onlyEntity returns(uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _ownerSbts[to].push(Soulbound(tokenId, block.timestamp, diagnosis));
        return tokenId;
    }

    function patientRecords(address patient) external view onlyEntity returns(Soulbound[] memory) {
        return _ownerSbts[patient];
    }

    function ownPatientRecords() external view returns(Soulbound[] memory) {
        return _ownerSbts[msg.sender];
    }

    function totalIssued() external view returns(uint256) {
        return _tokenIdCounter.current() - 1;
    }
}