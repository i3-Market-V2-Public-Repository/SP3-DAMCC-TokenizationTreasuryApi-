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
const axios = require("axios");

class WebhookHandler extends EventHandler {

    constructor() {
        super();
    }

    async execute(event) {
        console.log("[WebhookHandler][execute] Event: " + JSON.stringify(event));

        axios.post(process.env.WEBHOOK, {
            transactionHash: event.transactionHash,
            blockHash: event.blockHash,
            type: event.type,
            transferId: event.returnValues.transferId,
            operation: event.returnValues.operation,
            fromAddress: event.returnValues.fromAddress,
            toAddress: event.returnValues.toAddress || ""
        }).then(response => {
            console.log('sent webhook successfully');
        }).catch(error => {
            console.error("Webhook got an error. ", error);
        });
    }
}

module.exports = WebhookHandler;