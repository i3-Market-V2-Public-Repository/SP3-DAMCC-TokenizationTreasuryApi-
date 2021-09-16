'use strict';

const Web3 = require('web3');
const axios = require('axios')
const fs = require('fs');
const path = require('path');


let instance = null;

class TreasuryContractService {

    static getInstance() {
        if (instance === null) {
            instance = new TreasuryContractService();
        }
        return instance;
    }

    constructor() {
        if (instance) return instance

        this.web3 = null;
        this.contract = null;
        try {
            console.log("connecting to ", process.env.ETH_HOST);
            this.web3 = new Web3(Web3.givenProvider || process.env.ETH_HOST);
            this.web3.eth.net.isListening()
                .then((status) => {
                    console.log("Connection status ", status)

                    this.contract = new this.web3.eth.Contract(
                        JSON.parse(fs.readFileSync(path.join(__dirname, '../../contracts/treasury/I3MarketTreasury.json')).toString()).abi,
                        process.env.CONTRACT_ADDRESS
                    );

                    this.registerHandlerOnTokenTransferred();
                })
                .catch(error => {
                    console.log('Could not connect to the host provided')
                    process.exit()
                })


        } catch (e) {
            console.error("Error while connecting", e);
        }
    }

    addMarketPlace(senderAddress, marketplaceAddress) {
        return this.sendContractMethod(
            'addMarketplace',
            senderAddress,
            marketplaceAddress
        )
    }

    exchangeIn(transferId, senderAddress, userAddress, tokens) {
        return this.sendContractMethod(
            'exchangeIn',
            senderAddress,
            transferId,
            userAddress,
            tokens
            )
    }

    exchangeOut(transferId, senderAddress, marketplaceAddress) {
        return this.sendContractMethod(
            'exchangeOut',
            senderAddress,
            transferId,
            marketplaceAddress,
        )
    }

    payment(transferId, senderAddress, providerAddress, amount) {
        return this.sendContractMethod(
            'payment',
            senderAddress,
            transferId,
            providerAddress,
            amount
        )
    }

    clearing(transferId, senderAddress) {
        return this.sendContractMethod(
            'clearing',
            senderAddress,
            transferId
        )
    }

    getTransactionReceipt(hash) {
        return this.web3.eth.getTransactionReceipt(hash);
    }

    getLatestBlock() {
        return this.web3.eth.getBlock("latest");
    }

    getBalanceForAddress(address) {
        return this.contract.methods.balanceOfAddress(address).call()
    }

    getMarketPlaceIndex(address) {
        return this.contract.methods.getMarketplaceIndex(address).call()
    }

    registerHandlerOnTokenTransferred() {

        try{
            this.contract.events.TokenTransferred({}, (error, event) => {

                if(!event || !event.returnValues) return;

                const payload = {
                    transactionHash: event.transactionHash,
                    blockHash: event.blockHash,
                    type: event.type,
                    operation: event.returnValues.operation,
                    transferId: event.returnValues.transferId,
                    sender: event.returnValues._sender,
                };

                axios.post(process.env.WEBHOOK, {payload})
                    .then(function (response) {
                        console.log('sent webhook successfully')
                    })
                    .catch(function (error) {
                        console.error("Webhook got an error. ", error);
                    });
            })
        }catch (e) {
            console.log('Cannot subscribe to contract TokenTransferred event')
        }
    }

    sendContractMethod(method,senderAddress,...args){
        return new Promise((resolve, reject) => {

            this.contract.methods[method](...args)
                .estimateGas({from: senderAddress})
                .then((gas) => {

                    this.contract.methods[method](...args)
                        .send({
                            from: senderAddress,
                            gas
                        })
                        .on('transactionHash', function (hash) {
                            resolve(hash);
                        })
                        .on('error', function (error) {
                            reject(error)
                        })

                }).catch(error => {
                    reject(error)
                })

        })
    }


}

module.exports = TreasuryContractService;