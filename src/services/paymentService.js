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

const Operation = require("../entities/operation")
const {nameSpacedUUID} = require("../utils/uuid_generator");

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

    async getOperationById(id) {
        return await this.store.getOperationById(id);
    }

    async getOperationByTransferId(transferId) {
        return await this.store.getOperationByTransferId(transferId);
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
        console.log("[PaymentService][exchangeIn] request: " + "\nUserAddress: " + userAddress + "\nTokens: " + tokens);

        try {
            let operation = new Operation("exchange_in", "open", userAddress)
            operation.setTransferId(nameSpacedUUID());
            operation = await this.store.createOperation(operation);

            const transactionObject = await this.treasurySmartContract.exchangeIn(
                operation.id, process.env.MARKETPLACE_ADDRESS, userAddress, tokens
            )
            transactionObject.transferId = operation.transferId;
            transactionObject.operation = operation;
            console.log("[PaymentService][exchangeIn] response: " + JSON.stringify(transactionObject));
            return transactionObject;
        } catch (err) {
            console.log("[PaymentService][exchangeOut] Error → " + err);
        }
    }

    async exchangeOut(userAddress) {
        console.log("[PaymentService][exchangeOut] request: " + "\nUserAddress: " + userAddress);

        try {
            let operation = new Operation("exchange_out", "open", userAddress);
            operation.setTransferId(nameSpacedUUID());
            operation = await this.store.createOperation(operation);
            const transactionObject = await this.treasurySmartContract.exchangeOut(
                operation.id, userAddress, process.env.MARKETPLACE_ADDRESS
            )
            transactionObject.transferId = operation.id;
            transactionObject.operation = operation;
            console.log("[PaymentService][exchangeOut] response: " + JSON.stringify(transactionObject));
            return transactionObject;
        } catch (err) {
            console.log("[PaymentService][exchangeOut] Error → " + err);
        }
    }

    async setPaid(transferId, transferCode) {

    }
}

module.exports = PaymentService;