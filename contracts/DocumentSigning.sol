// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocumentSigning {
    uint256 public docCounter;

    struct Document {
        string hash;
        address creator;
        uint256 requiredSignatures;
        uint256 signedCount;
        bool exists;
    }

    mapping(uint256 => Document) public documents;
    mapping(uint256 => mapping(address => bool)) public allowed;
    mapping(uint256 => mapping(address => bool)) public signed;

    event DocumentCreated(uint256 id, string hash);
    event Signed(uint256 id, address signer);

    function createDocument(
        string memory _hash,
        address[] memory _signers
    ) public {
        require(_signers.length > 0, "No signers");

        docCounter++;

        documents[docCounter] = Document({
            hash: _hash,
            creator: msg.sender,
            requiredSignatures: _signers.length,
            signedCount: 0,
            exists: true
        });

        for (uint i = 0; i < _signers.length; i++) {
            allowed[docCounter][_signers[i]] = true;
        }

        emit DocumentCreated(docCounter, _hash);
    }

    function signDocument(uint256 id) public {
        require(documents[id].exists, "No doc");
        require(allowed[id][msg.sender], "Not allowed");
        require(!signed[id][msg.sender], "Already signed");

        signed[id][msg.sender] = true;
        documents[id].signedCount++;

        emit Signed(id, msg.sender);
    }

    function isSigned(uint256 id, address user) public view returns (bool) {
        return signed[id][user];
    }

    function isAllowed(uint256 id, address user) public view returns (bool) {
        return allowed[id][user];
    }

    function isCompleted(uint256 id) public view returns (bool) {
        return documents[id].signedCount == documents[id].requiredSignatures;
    }
}
