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

const PaymentDataStore = require('./paymentDataStore')
const Operation = require('../entities/operation')
const {nameSpacedUUID} = require("../utils/uuid_generator");

class DictionaryPaymentDataStorage extends PaymentDataStore {

    constructor() {
        super();
        this.operations = {}
    }

    async getOperations(offset=0, limit=Number.MAX_SAFE_INTEGER) {
        const response = []

        Object.keys(this.operations).forEach(id => {
            response.push(this.operations[id]);
        });
        
        return response.slice(offset, limit);
    }


    async getOperationById(id) {
        if (this.operations[id]) {
            return Operation._clone(this.operations[id])
        }
        return Operation.NULL
    }

    async getOperationsByType(type, offset=0, limit=Number.MAX_SAFE_INTEGER) {
        const response = [];
        let operation;

        Object.keys(this.operations).forEach(id => {
                operation = this.operations[id];
                if (operation.type === type) response.push(Operation._clone(operation));
            }
        );

        return response.slice(offset, limit);
    }

    async getOperationsByTransferId(transferId, offset=0, limit=Number.MAX_SAFE_INTEGER) {
        console.log(`[DictionaryPaymentDataStorage][getOperationsByTransferId] request transferId: ${transferId}`)
        const response = [];
        let operation;

        Object.keys(this.operations).forEach(
            id => {
                operation = this.operations[id];
                if (operation.transferId === transferId) response.push(Operation._clone(operation));
            }
        );

        console.log(`[DictionaryPaymentDataStorage][getOperationsByTransferId] response: ${JSON.stringify(response)}`)

        return response.slice(offset, limit);
    }


    async getOperationsByStatus(status, offset=0, limit=Number.MAX_SAFE_INTEGER) {
        console.log(`[DictionaryPaymentDataStorage][getOperationsByStatus] request status: ${status}`)
        const response = [];
        let operation;

        console.log(
            `[DictionaryPaymentDataStorage][getOperationsByStatus] operations: ${JSON.stringify(this.operations)}`
        )
        Object.keys(this.operations).forEach(
            id => {
                operation = this.operations[id];
                console.log(
                    `[DictionaryPaymentDataStorage][getOperationsByStatus] operation: ${JSON.stringify(operation)}`
                )
                if (operation.status === status) response.push(Operation._clone(operation));
            }
        );

        console.log("[DictionaryPaymentDataStorage][getOperationsByStatus] response: " + JSON.stringify(response))
        
        return response.slice(offset, limit);
    }

    async getOperationsByDate(fromDate = new Date(null), toDate = new Date(Date.now()), offset=0, limit=Number.MAX_SAFE_INTEGER) {
        const response = [];
        let operation;

        try {
            if (fromDate.getTime() > toDate.getTime())
                throw Error("Date mismatch: fromDate is later than toDate")

            Object.keys(this.operations).forEach(
                id => {
                    operation = this.operations[id];
                    if (operation.date.getTime() >= fromDate.getTime() && operation.date.getTime() < toDate.getTime())    //DateTime comparison down to millisecond
                        response.push(Operation._clone(operation));
                }
            );
        } catch (error) {
            console.log(error);
        }

        console.log("[DictionaryPaymentDataStorage][getOperationsByDate] response: " + JSON.stringify(response))
        return response.slice(offset, limit);
    }

    async getOperationsByUser(user, userOffset=0, limit=Number.MAX_SAFE_INTEGER) {
        const response = [];
        let operation;

        Object.keys(this.operations).forEach(
            id => {
                operation = this.operations[id];
                if (operation.user === user) response.push(Operation._clone(operation));
            }
        );

        return response.slice(userOffset, limit);
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