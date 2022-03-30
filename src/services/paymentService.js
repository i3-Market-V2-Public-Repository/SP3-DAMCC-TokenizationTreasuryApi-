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
        console.log(`[PaymentService][exchangeIn] Request: \nUserAddress: ${userAddress} \nTokens: ${tokens}`);
        const response = {}

        try {
            let operation = new Operation(nameSpacedUUID(), "exchange_in", "open", userAddress);
            operation = await this.store.createOperation(operation);

            const transactionObject = await this.treasurySmartContract.exchangeIn(
                operation.id, process.env.MARKETPLACE_ADDRESS, userAddress, tokens
            )
            response.transferId = operation.transferId;
            response.operation = operation;
            response.transactionObject = transactionObject;
            console.log(`[PaymentService][exchangeIn] Response:  ${JSON.stringify(response)}`);
            return response;
        } catch (err) {
            console.log(`[PaymentService][exchangeOut] Error → ${err}`);
        }
    }

    async exchangeOut(userAddress) {
        console.log(`[PaymentService][exchangeOut] Request: \nUserAddress: ${userAddress}`);

        try {
            let operation = new Operation(nameSpacedUUID(), "exchange_out", "open", userAddress);
            operation = await this.store.createOperation(operation);
            const transactionObject = await this.treasurySmartContract.exchangeOut(
                operation.id, userAddress, process.env.MARKETPLACE_ADDRESS
            )
            transactionObject.transferId = operation.id;
            transactionObject.operation = operation;
            console.log(`[PaymentService][exchangeOut] Response: ${JSON.stringify(transactionObject)}`);
            return transactionObject;
        } catch (err) {
            console.log(`[PaymentService][exchangeOut] Error → ${err}`);
        }
    }

    async setPaid(transferId, transferCode) {
        return await this.treasurySmartContract.setPaid(transferId, process.env.MARKETPLACE_ADDRESS, transferCode);
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
            if (this.isExternalMarketplaceBalance(address, balance)) {
                console.log(`[PaymentService][_generateTransferTokens] balance: ${balance}`);
                result.push(new TokenTransfer(process.env.MARKETPLACE_ADDRESS, address, balance));
            }
        }

        console.log(`[PaymentService][_generateTransferTokens] result:  ${JSON.stringify(result)}`);
        return result;
    }

    isExternalMarketplaceBalance(address, balance) {
        return address !== process.env.MARKETPLACE_ADDRESS && balance > 0;
    }


}

module.exports = PaymentService;