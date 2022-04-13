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

const TreasuryContract = require('./fakeTreasuryContractService');
const PaymentService = require("../../src/services/paymentService");

const helpers = require("../helpers");
const SequelizePaymentDataStore = require("../../src/dataStores/sequelizePaymentDataStore");
const TokenTransferredHandler = require("../../src/services/enventHandlers/tokenTransferredHandler");
const Operation = require("../../src/entities/operation");
const OperationModel = require("../../src/dataStores/squelizeModels/operation");
const assert = require('assert').strict;


require('dotenv').config();

describe("Payment Service test suit", async () => {

    const USER_ADDRESS = '0x3c23fd1f50cde56530f4edcc173b48d1d65ea05c';
    const USER2_ADDRESS = '0x7a64510da72f8b1d4b11f8d76841d16b039a8c10';
    const MP_ADDRESS = process.env.MARKETPLACE_ADDRESS;


    const paymentService = new PaymentService();
    const treasuryContract = new TreasuryContract();
    await treasuryContract.connect();

    let tokenTransferredHandler;

    const dataStore = new SequelizePaymentDataStore(
        process.env.POSTGRES_DB,
        process.env.POSTGRES_USER,
        process.env.POSTGRES_PASSWORD, {
            host: process.env.POSTGRES_HOST || 'localhost',
            dialect: 'postgres',
            logging: false
        }
    );

    beforeEach(async () => {
            await dataStore.sequelize.sync();
            await OperationModel.truncate();
            treasuryContract.addEventHandler(new TokenTransferredHandler());

            tokenTransferredHandler = new TokenTransferredHandler(dataStore);
            paymentService.setDataStore(dataStore);
            paymentService.setTreasurySmartContractService(treasuryContract);
        }
    );

    it('Given an operation call When there is no operations Then return an empty list', async () => {
        const operations = await paymentService.getOperations();

        assert.strictEqual(
            JSON.stringify(operations),
            JSON.stringify([])
        );
    });


    it('Given an operation call When there is some operation return the full list', async () => {
        const openOperation1 = (await paymentService.exchangeIn(USER_ADDRESS, 1)).operation;
        const openOperation2 = (await paymentService.exchangeIn(USER_ADDRESS, 2)).operation;
        const openOperation3 = (await paymentService.exchangeIn(USER_ADDRESS, 3)).operation;
        const closedOperation = await tokenTransferredHandler.execute(
            {
                transactionHash: 'dummy transaction hash',
                blockHash: 'dummy block hash',
                type: 'mined',
                operation: Operation.Type.EXCHANGE_IN,
                transferId: openOperation2.transferId,
                fromAddress: MP_ADDRESS,
                toAddress: USER_ADDRESS
            }
        );

        const operations = await paymentService.getOperations();

        assert.strictEqual(operations.length, 4);
        helpers.assertIsOperationInList(openOperation1, operations);
        helpers.assertIsOperationInList(openOperation2, operations);
        helpers.assertIsOperationInList(openOperation3, operations);
        helpers.assertIsOperationInList(closedOperation, operations);
    });


    it("Given a transfer id When call getOperationsByTransferId and there is no operation Then return an empty list",
        async () => {
            const operation = await paymentService.getOperationsByTransferId('no existing dummy id')
            assert.strictEqual(
                JSON.stringify(operation),
                JSON.stringify([])
            )
        }
    );


    it("Given a transactionId When call getOperationTransferId Then return the operation list",
        async () => {
            const response = await paymentService.exchangeIn(USER_ADDRESS, 30);
            const operations = await paymentService.getOperationsByTransferId(response.operation.transferId);

            assert.strictEqual(operations.length, 1);
            assert.strictEqual(operations[0].transferId, response.operation.transferId);
            assert.strictEqual(operations[0].type, Operation.Type.EXCHANGE_IN);
            assert.strictEqual(operations[0].status, Operation.Status.OPEN);
            assert.strictEqual(operations[0].user, USER_ADDRESS);
        });


    it("Given a operation type When call getOperationByType Then return the list of operations",
        async () => {
            const openOperation1 = (await paymentService.exchangeIn(USER_ADDRESS, 1)).operation;
            const openOperation2 = (await paymentService.exchangeIn(USER_ADDRESS, 2)).operation;
            const openOperation3 = (await paymentService.exchangeIn(USER_ADDRESS, 3)).operation;
            const closedOperation = await tokenTransferredHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_IN,
                    transferId: openOperation2.transferId,
                    fromAddress: MP_ADDRESS,
                    toAddress: USER_ADDRESS
                }
            );

            const operations = await paymentService.getOperationsByType(Operation.Type.EXCHANGE_IN);

            assert.strictEqual(operations.length, 4);
            helpers.assertIsOperationInList(openOperation1, operations);
            helpers.assertIsOperationInList(openOperation2, operations);
            helpers.assertIsOperationInList(openOperation3, operations);
            helpers.assertIsOperationInList(closedOperation, operations);
        }
    );

    it("Given 3 open operation and 1 closed When call getOperationByStatus with open filter " +
        "Then return the correct list of operations",
        async () => {
            const openOperation1 = (await paymentService.exchangeIn(USER_ADDRESS, 1)).operation;
            const openOperation2 = (await paymentService.exchangeIn(USER_ADDRESS, 2)).operation;
            const openOperation3 = (await paymentService.exchangeIn(USER_ADDRESS, 3)).operation;
            await tokenTransferredHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_IN,
                    transferId: openOperation2.transferId,
                    fromAddress: MP_ADDRESS,
                    toAddress: USER_ADDRESS
                }
            );

            const operations = await paymentService.getOperationsByStatus(Operation.Status.OPEN);

            assert.strictEqual(operations.length, 3);
            helpers.assertIsOperationInList(openOperation1, operations);
            helpers.assertIsOperationInList(openOperation2, operations);
            helpers.assertIsOperationInList(openOperation3, operations);
        }
    );

    it("Given 3 open operation and 1 closed When call getOperationByStatus with close filter " +
        "Then return the correct list of operations",
        async () => {
            await paymentService.exchangeIn(USER_ADDRESS, 1);
            const openOperation = (await paymentService.exchangeIn(USER_ADDRESS, 2)).operation;
            await paymentService.exchangeIn(USER_ADDRESS, 3);
            const closedOperation = await tokenTransferredHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_IN,
                    transferId: openOperation.transferId,
                    fromAddress: MP_ADDRESS,
                    toAddress: USER_ADDRESS
                }
            );

            const operations = await paymentService.getOperationsByStatus(Operation.Status.CLOSED);

            assert.strictEqual(operations.length, 1);
            helpers.assertIsOperationInList(closedOperation, operations);
        }
    );

    it("Given 2 operation to the same user and 1 to other one When call getOperationByUser with first user " +
        "Then return the correct list of operations",
        async () => {
            const response1 = await paymentService.exchangeIn(USER_ADDRESS, 1);
            const response2 = await paymentService.exchangeIn(USER2_ADDRESS, 2);
            const response3 = await paymentService.exchangeIn(USER_ADDRESS, 3);

            const operations = await paymentService.getOperationsByUser(USER_ADDRESS);

            assert.strictEqual(operations.length, 2);
            helpers.assertIsOperationInList(response1.operation, operations);
            helpers.assertIsOperationInList(response3.operation, operations);
        }
    );
});

