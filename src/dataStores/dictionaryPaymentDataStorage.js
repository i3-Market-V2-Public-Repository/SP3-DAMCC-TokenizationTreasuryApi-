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

const PaymentDataStore = require('./paymentDataStore')
const Operation = require('../entities/operation')
const {nameSpacedUUID} = require("../utils/uuid_generator");

class DictionaryPaymentDataStorage extends PaymentDataStore {

    constructor() {
        super();
        this.operations = {}
    }

    async getOperations() {
        const response = []

        Object.keys(this.operations).forEach(id => {
            response.push(this.operations[id]);
        });

        return response;
    }


    async getOperationById(id) {
        if (this.operations[id]) {
            return Operation._clone(this.operations[id])
        }
        return Operation.NULL
    }

    async getOperationsByType(type) {
        const response = [];
        let operation;

        Object.keys(this.operations).forEach(id => {
                operation = this.operations[id];
                if (operation.type === type) response.push(Operation._clone(operation));
            }
        );

        return response
    }

    async getOperationsByTransferId(transferId) {
        console.log("[DictionaryPaymentDataStorage][getOperationsByTransferId] transferId: " + transferId)
        const response = [];
        let operation;
        console.log("[DictionaryPaymentDataStorage][getOperationsByTransferId] operations: " + JSON.stringify(this.operations))
        Object.keys(this.operations).forEach(
            id => {
                operation = this.operations[id];
                if (operation.transferId === transferId) response.push(Operation._clone(operation));
            }
        );

        console.log("[DictionaryPaymentDataStorage][getOperationsByTransferId] response: " + JSON.stringify(response))

        return response
    }


    async getOperationsByStatus(status) {
        const response = [];
        let operation;

        Object.keys(this.operations).forEach(id => {
                operation = this.operations[id];
                if (operation.status === status) response.push(Operation._clone(operation));
            }
        );

        console.log("[DictionaryPaymentDataStorage][getOperationsByStatus] response: " + JSON.stringify(response))
        return response
    }

    async getOperationsByDate(date) {
        throw "must implement serialize for MyInterface types"
    }

    async getOperationsByUser(user) {
        const response = [];
        let operation;

        Object.keys(this.operations).forEach(
            id => {
                operation = this.operations[id];
                if (operation.user === user) response.push(Operation._clone(operation));
            }
        );

        return response
    }

    async createOperation(operation) {
        operation.setId(nameSpacedUUID());
        this.operations[operation.id] = operation;

        return Operation._clone(operation);
    }

    async updateOperationStatus(id, status) {
        this.operations[id].status = status;

        return Operation._clone(this.operations[id]);
    }
}

module
    .exports = DictionaryPaymentDataStorage;