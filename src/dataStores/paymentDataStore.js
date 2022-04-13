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

class PaymentDataStore {

    async getOperations() {
        throw "must implement getOperations, Returns an operation entity list"
    }

    async getOperationById(id) {
        throw "must implement getOperationById, Returns an operation entity"
    }

    async getOperationsByTransferId(transferId) {
        throw "must implement getOperationsByTransferId, Returns an operation entity list"
    }

    async getOperationsByType(type) {
        throw "must implement getOperationsByType, Returns an operation entity list"
    }

    async getOperationsByStatus(status) {
        throw "must implement getOperationsByStatus, Returns an operation entity list"
    }

    async getOperationsByDate(fromDate = new Date(null), toDate = new Date(Date.now()))  {
        throw "must implement getOperationsByDate, Returns an operation entity list"
    }

    async getOperationsByUser(user) {
        throw "must implement getOperationsByUser, Returns an operation entity list"
    }

    async createOperation(operation) {
        throw "must implement createOperation, Returns an operation entity"
    }

    async updateOperationStatus(id, status) {
        throw "must implement updateOperationStatus, Returns an operation entity"
    }
}

module.exports = PaymentDataStore;