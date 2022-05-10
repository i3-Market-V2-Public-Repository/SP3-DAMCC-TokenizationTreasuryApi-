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
        console.log(`[TokenTransferredHandler][execute] Event: ${JSON.stringify(event)}`);

        if (this._isThisMPExchangeInEvent(event)) {
            return await this._createOperation(event, Operation.Status.CLOSED);
        } else if (event.operation === Operation.Type.EXCHANGE_OUT) {
            return await this._createOperation(event, Operation.Status.IN_PROGRESS);
        } else if (this._isThisMPClearingEvent(event)) {
            return await this._handleClearingOperation(event)
        } else if (event.operation === Operation.Type.FEE_PAYMENT) {
            return await this._createOperation(event, Operation.Status.CLOSED);
        } else {
            console.log(`[TokenTransferredHandler][execute] Event: ${event.operation} NOT FOUND`)
        }
    }

    _isThisMPExchangeInEvent(event) {
        return event.fromAddress === process.env.MARKETPLACE_ADDRESS && event.operation === Operation.Type.EXCHANGE_IN;
    }



    async _createOperation(event, status) {
        let operations = await this.paymentStore.getOperationsByTransferId(event.transferId);
        console.log("[TokenTransferredHandler][_createOperation] operations " + JSON.stringify(operations));

        if (operations && operations.length === 1 && operations[0].status === Operation.Status.OPEN) {
            let operation = new Operation(operations[0].transferId, operations[0].type, status, operations[0].user);
            return await this.paymentStore.createOperation(operation);
        }

        return Operation.NULL
    }

    _isThisMPClearingEvent(event) {
        if (event.operation === Operation.Type.CLEARING) {
            if (event.fromAddress === process.env.MARKETPLACE_ADDRESS ||
                event.toAddress === process.env.MARKETPLACE_ADDRESS) {
                return true;
            }
        }
        return false;
    }

    async _handleClearingOperation(event) {
        console.log(`[TokenTransferredHandler][_handleClearingOperation] event: ${JSON.stringify(event)}`)
        let operation;

        if (event.fromAddress !== process.env.MARKETPLACE_ADDRESS && event.toAddress !== process.env.MARKETPLACE_ADDRESS) {
            return Operation.NULL;
        }

        if (event.fromAddress === process.env.MARKETPLACE_ADDRESS) {
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