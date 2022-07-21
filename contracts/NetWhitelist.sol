// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract NetWhitelist {

  bytes32 public merkleRoot;

  mapping (address => bool) public whitelisted;

  constructor(bytes32 _merkleRoot) {
    merkleRoot = _merkleRoot;
  }

  function verified(bytes32[] calldata proof) public view returns(bool) {

    bytes32 leaf = keccak256(abi.encode(msg.sender));
    bool verify = MerkleProof.verify(proof, merkleRoot, leaf);
    return verify;
  }

  function mintPresale(bytes32[] calldata proof) external payable {
    require(!whitelisted[msg.sender], "Whitelist Claimed for this address already!");
    
    bytes32 leaf = keccak256(abi.encode(msg.sender));

    require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid Proof");

    whitelisted[msg.sender] = true;
  }
}