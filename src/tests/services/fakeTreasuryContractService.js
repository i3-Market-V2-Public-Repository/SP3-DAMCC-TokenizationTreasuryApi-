/**
 * Copyright (c) 2020-2022 in alphabetical order:
 * GFT, Telesto Technologies
 *
 * This program and the accompanying materials are made
 * available under the terms of the EUROPEAN UNION PUBLIC LICENCE v. 1.2
 * which is available at https://gitlab.com/i3-market/code/wp3/t3.3/nodejs-tokenization-treasury-api/-/blob/master/LICENCE.md
 *
 * License-Identifier: EUPL-1.2
 *
 * Contributors:
 *    Vangelis Giannakosian (Telesto Technologies)
 *    Dimitris Kokolakis (Telesto Technologies)
 *
 */

'use strict';


const axios = require('axios')
const fs = require('fs');
const path = require('path');
const AppError = require('../../utils/AppError');
const TreasuryContract = require('../../services/treasuryContract')

let instance = null;
let NONCE = -1;
const CHAIN_ID = "42";

class TransactionObject {
    constructor(senderAddress) {
        this.chainId = CHAIN_ID;
        this.nonce = NONCE;
        this.gasLimit = 2;
        this.gasPrice = 1;
        this.to = "contract address";
        this.from = senderAddress;
        this.data = "data"
    }
}


class FakeTreasuryContractService extends TreasuryContract {

    static getInstance() {
        if (instance === null) {
            instance = new FakeTreasuryContractService();
        }
        return instance;
    }

    constructor() {
        super();
        if (instance) return instance
        this.eventHandlers = [];
    }

    connect() {
        console.log("Fake Treasury Contract connected!")
    }


    addEventHandler(handler) {
        this.eventHandlers.push(handler);
    }


    addMarketPlace(senderAddress, marketplaceAddress) {
        return new Promise(resolve => {
            NONCE += 1;
            setTimeout(
                resolve({"transactionObject": new TransactionObject(senderAddress)}),
                1500
            )
        });
    }


    exchangeIn(transferId, senderAddress, userAddress, tokens) {
        return new Promise(resolve => {
            NONCE += 1;
            setTimeout(
                resolve({"transferId": transferId, "transactionObject": new TransactionObject(senderAddress)}),
                1500
            )
        });
    }


    async exchangeOut(transferId, senderAddress, marketplaceAddress) {
        return new Promise(resolve => {
            NONCE += 1;
            setTimeout(
                resolve({"transferId": transferId, "transactionObject": new TransactionObject(senderAddress)}),
                1500
            )
        });
    }

    //
    // payment(transferId, senderAddress, providerAddress, amount) {
    //     return this.sendContractMethod(
    //         'payment',
    //         senderAddress,
    //         transferId,
    //         providerAddress,
    //         amount
    //     )
    // }
    //
    // clearing(transferId, senderAddress) {
    //     return this.sendContractMethod(
    //         'clearing',
    //         senderAddress,
    //         transferId
    //     )
    // }
    //
    // setPaid(transferId, senderAddress, transferCode) {
    //     return this.sendContractMethod(
    //         'setPaid',
    //         senderAddress,
    //         transferId,
    //         transferCode
    //     )
    // }
    //
    // deploySignedTransaction(serializedTx) {
    //     return this.web3.eth.sendSignedTransaction(serializedTx.toString(), (err, ret) => {
    //         if (err) {
    //             console.log("An error occurred", err)
    //             return
    //         }
    //     })
    // }
    //
    // getTransactionReceipt(hash) {
    //     return this.web3.eth.getTransactionReceipt(hash);
    // }
    //
    // getTransactionByTransferId(transferId) {
    //     return this.contract.methods.transactions(transferId).call();
    // }
    //
    // async gasLimit() {
    //     const block = await this.getLatestBlock()
    //     return block.gasLimit || process.env.GAS_LIMIT
    // }
    //
    // getLatestBlock() {
    //     return this.web3.eth.getBlock("latest");
    // }
    //
    // getBalanceForAddress(address) {
    //     return this.contract.methods.balanceOfAddress(address).call()
    // }
    //
    // getMarketPlaceIndex(address) {
    //     return this.contract.methods.getMarketplaceIndex(address).call()
    // }
    //
    // registerHandlerOnTokenTransferred() {
    //
    //     try {
    //         this.contract.events.TokenTransferred({}, (error, event) => {
    //
    //             if (!event || !event.returnValues) return;
    //
    //             console.log("Event received: " + event);
    //             const payload = {
    //                 transactionHash: event.transactionHash,
    //                 blockHash: event.blockHash,
    //                 type: event.type,
    //                 operation: event.returnValues.operation,
    //                 transferId: event.returnValues.transferId,
    //                 sender: event.returnValues._sender,
    //             };
    //
    //             axios.post(process.env.WEBHOOK, {payload})
    //                 .then(function (response) {
    //                     console.log('sent webhook successfully')
    //                 })
    //                 .catch(function (error) {
    //                     console.error("Webhook got an error. ", error);
    //                 });
    //         })
    //     } catch (e) {
    //         console.log('Cannot subscribe to contract TokenTransferred event')
    //     }
    // }
    //
    // sendContractMethod(method, senderAddress, ...args) {
    //     console.log("[TreasuryContractService][sendContractMethod] data: " +
    //         "\n Method: " + method +
    //         "\n Sender: " + senderAddress +
    //         "\n Args: " + args
    //     )
    //     return new Promise((resolve, reject) => {
    //         const contractTransaction = this.contract.methods[method](...args)
    //
    //         contractTransaction.estimateGas({from: senderAddress})
    //             .then(async (gasPrice) => {
    //                 const gasLimit = await this.gasLimit()
    //                 this.web3.eth.getTransactionCount(senderAddress).then((transactionNonce) => {
    //
    //                     var data = contractTransaction.encodeABI();
    //                     const tsObject = {
    //                         chainId: process.env.CHAIN_ID,
    //                         nonce: transactionNonce,
    //                         gasLimit: gasLimit,
    //                         gasPrice,
    //                         to: process.env.CONTRACT_ADDRESS,
    //                         from: senderAddress,
    //                         data: data
    //                     }
    //                     resolve(tsObject)
    //                 })
    //             }).catch(error => {
    //             console.log("[TreasuryContractService][decodeTransactionError] data: " + error)
    //             reject(new AppError(this.decodeTransactionError(error.data), 400))
    //         })
    //     })
    // }
    //
    // decodeTransactionError(data) {
    //
    //     try {
    //         let hex = data.substr(data.length - (data.length - 10) / 3)
    //         return this.web3.utils.hexToString("0x" + hex);
    //     } catch (e) {
    //         return "There was an error. Transaction reverted"
    //     }
    // }
}

module.exports = FakeTreasuryContractService;