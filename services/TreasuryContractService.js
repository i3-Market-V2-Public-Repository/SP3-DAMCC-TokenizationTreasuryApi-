'use strict';

const Web3 = require('web3');
const axios = require('axios')
const fs = require('fs');
const path = require('path')

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
        this.contractOptions = null;
        this.contract = null;
        try {
            console.log("connecting to ", process.env.ETH_HOST);
            this.web3 = new Web3(Web3.givenProvider || process.env.ETH_HOST);
            this.web3.eth.net.isListening()
                .then((status) => console.log("Connection status ", status));
            this.contractOptions = {gasPrice: 0, gas: 6721975};
            this.contract = new this.web3.eth.Contract(
                JSON.parse(fs.readFileSync(path.join(__dirname, '../contracts/treasury/I3MarketTreasury.json')).toString()).abi,
                process.env.CONTRACT_ADDRESS,
                this.contractOptions
            );

            this.registerHandlerOnTokenTransferred();

        } catch (e) {
            console.error("Error while connecting", e);
        }
    }

    addMarketPlace(fromAddress, marketplaceAddress) {
        return new Promise((resolve, reject) => {
            this.contract.methods.addMarketplace(marketplaceAddress)
                .send({from: fromAddress})
                .on('transactionHash', function (hash) {
                    resolve(hash)
                })
                .on('error', function (error) {
                    reject(error)
                })
        })
    }

    exchangeIn(fromAddress, toAddress, tokens) {
        return new Promise((resolve, reject) => {

            this.contract.methods.exchangeIn(toAddress, tokens)
                .send({from: fromAddress})
                .on('transactionHash', function (hash) {
                    resolve(hash);
                })
                .on('error', function (error) {
                    reject(error)
                })
        })
    }

    exchangeOut(providerAddress, marketplaceAddress) {
        return new Promise((resolve, reject) => {

            this.contract.methods.exchangeOut(marketplaceAddress)
                .send({from: providerAddress})
                .on('transactionHash', function (hash) {
                    resolve(hash);
                })
                .on('error', function (error) {
                    reject(error)
                })
        })
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

        this.contract.events.TokenTransferred({}, (error, event) => {

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
    }

}

module.exports = TreasuryContractService;