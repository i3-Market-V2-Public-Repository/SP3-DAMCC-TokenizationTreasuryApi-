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


class Operation {

    constructor(transferId, type, status, user) {
        this.id = "";
        this.transferId = transferId;
        this.type = type;
        this.status = status;
        this.user = user;
        this.date = Date.now();
    }

    setDate(date) {
        this.date = date;
    }

    setId(id) {
        this.id = id;
    }

    setTransferId(transferId) {
        this.transferId = transferId;
    }

    static _clone(origin) {
        return Object.assign({}, origin);
    }
}

Operation.NULL = {};

Operation.Status = {
    OPEN: "open",
    CLOSED: "closed",
}

Operation.Type = {
    EXCHANGE_IN: "exchange_in",
    EXCHANGE_OUT: "exchange_out",
    CLEARING: "clearing",
    FEE_PAYMENT: "fee_payment"
}

Operation.ClearingSubtypes = {
    CLEARING_IN: "clearing_in",
    CLEARING_OUT: "clearing_out",
}

Operation.COMMUNITY = 'Community';

module.exports = Operation;