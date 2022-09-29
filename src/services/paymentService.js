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

const Operation = require("../entities/operation")
const {nameSpacedUUID} = require("../utils/uuid_generator");
const TokenTransfer = require("../entities/tokenTransfer");
const ClearingOperation = require("../entities/clearingOperation");

let instance = null;

class PaymentService {
    static getInstance() {
        if (instance === null) {
            instance = new PaymentService();
        }
        return instance;
    }

    constructor() {
        this.store = null;
    }

    setDataStore(dataStore) {
        this.store = dataStore;
    }

    setTreasurySmartContractService(treasurySmartContract) {
        this.treasurySmartContract = treasurySmartContract;
    }

    async getOperations(limit, offset) {
        return await this.store.getOperations(limit, offset);
    }

    async getOperationById(id) {
        return await this.store.getOperationById(id);
    }

    async getOperationsByTransferId(transferId, limit, offset) {
        return await this.store.getOperationsByTransferId(transferId, limit, offset);
    }

    async getOperationsByType(type, limit, offset) {
        return await this.store.getOperationsByType(type, limit, offset);
    }

    async getOperationsByStatus(status, limit, offset) {
        return this.store.getOperationsByStatus(status, limit, offset);
    }

    async getOperationsByUser(user, limit, offset) {
        return this.store.getOperationsByUser(user, limit, offset);
    }

    async getOperationsByDate(fromDate, toDate, limit, offset) {
        return this.store.getOperationsByDate(fromDate, toDate, limit, offset);
    }

    async exchangeIn(userAddress, tokens) {
        console.log(`[PaymentService][exchangeIn] Request: 
        UserAddress: ${userAddress} 
        Tokens: ${tokens}`);

        const response = {};
        let transactionObject;
        let operation = new Operation(nameSpacedUUID(), Operation.Type.EXCHANGE_IN, Operation.Status.UNSIGNED, userAddress);

        try {
            transactionObject = await this.treasurySmartContract.exchangeIn(
                operation.transferId, process.env.MARKETPLACE_ADDRESS, userAddress, tokens
            );
            operation = await this.store.createOperation(operation);
        } catch (err) {
            console.log(`[PaymentService][exchangeIn] Error → ${err}`);
        }

        response.transferId = operation.transferId
        response.operation = operation;
        response.transactionObject = transactionObject;

        console.log(`[PaymentService][exchangeIn] Response:  ${JSON.stringify(response)}`);
        return response;
    }

    async exchangeOut(senderAddress, marketplaceAddress) {
        console.log(`[PaymentService][exchangeOut] Request: 
        senderAddress: ${senderAddress}
        marketplaceAddress: ${marketplaceAddress}`);

        const response = {};
        let transactionObject;
        let operation = new Operation(nameSpacedUUID(), Operation.Type.EXCHANGE_OUT, Operation.Status.UNSIGNED, senderAddress);

        try {
            transactionObject = await this.treasurySmartContract.exchangeOut(
                operation.transferId, senderAddress, marketplaceAddress
            );
            operation = await this.store.createOperation(operation)
        } catch (err) {
            console.log(`[PaymentService][exchangeOut] Error → ${err}`);
        }

        response.transactionObject = transactionObject;
        response.transferId = operation.transferId;
        response.operation = operation;

        console.log(`[PaymentService][exchangeOut] Response: ${JSON.stringify(transactionObject)}`);
        return response;
    }

    async clearing() {
        console.log(`[PaymentService][clearing] Request: ${process.env.MARKETPLACE_ADDRESS}`);

        const balances = await this.treasurySmartContract.getBalanceForAddress(process.env.MARKETPLACE_ADDRESS);
        const clearingOperations = await this._generateClearingOperations(balances);
        console.log(`[PaymentService][clearing] Clearing Operations: ${JSON.stringify(clearingOperations)}`);

        return await this.treasurySmartContract.clearing(clearingOperations, process.env.MARKETPLACE_ADDRESS);
    }

    async _generateClearingOperations(balances) {
        console.log(`[PaymentService][_generateClearingOperations] Balances: ${JSON.stringify(balances)}`);
        const result = [];
        let balance, address;

        for (let i = 0; i < balances.length; i++) {
            balance = balances[i];
            address = await this.treasurySmartContract._getMarketplaceAddressByIndex(i);
            if (this._isExternalMarketplaceBalance(address, balance)) {
                console.log(`[PaymentService][_generateClearingOperations] balance: ${balance}`);
                let operation = new ClearingOperation(address, balance)
                await this.store.createOperation(operation)
                result.push(operation);
            }
        }

        console.log(
            `[PaymentService][_generateClearingOperations] result:  
        ${JSON.stringify(result, null, 4)}`
        );
        return result;
    }

    _isExternalMarketplaceBalance(address, balance) {
        return address !== process.env.MARKETPLACE_ADDRESS && balance > 0;
    }

    async setPaid(sender, transferId, transferCode) {
        return await this.treasurySmartContract.setPaid(transferId, sender, transferCode);
    }


    async feePayment(senderAddress, dataProviderMPAddress, feeAmount) {
        console.log(`[PaymentService][feePayment] Request:  
        senderAddress: ${senderAddress} 
        dataProviderMPAddress: ${dataProviderMPAddress} 
        feeAmount: ${feeAmount}`
        );

        const response = {};
        let transactionObject;
        let communityWallet = await this.treasurySmartContract.getCommunityWallet()
        console.log('[CommunityWallet]'+communityWallet)

        let communityOperation = new Operation(
            nameSpacedUUID(), Operation.Type.FEE_PAYMENT, Operation.Status.UNSIGNED, communityWallet ||process.env.COMMUNITY_ADDRESS
        );
        let MPOperation = new Operation(
            nameSpacedUUID(), Operation.Type.FEE_PAYMENT, Operation.Status.UNSIGNED, dataProviderMPAddress
        );
        try {
            transactionObject = await this.treasurySmartContract.feePayment(
                communityOperation.transferId,
                MPOperation.transferId,
                dataProviderMPAddress,
                feeAmount,
                senderAddress
            );
            communityOperation = await this.store.createOperation(communityOperation);
            MPOperation = await this.store.createOperation(MPOperation);
        } catch (err) {
            console.log(`[PaymentService][feePayment] Error → ${err}`);
            response.error = err;

            return response;
        }

        response.transferIds = [communityOperation.transferId, MPOperation.transferId];
        response.operations = [communityOperation, MPOperation];
        response.transactionObject = transactionObject;

        console.log(`[PaymentService][feePayment] Response:  ${JSON.stringify(response)}`);
        return response;
    }
}

module.exports = PaymentService;