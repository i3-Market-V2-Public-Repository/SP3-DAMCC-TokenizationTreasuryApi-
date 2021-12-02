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

const {v1: uuidv1, v4: uuidv4, v5: uuidv5} = require('uuid');
const namespace = uuidv4();

function timestampUUID() {
    return uuidv1();
}

function randomUUID() {
    return uuidv4();
}

function nameSpacedUUID() {
    return uuidv5(uuidv4(), namespace)
}


module.exports = {
    timestampUUID,
    randomUUID,
    nameSpacedUUID
}