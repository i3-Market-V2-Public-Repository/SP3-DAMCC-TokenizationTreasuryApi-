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

const {strict: assert} = require("assert");
//const {collectSources} = require("truffle/build/672.bundled");
const Operation = require("../entities/operation");
helpers = {}

helpers.assertIsOperationInList = (operation, operationList) => {
    console.log(
        `[HELPER][assertIsOperationInList]: ${JSON.stringify(operationList)}`
    );

    for (let i = 0; i < operationList.length; i++) {
        let o = operationList[i];
        console.log(
            `[HELPER][assertIsOperationInList]: 
            Actual: ${JSON.stringify(operation)}
            Expected: ${JSON.stringify(o)}`
        );
        if (o.id === operation.id) {
            console.log(
                "[HELPER][assertIsOperationInList]: \nActual: " +
                JSON.stringify(operation) + "\nexpected: " + JSON.stringify(o)
            );
            assert.strictEqual(operation.transferId, o.transferId);
            assert.strictEqual(operation.type, o.type);
            assert.strictEqual(operation.status, o.status);
            assert.strictEqual(operation.user, o.user);
            assert.strictEqual(operation.date, o.date);

            return;
        }
    }
    assert.fail("Operation " + operation.id + " NOT found");
}

helpers.assertIsClosed = (operations) => {
    console.log(`[HELPER][assertIsClosed]: ${JSON.stringify(operations)}`);
    assert.strictEqual(operations.length > 1, true);
    assert.strictEqual(operations.some(o => o.status === Operation.Status.CLOSED), true);
    assert.strictEqual(operations.every(o => o.transferId === operations[0].transferId), true);
    assert.strictEqual(operations.every(o => o.userId === operations[0].userId), true);
}


module.exports = helpers;