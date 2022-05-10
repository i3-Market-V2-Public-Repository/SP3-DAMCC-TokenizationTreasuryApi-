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

const EventHandler = require("./eventHandler");
const Operation = require("../../entities/operation");

class FiatMoneyPaymentHandler extends EventHandler {

    constructor(paymentDataStore) {
        super();
        this.paymentStore = paymentDataStore;
    }

    async execute(event) {
        console.log("[FiatMoneyPaymentHandler][execute] Event: " + JSON.stringify(event));

        const operations = await this.paymentStore.getOperationsByTransferId(event.transferId);
        const openOperation = operations[0];
        let closeOperation;

        if (this._isInProgress(operations, Operation.ClearingSubtypes.CLEARING_IN)
            && event.fromAddress === operations[0].user) {
            closeOperation = new Operation(
                openOperation.transferId,
                Operation.ClearingSubtypes.CLEARING_IN,
                Operation.Status.CLOSED,
                openOperation.user
            );
        } else if (this._isInProgress(operations, Operation.ClearingSubtypes.CLEARING_OUT)) {
            closeOperation = new Operation(
                openOperation.transferId,
                Operation.ClearingSubtypes.CLEARING_OUT,
                Operation.Status.CLOSED,
                openOperation.user
            );
        } else if (this._isInProgress(operations, Operation.Type.EXCHANGE_OUT)) {
            closeOperation = new Operation(
                openOperation.transferId,
                Operation.Type.EXCHANGE_OUT,
                Operation.Status.CLOSED,
                openOperation.user
            )
        } else {
            console.log("[FiatMoneyPaymentHandler][execute] Event" + event.operation + " NOT FOUND");
            return Operation.NULL;
        }
        return await this.paymentStore.createOperation(closeOperation);
    }


    _isInProgress(operations, operationType) {
        return !this._isClosedOperation(operations) && operations[0].type === operationType;
    }


    _isClosedOperation(operations) {
        return operations.some(operation => operation.status === Operation.Status.CLOSED);
    }
}

module.exports = FiatMoneyPaymentHandler;