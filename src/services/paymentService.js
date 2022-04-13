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

    async getOperations() {
        return await this.store.getOperations();
    }

    async getOperationById(id) {
        return await this.store.getOperationById(id);
    }

    async getOperationsByTransferId(transferId) {
        return await this.store.getOperationsByTransferId(transferId);
    }


    async getOperationsByType(type) {
        return await this.store.getOperationsByType(type);
    }

    async getOperationsByStatus(status) {
        return this.store.getOperationsByStatus(status);
    }

    async getOperationsByUser(user) {
        return this.store.getOperationsByUser(user);
    }

    async exchangeIn(userAddress, tokens) {
        console.log(`[PaymentService][exchangeIn] Request: 
        UserAddress: ${userAddress} 
        Tokens: ${tokens}`);

        const response = {}
        let transactionObject;
        let operation = new Operation(nameSpacedUUID(), "exchange_in", "open", userAddress);

        try {
            operation = await this.store.createOperation(operation);
            transactionObject = await this.treasurySmartContract.exchangeIn(
                operation.transferId, process.env.MARKETPLACE_ADDRESS, userAddress, tokens
            )
        } catch (err) {
            console.log(`[PaymentService][exchangeOut] Error → ${err}`);
        }

        response.transferId = operation.transferId;
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
        let operation = new Operation(nameSpacedUUID(), "exchange_out", "open", senderAddress);

        try {
            operation = await this.store.createOperation(operation);
            transactionObject = await this.treasurySmartContract.exchangeOut(
                operation.transferId, senderAddress, marketplaceAddress
            );
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

        const balances = this.treasurySmartContract.getBalanceForAddress(process.env.MARKETPLACE_ADDRESS);
        const transferTokens = await this._generateTransferTokens(balances.balance);
        console.log(`[PaymentService][clearing] Transfer tokens: ${JSON.stringify(transferTokens)}`)

        return await this.treasurySmartContract.clearing(transferTokens, process.env.MARKETPLACE_ADDRESS);
    }

    async _generateTransferTokens(balances) {
        console.log(`[PaymentService][_generateTransferTokens] Balances: ${balances}`);
        const result = []
        let balance, address;

        for (let i = 0; i < balances.length; i++) {
            balance = balances[i];
            address = await this.treasurySmartContract._getMarketplaceAddressByIndex(i);
            if (this._isExternalMarketplaceBalance(address, balance)) {
                console.log(`[PaymentService][_generateTransferTokens] balance: ${balance}`);
                result.push(new TokenTransfer(process.env.MARKETPLACE_ADDRESS, address, balance));
            }
        }

        console.log(`[PaymentService][_generateTransferTokens] result:  ${JSON.stringify(result)}`);
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

        const response = {}
        let transactionObject;

        let communityOperation = new Operation(
            nameSpacedUUID(), Operation.Type.FEE_PAYMENT, Operation.Status.OPEN, process.env.COMMUNITY_ADDRESS
        );
        let MPOperation = new Operation(
            nameSpacedUUID(), Operation.Type.FEE_PAYMENT, Operation.Status.OPEN, dataProviderMPAddress
        );
        try {
            communityOperation = await this.store.createOperation(communityOperation);
            MPOperation = await this.store.createOperation(MPOperation);
            transactionObject = await this.treasurySmartContract.feePayment(
                communityOperation.transferId,
                MPOperation.transferId,
                dataProviderMPAddress,
                feeAmount,
                senderAddress
            )
        } catch (err) {
            console.log(`[PaymentService][feePayment] Error → ${err}`);
        }

        response.transferIds = [communityOperation.transferId, MPOperation.transferId];
        response.operations = [communityOperation, MPOperation];
        response.transactionObject = transactionObject;

        console.log(`[PaymentService][feePayment] Response:  ${JSON.stringify(response)}`);
        return response;
    }
}

module.exports = PaymentService;