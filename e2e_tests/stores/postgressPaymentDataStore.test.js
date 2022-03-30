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

const SequelizePaymentDataStore = require("../../src/dataStores/sequelizePaymentDataStore");

const OperationModel = require("../../src/dataStores/squelizeModels/operation");
const OperationEntity = require("../../src/entities/operation");
const assert = require('assert').strict
require('debug').enable('*')

describe("Operation DataStore test suit", async () => {

    const OPERATION_ENTITY = new OperationEntity(
        'dummy transfer id',
        OperationEntity.Type.EXCHANGE_IN,
        OperationEntity.Status.OPEN,
        'dummy user'
    );

    const OPERATION_ENTITY2 = new OperationEntity(
        'dummy transfer id2',
        OperationEntity.Type.EXCHANGE_IN,
        OperationEntity.Status.OPEN,
        'dummy user 2'
    );


    const dataStore = new SequelizePaymentDataStore(
        'test_db',
        'test_user',
        'test_pass', {
            host: 'localhost',
            dialect: 'postgres',
            logging: false
        }
    );

    /**
     * Reset DB before start testing
     */
    beforeEach(async () => {
        dataStore.initModel();
        await dataStore.sequelize.sync();
        await OperationModel.truncate();
    })


    it("Given an Operation id When there is no operation Should return null",
        async () => {
            const operation = await dataStore.getOperationsByTransferId("0000");
            assert.deepEqual(operation, []);
        }
    );

    it("Given an Operation id When there is an operation Should return the operation",
        async () => {
            await dataStore.createOperation(OPERATION_ENTITY);

            const operations = await dataStore.getOperationsByTransferId(OPERATION_ENTITY.transferId);

            const operation = operations[0];
            assert.equal(operations.length, 1);
            assert.strictEqual(operation.user, OPERATION_ENTITY.user);
            assert.strictEqual(operation.transferId, OPERATION_ENTITY.transferId);
            assert.strictEqual(operation.status, OPERATION_ENTITY.status);
            assert.strictEqual(operation.type, OPERATION_ENTITY.type);
        }
    );

    it("Given an operation transfer id When there is an operation " +
        "Should be able to insert and retrieve new operation",
        async () => {
            await dataStore.createOperationfromFields(
                OPERATION_ENTITY.transferId,
                OPERATION_ENTITY.user,
                OPERATION_ENTITY.status,
                OPERATION_ENTITY.type
            );

            const operations = await dataStore.getOperationsByTransferId(OPERATION_ENTITY.transferId);

            const operation = operations[0];
            assert.equal(operations.length, 1);
            assert.strictEqual(operation.transferId, OPERATION_ENTITY.transferId);
            assert.strictEqual(operation.user, OPERATION_ENTITY.user);
            assert.strictEqual(operation.status, OPERATION_ENTITY.status);
            assert.strictEqual(operation.type, OPERATION_ENTITY.type);
        }
    );


    it("Given an Operation userid When there is an operation Should return the operation",
        async () => {
            await dataStore.createOperation(OPERATION_ENTITY);

            const operations = await dataStore.getOperationsByUser(OPERATION_ENTITY.user);

            const operation = operations[0];
            assert.equal(operations.length, 1);
            assert.strictEqual(operation.user, OPERATION_ENTITY.user);
            assert.strictEqual(operation.transferId, OPERATION_ENTITY.transferId);
            assert.strictEqual(operation.status, OPERATION_ENTITY.status);
            assert.strictEqual(operation.type, OPERATION_ENTITY.type);
        }
    );


    it("Given an Operation id When call destroy Should be able to delete an existing operation",
        async () => {
            const op1 = await dataStore.createOperation(OPERATION_ENTITY);
            const op2 = await dataStore.createOperation(OPERATION_ENTITY2);

            await dataStore.deleteOperation(op1)
            const operations = await dataStore.getOperations();

            const remain_operation = operations[0]
            assert.strictEqual(operations.length, 1);
            assert.strictEqual(remain_operation.id, op2.id);
            assert.strictEqual(remain_operation.transferId, op2.transferId);
            assert.strictEqual(remain_operation.type, op2.type);
            assert.strictEqual(remain_operation.status, op2.status);
        }
    );
});
