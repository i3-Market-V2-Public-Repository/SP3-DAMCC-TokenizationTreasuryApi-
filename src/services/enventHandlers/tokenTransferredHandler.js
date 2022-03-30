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


class TokenTransferredHandler extends EventHandler {

    constructor(paymentDataStore) {
        super();
        this.paymentStore = paymentDataStore;
    }

    async execute(event) {
        console.log("[PaymentServiceEventHandler][execute] Event: " + JSON.stringify(event));

        if (event.fromAddress === process.env.MARKETPLACE_ADDRESS && event.operation === Operation.Type.EXCHANGE_IN) {
            return await this._closeExchangeInOperation(event);
        } else if (event.operation === Operation.Type.EXCHANGE_OUT) {
            return await this._handleExchangeOutOperation(event);
        } else if (event.operation === Operation.Type.CLEARING) {
            return await this._handleClearingOperation(event)
        } else {
            console.log("[PaymentServiceEventHandler][execute] Event" + event.operation + " NOT FOUND")
        }
    }

    async _closeExchangeInOperation(event) {
        let operations = await this.paymentStore.getOperationsByTransferId(event.transferId);
        console.log("[PaymentServiceEventHandler][_closeOperation] operations " + JSON.stringify(operations));
        if (operations && operations.length === 1 && operations[0].status === Operation.Status.OPEN) {
            let operation = new Operation(
                event.transferId, Operation.Type.EXCHANGE_IN, Operation.Status.CLOSED, operations[0].user
            );
            return await this.paymentStore.createOperation(operation);
        }

        return Operation.NULL
    }

    async _handleExchangeOutOperation(event) {
        let operations = await this.paymentStore.getOperationsByTransferId(event.transferId);
        console.log("[PaymentServiceEventHandler][_handleExchangeOutOperation] operations " + JSON.stringify(operations));
        if (operations && operations.length === 1 && operations[0].status === Operation.Status.OPEN) {
            let operation = new Operation(
                event.transferId, Operation.Type.EXCHANGE_OUT, Operation.Status.IN_PROGRESS, operations[0].user
            );

            return await this.paymentStore.createOperation(operation);
        }

        return Operation.NULL;
    }

    async _handleClearingOperation(event) {
        console.log(`[PaymentServiceEventHandler][_handleClearingOperation] event: ${JSON.stringify(event)}`)
        let operation;

        if (event.fromAddress !== process.env.MARKETPLACE_ADDRESS && event.toAddress !== process.env.MARKETPLACE_ADDRESS) {
            console.log(`[PaymentServiceEventHandler][_handleClearingOperation] No es}`)
            return Operation.NULL;
        }

        if (event.fromAddress === process.env.MARKETPLACE_ADDRESS) {
            console.log(`[PaymentServiceEventHandler][_handleClearingOperation] Clearing in}`)
            operation = new Operation(
                event.transferId, Operation.ClearingSubtypes.CLEARING_IN, Operation.Status.OPEN, event.toAddress
            );
        } else if (event.toAddress === process.env.MARKETPLACE_ADDRESS) {
            operation = new Operation(
                event.transferId, Operation.ClearingSubtypes.CLEARING_OUT, Operation.Status.OPEN, event.fromAddress
            );
        }

        return this.paymentStore.createOperation(operation);
    }
}

module.exports = TokenTransferredHandler;