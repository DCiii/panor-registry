// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ChainlinkMock {
    mapping(bytes32 => bool) public verificaciones;
    mapping(bytes32 => bytes32) public requestIds;
    uint256 public requestCounter;

    event VerificationRequested(bytes32 indexed requestId, bytes32 indexed hash);
    event VerificationCompleted(bytes32 indexed requestId, bool result);

    function requestVerification(bytes32 _hash) external returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(_hash, block.timestamp, requestCounter));
        requestCounter++;
        requestIds[requestId] = _hash;
        verificaciones[requestId] = true;
        
        emit VerificationRequested(requestId, _hash);
        emit VerificationCompleted(requestId, true);
        
        return requestId;
    }

    function getVerificationResult(bytes32 _requestId) external view returns (bool) {
        return verificaciones[_requestId];
    }
}