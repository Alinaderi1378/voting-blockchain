const votermodel = require("../../models/users");
const candidatesmodel = require("../../models/candidates");
const votemodel = require("../../models/vote");
const _ = require('lodash');
const {rest} = require('lodash');
const {
    validatevoter, validatecandidate, validateUpdateVoter
} = require("../validator/UserValidator");
const bcrypt = require("bcrypt");
const {Web3} = require("web3");
const {hexToAscii} = require("truffle/build/3618.bundled");
let web3 = new Web3(Web3.givenProvider || "ws://127.0.0.1:8545");
const contractAddress = '0x1A2BD107BD2CD07F55C692ea66fe9df79063741a'; // Replace with the actual contract address
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "candidateId",
                "type": "uint256"
            }
        ],
        "name": "votedEvent",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_nationalId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_phoneNumber",
                "type": "uint256"
            }
        ],
        "name": "authenticateVoter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "candidateCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "candidates",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "voteCount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCandidates",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "voteCount",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct Voting.Candidate[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getWinner",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_candidateId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_voterId",
                "type": "uint256"
            }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "voterCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "voters",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "nationalId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "phoneNumber",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "hasVoted",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
const contract = new web3.eth.Contract(contractABI, contractAddress);
let abiDecoder = require('abi-decoder');

// const EthereumTx= require("ethereumjs-tx").Transaction;

class HotelController {

// start candidate controllers
    async getcondidates(req, res) {
        const list = await candidatesmodel.find({});
        let arr = []
        let count = 1;
        const candidates = await contract.methods.getCandidates().call();
        res.json(candidates + "");
        console.log(candidates[0].name)
    }

    async getcondidate(req, res) {
        const id_ = req.body.id_;
        let arr = [];
        const list = await candidatesmodel.find({}).select("pic name votecount").where({id_: id_});
        const condidate = await contract.methods.candidates(id_).call();
        let id = condidate.id;
        let name = condidate.name;
        let voteCount = condidate.voteCount;
        arr.push(id, name, voteCount);
        console.log(condidate);
        res.json(arr + "");
    }

    async getWinner(req, res) {
        const list = await candidatesmodel.find({}).sort({'votecount': -1}).limit(1);
        const winner = await contract.methods.getWinner().call();
        res.send(winner);
        console.log(winner)
    }

    async getcandidateCount(req, res) {
        const winner = await contract.methods.candidateCount().call();
        res.send(winner);
        console.log(winner)
    }

    async addcondidates(req, res) {
        const name = req.body.name;
        const {error} = validatecandidate(req.body);
        if (error) return res.status(400).send(error.message);
        let length = await candidatesmodel.find({}).count() + 1;
        let candidate = new candidatesmodel(
            _.pick(req.body, [
                'pic',
                'votecount',
                'name'
            ])
        );

        candidate = new candidatesmodel(
            _.merge(candidate, {id_: length})
        );

        candidate = await candidate.save();

        res.send(candidate)
    }

// end candidate controllers
// start voter controllers
    async signup(req, res) {
        const account = await web3.eth.getAccounts();
        const phone = req.body.phone;
        const natinalId = req.body.natinalId;
        const signed = await votermodel.exists({natinalId: req.body.natinalId});
        let length = await votermodel.find({}).count() + 1;
        if (signed) {
            res.send({message: "User already exists"}).status(204);
        } else {
            let voter = new votermodel(
                _.pick(req.body, [
                    'phone',
                    'natinalId'
                ])
            );
            voter = new votermodel(
                _.merge(voter, {id_: length, isvote: false})
            );

            voter = await voter.save();
            let params_value = [];
            const voter2 = await contract.methods.authenticateVoter(natinalId, phone).send({
                from: account[0],
                gas: 1000000
            }).on("sent", (event) => {
                // console.log(event);
                abiDecoder.addABI(contractABI);
                let tx_data = event.input;

                let decoded_data = abiDecoder.decodeMethod(tx_data);
                let params = decoded_data.params;
                let param_values = [];
                let i;
                for (i in params) {  // loop to print parameters without unnecessary info
                    params_value.push(params[i].name + " : " + params[i].value);
                }
                // console.log(param_values);
            });
            res.send(params_value).status(200);
        }

    }

    async votesign(req, res) {
        const account = await web3.eth.getAccounts();
        const natinalId = req.body.natinalId;
        // const id_ = req.body.id_;
        const candidateId = req.body.candidateId;
        let params_value = [];
        const voter = await votermodel.find({}).select("id_ isvote candidateId").where({natinalId: natinalId});
        // console.log(voter);
        const candidate = await candidatesmodel.find({}).select("votecount id_").where({id_: candidateId});
        if (!voter[0].isvote) {

            let id_voter = voter[0].id_;
            let vote = new votemodel(
                _.pick(req.body, [
                    'candidateId'
                ])
            );
            vote = new votemodel(
                _.merge(vote, {voterId: voter[0].id_})
            );

            vote = await vote.save();
            const result_candidate = await candidatesmodel.updateOne({id_: candidateId}, {votecount: candidate[0].votecount + 1}
                , {new: true});
            const result_voter = await votermodel.updateOne({natinalId: natinalId}, {
                    isvote: true,
                    candidateId: candidateId
                }
                , {new: true});
            const result_contract = await contract.methods.vote(candidateId, id_voter).send({
                from: account[0],
                gas: 1000000
            }).on("sent", (ress) => {
                abiDecoder.addABI(contractABI);
                let tx_data = ress.input;
                let decoded_data = abiDecoder.decodeMethod(tx_data);
                let params = decoded_data.params;
                let param_values = [];
                let i;
                for (i in params) {  // loop to print parameters without unnecessary info
                    params_value.push(params[i].name + " : " + params[i].value);
                }
            })
            res.send(params_value).status(200);

        } else {
            res.send(-1 + "").status(206);
        }
    }

    async updatevoter(req, res) {
        const id = req.params.natinalId;
        const {error} = validateUpdateVoter(req.body);
        if (error) return res.status(400).send(error.message);
        const result = await votermodel.findByIdAndUpdate(id, {
            $set: _.pick(req.body, [
                'phone',
                'isvote',
            ]),
        }, {new: true});
        if (!result) return res.status(404).send('not found');
        res.send(
            _.pick(result, [
                'phone',
                'isvote'
            ]),
        );
    }

    async getvoterCount(req, res) {
        const voterCount = await contract.methods.voterCount().call();
        res.send(voterCount);
    }

    async getvotervote(req, res) {
        const natinalId = req.body.natinalId;
        res.setHeader('Content-Type', 'application/json');
        const id = await votermodel.find({}).select("id_").where({natinalId: natinalId});
        console.log(id)
        const list = await contract.methods.voters(id[0].id_).call();
        let arr = [];
        console.log(list)
        let hasVoted = list.hasVoted + "";
        let nationalId = list.nationalId;
        let phoneNumber = list.phoneNumber;
        arr.push(hasVoted, nationalId, phoneNumber);
        res.send(arr + "");
    }

// end voter controllers
}

module.exports = new HotelController();