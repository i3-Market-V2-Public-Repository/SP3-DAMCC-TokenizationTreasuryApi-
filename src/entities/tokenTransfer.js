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

const {nameSpacedUUID} = require("../utils/uuid_generator");

class TokenTransfer {
    constructor(from, to, token) {
        console.log(`[TokenTransfer] constructor: ${from} ${to} ${token}`);
        this.transferId = nameSpacedUUID();
        this.fromAddress = from;
        this.toAddress = to;
        this.tokenAmount = token;
        this.isPaid = false;
        this.transferCode = ''
    }
}

module.exports = TokenTransfer