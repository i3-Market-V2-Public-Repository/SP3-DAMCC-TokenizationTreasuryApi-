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


const TreasuryContractService = require("./treasuryContractService");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

let instance = null;

class TreasuryContractServiceWithCustomEventHandler extends TreasuryContractService {

    static getInstance() {
        if (instance === null) {
            instance = new TreasuryContractServiceWithCustomEventHandler();
        }
        return instance;
    }

    constructor() {
        super();
        this.tokenTransferedEventHandlers = [];
        this.fiatMoneyPaymentEventHandlers = [];
    }

    addFiatMoneyPaymentEventHandler(handler) {
        this.fiatMoneyPaymentEventHandlers.push(handler);
    }

    addTokenTransferredEventHandler(handler) {
        this.tokenTransferedEventHandlers.push(handler);
    }

    registerHandlerOnFiatMoneyPayment() {
        try {
            this.contract.events.FiatMoneyPayment({}, (error, event) => {
                if (!event || !event.returnValues) return;

                console.log(
                    `[TreasuryContractServiceWithCustomEventHandler][registerHandlerOnTokenTransferred] Event\n${event}`
                );

                const payload = {
                    transactionHash: event.transactionHash,
                    blockHash: event.blockHash,
                    type: event.type,
                    transferId: event.returnValues.transferId,
                    operation: event.returnValues.operation,
                    fromAddress: event.returnValues.fromAddress
                }

                axios.post(process.env.WEBHOOK, {payload}).then(response => {
                    console.log('sent webhook successfully');
                }).catch(error => {
                    console.error("Webhook got an error. ", error);
                });
            });
        } catch (e) {
            console.log('Cannot subscribe to contract TokenTransferred event')
        }
    }

    registerHandlerOnTokenTransferred() {
        try {
            this.contract.events.TokenTransferred({}, (error, event) => {

                if (!event || !event.returnValues) return;

                console.log(
                    `[TreasuryContractServiceWithCustomEventHandler][registerHandlerOnTokenTransferred] Event\n${event}`
                );

                this.tokenTransferedEventHandlers.forEach(handler => {
                    handler.execute({
                        transactionHash: event.transactionHash,
                        blockHash: event.blockHash,
                        type: event.type,
                        operation: event.returnValues.operation,
                        transferId: event.returnValues.transferId,
                        fromAddress: event.returnValues.fromAddress,
                        toAddress: event.toAddress
                    });
                });
            });
        } catch (e) {
            console.log('Cannot subscribe to contract TokenTransferred event')
        }
    }

}

module.exports = TreasuryContractServiceWithCustomEventHandler;