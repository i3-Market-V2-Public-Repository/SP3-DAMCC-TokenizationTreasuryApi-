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

const {Model, DataTypes} = require("sequelize");


class Operation extends Model {

    /**
     *
     * Other Methods
     */
    static _clone = function (origin) {
        return Object.assign({}, origin);
    }
}

Operation.Status = {
    OPEN: "open",
    CLOSED: "closed"
}

Operation.Type = {
    EXCHANGE_IN: "exchange_in",
    EXCHANGE_OUT: "exchange_out",
    CLEARING_IN: "clearing_in",
    CLEARING_OUT: "clearing_out",
    FEE_PAYMENT: "fee_payment"
}


module.exports = Operation;
