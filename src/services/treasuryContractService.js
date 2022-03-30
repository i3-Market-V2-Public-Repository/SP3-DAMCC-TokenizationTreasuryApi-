/*
 * Copyright (c) 2020-2022 in alphabetical order:
 * GFT, HOPU, Telesto Technologies
 *
 * This program and the accompanying materials are made
 * available under the terms of the EUROPEAN UNION PUBLIC LICENCE v. 1.2
 * which is available at https://gitlab.com/i3-market/code/wp3/t3.3/nodejs-tokenization-treasury-api/-/blob/master/LICENCE.md
 *
 *  License-Identifier: EUPL-1.2
 *
 *  Contributors:
 *    Vangelis Giannakosian (Telesto Technologies)
 *    Dimitris Kokolakis (Telesto Technologies)
 *    George Benos (Telesto Technologies)
 *    Germán Molina (HOPU)
 *
 */

'use strict';

const Web3 = require('web3');
const axios = require('axios')
const fs = require('fs');
const path = require('path');
const AppError = require('../utils/AppError');
const TreasuryContract = require('./treasuryContract')

let instance = null;

class TreasuryContractService extends TreasuryContract {

    static getInstance() {
        if (instance === null) {
            instance = new TreasuryContractService();
        }
        return instance;
    }

    constructor() {
        super();
        if (instance) return instance
        this.web3 = null;
        this.contract = null;
    }

    connect() {
        return new Promise((resolve) => {
            try {
                console.log("connecting to ", process.env.ETH_HOST);
                this.web3 = new Web3(Web3.givenProvider || process.env.ETH_HOST);
                this.web3.eth.net.isListening().then((status) => {
                        console.log("Connection status ", status)
                        this.initSmartContract();
                        resolve(true);
                    }
                ).catch(error => {
                    console.log('Could not connect to the Blockchain host provided')
                    process.exit()
                });
            } catch (e) {
                console.error("Error while connecting", e);
                process.exit()
            }
        });
    }

    initSmartContract() {
        this.contract = new this.web3.eth.Contract(
            JSON.parse(fs.readFileSync(path.join(__dirname, '../../contracts/treasury/I3MarketTreasury.json')).toString()).abi,
            process.env.CONTRACT_ADDRESS
        );
        this.registerHandlerOnTokenTransferred();
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

    clearing(tokenTransfers, senderAddress) {
        return this.sendContractMethod(
            'clearing',
            senderAddress,
            transferId
        )
    }

    async _getMarketplaceAddressByIndex(index) {
        try {
            return await this.contract.methods.marketplaces(index).call();
        } catch (e) {
            console.log("Error: Marketplace does NOT exist or wrong index.");
            return '0x0'
        }
    }

    setPaid(transferId, senderAddress, transferCode) {
        return this.sendContractMethod(
            'setPaid',
            senderAddress,
            transferId,
            transferCode
        )
    }

    deploySignedTransaction(serializedTx) {
        return this.web3.eth.sendSignedTransaction(serializedTx.toString(), (err, ret) => {
            if (err) {
                console.log("An error occurred", err)
                return
            }
        })
    }

    getTransactionReceipt(hash) {
        return this.web3.eth.getTransactionReceipt(hash);
    }

    getTransactionByTransferId(transferId) {
        return this.contract.methods.transactions(transferId).call();
    }

    async gasLimit() {
        const block = await this.getLatestBlock()
        return block.gasLimit || process.env.GAS_LIMIT
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

    registerHandlerOnFiatMoneyPayment() {
        try {
            this.contract.events.FiatMoneyPayment({}, (error, event) => {
                if (!event || !event.returnValues) return;

                const payload = {
                    transactionHash: event.transactionHash,
                    blockHash: event.blockHash,
                    type: event.type,
                    transferId: event.returnValues.transferId,
                    operation: event.returnValues.operation,
                    fromAddress: event.returnValues.fromAddress
                }

                axios.post(process.env.WEBHOOK, {payload}).then(response => {
                    console.log('sent webhook successfully');
                }).catch(error => {
                    console.error("Webhook got an error. ", error);
                });
            });
        } catch (e) {
            console.log('Cannot subscribe to contract TokenTransferred event')
        }
    }

    registerHandlerOnTokenTransferred() {
        try {
            this.contract.events.TokenTransferred({}, (error, event) => {

                if (!event || !event.returnValues) return;

                const payload = {
                    transactionHash: event.transactionHash,
                    blockHash: event.blockHash,
                    type: event.type,
                    transferId: event.returnValues.transferId,
                    operation: event.returnValues.operation,
                    fromAddress: event.returnValues.fromAddress,
                    toAddress: event.returnValues.toAddress
                };

                axios.post(process.env.WEBHOOK, {payload}).then(response => {
                    console.log('sent webhook successfully');
                }).catch(error => {
                    console.error("Webhook got an error. ", error);
                });
            })
        } catch (e) {
            console.log('Cannot subscribe to contract TokenTransferred event')
        }
    }

    sendContractMethod(method, senderAddress, ...args) {
        return new Promise((resolve, reject) => {
            const contractTransaction = this.contract.methods[method](...args)

            contractTransaction.estimateGas({from: senderAddress})
                .then(async (gasPrice) => {
                    const gasLimit = await this.gasLimit()
                    this.web3.eth.getTransactionCount(senderAddress).then((transactionNonce) => {

                        var data = contractTransaction.encodeABI();
                        const tsObject = {
                            chainId: process.env.CHAIN_ID,
                            nonce: transactionNonce,
                            gasLimit: gasLimit,
                            gasPrice,
                            to: process.env.CONTRACT_ADDRESS,
                            from: senderAddress,
                            data: data
                        }
                        resolve(tsObject)
                    })
                }).catch(error => {
                reject(new AppError(this.decodeTransactionError(error.data), 400))
            })
        })
    }

    decodeTransactionError(data) {
        try {
            let hex = data.substr(data.length - (data.length - 10) / 3)
            return this.web3.utils.hexToString("0x" + hex);
        } catch (e) {
            return "There was an error. Transaction reverted"
        }
    }
}

module.exports = TreasuryContractService;