// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Voting {

    struct Voter {
        uint nationalId;
        uint phoneNumber;
        bool hasVoted;
    }

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Voter) public voters;
    mapping(uint => Candidate) public candidates;

    uint public candidateCount;
    uint public voterCount;

    event votedEvent(uint indexed candidateId);

    constructor() {
        addCandidate("ali");
        addCandidate("amir");
        addCandidate("mohanna");
        addCandidate("majid");
    }

    function addCandidate(string memory _name) private {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
    }

    function authenticateVoter(uint _nationalId, uint _phoneNumber) public {
        voterCount++;
        voters[voterCount] = Voter(_nationalId, _phoneNumber, false);
    }

    function vote(uint _candidateId, uint _voterId) public {
        require(!voters[_voterId].hasVoted, "you cant vote becuase you voted");
        require(_candidateId > 0 && _candidateId <= candidateCount, "invalid candidate");

        voters[_voterId].hasVoted = true;
        candidates[_candidateId].voteCount++;

        emit votedEvent(_candidateId);
    }

    function getCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory _candidates = new Candidate[](candidateCount);
        for (uint i = 1; i <= candidateCount; i++) {
            _candidates[i - 1] = candidates[i];
        }
        return _candidates;
    }

    function getWinner() public view returns (string memory) {
        uint maxVotes = 0;
        uint winnerId;

        for (uint i = 1; i <= candidateCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
            }
        }

        return candidates[winnerId].name;
    }
}