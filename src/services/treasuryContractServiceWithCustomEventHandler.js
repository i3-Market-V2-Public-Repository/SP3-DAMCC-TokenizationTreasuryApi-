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
        this.eventHandlers = [];
    }


    addEventHandler(handler) {
        this.eventHandlers.push(handler);
    }


    registerHandlerOnTokenTransferred() {
        try {
            this.contract.events.TokenTransferred({}, (error, event) => {
                if (!event || !event.returnValues) return;

                console.log(
                    "[TreasuryContractServiceWithCustomEventHandler][registerHandlerOnTokenTransferred] Event: \n"
                    + event
                );

                this.eventHandlers.forEach(handler => {
                    handler.execute({
                        transactionHash: event.transactionHash,
                        blockHash: event.blockHash,
                        type: event.type,
                        operation: event.returnValues.operation,
                        transferId: event.returnValues.transferId,
                        sender: event.returnValues._sender,
                    });
                });
            });
        } catch (e) {
            console.log('Cannot subscribe to contract TokenTransferred event')
        }
    }

}

module.exports = TreasuryContractServiceWithCustomEventHandler;