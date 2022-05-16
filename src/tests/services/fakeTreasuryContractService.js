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


const TreasuryContract = require('../../services/treasuryContract');

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
        this.dummyBlances = [];
        this.MPIndex = [];
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
            setTimeout(resolve({"transactionObject": new TransactionObject(senderAddress)}), 1500)
        });
    }

    exchangeIn(transferId, senderAddress, userAddress, tokens) {
        return new Promise(resolve => {
            NONCE += 1;
            setTimeout(resolve({
                "transferId": transferId, "transactionObject": new TransactionObject(senderAddress)
            }), 1500)
        });
    }

    async exchangeOut(transferId, senderAddress, marketplaceAddress) {
        return new Promise(resolve => {
            NONCE += 1;
            setTimeout(resolve({
                "transferId": transferId, "transactionObject": new TransactionObject(senderAddress)
            }), 1500)
        });
    }


    clearing(clearingOperations, senderAddress) {
        console.log(`[FakeTreasuryContract][clearing] ${JSON.stringify(clearingOperations)} ${senderAddress}`)
        this.clearingArgs = {
            clearingOperations: clearingOperations, senderAddress: senderAddress
        }
    }


    feePayment(communityTransferId, marketplaceTransferId, dataProviderMPAddress, feeAmount, senderAddress) {
        console.log(`[FakeTreasuryContract][feePaid] Request: 
        communityTransferId: ${communityTransferId}
        marketplaceTransferId: ${marketplaceTransferId}
        feeAmount: ${feeAmount}
        senderAddress: ${senderAddress}`)
    }


    setDummyBalances(address, balances) {
        this.dummyBlances[address] = balances;
    }

    getBalanceForAddress(address) {
        return this.dummyBlances[address];
    }


    setDummyMPIndex(address, index) {
        this.MPIndex[index] = address;
    }

    _getMarketplaceAddressByIndex(index) {
        return this.MPIndex[index];
    }
}

module.exports = FakeTreasuryContractService;