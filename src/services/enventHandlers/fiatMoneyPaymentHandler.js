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


    // emit FiatMoneyPayment(transferId, operation, fromAddress); // _transferId, "set_paid", msg.sender
    async execute(event) {
        console.log("[FiatMoneyPaymentHandler][execute] Event: " + JSON.stringify(event));

        // Cant check if I am the sender or receiver to avoid access to the DB
        return await this._handleSetPaid(event);
    }


    async _handleSetPaid(event) {
        const operations = await this.paymentStore.getOperationsByTransferId(event.transferId);

        if (this._hasAnOpenClearingOperation(operations)) {
            return await this.getClosedClearingOperation(operations[0], event);
        }

        return Operation.NULL;
    }

    _hasAnOpenClearingOperation(operations) {
        return operations.length === 1 && operations[0].status === Operation.Status.OPEN;
    }

    async getClosedClearingOperation(openOperation, event) {
        let closeOperation;

        if (event.fromAddress === openOperation.user && openOperation.type === Operation.ClearingSubtypes.CLEARING_IN) {
            closeOperation = new Operation(
                openOperation.transferId,
                Operation.ClearingSubtypes.CLEARING_IN,
                Operation.Status.CLOSED,
                openOperation.user
            );
        } else {
            closeOperation = new Operation(
                openOperation.transferId,
                Operation.ClearingSubtypes.CLEARING_OUT,
                Operation.Status.CLOSED,
                openOperation.user
            );
        }
        return await this.paymentStore.createOperation(closeOperation);
    }


}

module.exports = FiatMoneyPaymentHandler;