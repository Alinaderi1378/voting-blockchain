const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');
const ErrorMiddleware = require('./http/middleware/Error');
const api = require('./routes/api');
const app = express();
const { Web3 } = require('web3');

class Application {

    constructor() {
        this.setupExpressServer();
        this.setupMongoose();
        this.setupRoutesAndMiddlewares();
        this.setupConfigs();
        this.setupblockchain();

    }

    setupRoutesAndMiddlewares() {
        // built-in middleware

        app.use(express.json());
        app.use(express.urlencoded({extended: true}));
        app.use(express.static('uploads'));

        if (app.get('env') === 'production') app.use(morgan('tiny'));

        // third-party middleware
        app.use(cors());

        //routes
        app.use('/api', api);

        app.use(ErrorMiddleware);
    }

    setupConfigs() {
        winston.add(new winston.transports.File({filename: 'error-log.log'}));
        winston.add(
            new winston.transports.MongoDB({
                db: 'mongodb://0.0.0.0:27017/voting',
                level: 'error',
            }),
        );

        process.on('uncaughtException', (err) => {
            console.log(err);
            winston.error(err.message);
        });
        process.on('unhandledRejection', (err) => {
            console.log(err);
            winston.error(err.message);
        });
        app.set('view engine', 'pug');
        app.set('views', '../views'); // default
    }
    setupMongoose() {
        mongoose
            .connect('mongodb://0.0.0.0:27017/voting', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            .then(() => {
                console.log('db connected');
                winston.info('db connected');
            })
            .catch((err) => {
                console.error('db not connected', err);
            });
    }


    setupExpressServer() {
        const port = process.env.myPort || 3000;
        app.listen(port, (err) => {
            if (err) console.log(err);
            else console.log(`app listen to port ${port}`);
        });
    }
    setupblockchain(){
        let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const contractAddress = '0x8AE6BB102FEAa8D657efaB46Ef97461466eac789'; // Replace with the actual contract address
        const contractABI = [
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
                "stateMutability": "nonpayable",
                "type": "constructor"
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
        console.log(contract.methods);

    }
}

module.exports=Application;


