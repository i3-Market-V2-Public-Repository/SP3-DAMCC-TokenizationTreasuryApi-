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

    initSmartContract() {
        super.initSmartContract();
        this.registerHandlerOnFiatMoneyPayment();
    }

    addFiatMoneyPaymentEventHandler(handler) {
        this.fiatMoneyPaymentEventHandlers.push(handler);
    }

    addTokenTransferredEventHandler(handler) {
        this.tokenTransferedEventHandlers.push(handler);
    }



    registerHandlerOnFiatMoneyPayment() {
        console.log(
            `[TreasuryContractServiceWithCustomEventHandler][registerHandlerOnFiatMoneyPayment] Registering FiatMoneyPayment event listener`
        );
        try {
            this.contract.events.FiatMoneyPayment({}, (error, event) => {
                if (!event || !event.returnValues) return;

                this.fiatMoneyPaymentEventHandlers.forEach(handler => {
                    handler.execute({
                        transactionHash: event.transactionHash,
                        blockHash: event.blockHash,
                        type: event.type,
                        transferId: event.returnValues.transferId,
                        operation: event.returnValues.operation,
                        fromAddress: event.returnValues.fromAdd
                    });
                });
            });
        } catch (e) {
            console.log('Cannot subscribe to contract FiatMoneyPayment event')
        }
    }

    registerHandlerOnTokenTransferred() {
        console.log(
            `[TreasuryContractServiceWithCustomEventHandler][registerHandlerOnTokenTransferred] Registering TokenTransferred event listener`
        );
        try {
            this.contract.events.TokenTransferred({}, (error, event) => {
                if (!event || !event.returnValues) return;

                console.log(
                    `[TreasuryContractServiceWithCustomEventHandler][registerHandlerOnTokenTransferred] Event
                    ${JSON.stringify(event)}`
                );

                this.tokenTransferedEventHandlers.forEach(handler => {
                    handler.execute({
                        transactionHash: event.transactionHash,
                        blockHash: event.blockHash,
                        type: event.type,
                        operation: event.returnValues.operation,
                        transferId: event.returnValues.transferId,
                        fromAddress: event.returnValues.fromAdd,
                        toAddress: event.returnValues.toAdd
                    });
                });
            });
        } catch (e) {
            console.log('Cannot subscribe to contract TokenTransferred event')
        }
    }
}

module.exports = TreasuryContractServiceWithCustomEventHandler;