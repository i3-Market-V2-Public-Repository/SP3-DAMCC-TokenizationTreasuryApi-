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

const PaymentService = require('../../services/paymentService');
const DictionaryPaymentDataStorage = require('../../dataStores/dictionaryPaymentDataStorage');
const Operation = require('../../entities/operation');
const TokenTransferredHandler = require("../../services/enventHandlers/tokenTransferredHandler");
const TreasuryContract = require('./fakeTreasuryContractService');

const helpers = require("../helpers");
const { nameSpacedUUID } = require('../../utils/uuid_generator');
const assert = require('assert').strict;


require('dotenv').config();

describe("Payment Service operation Getters test suit", async () => {

    const USER_ADDRESS = '0x3c23fd1f50cde56530f4edcc173b48d1d65ea05c';
    const USER2_ADDRESS = '0x7a64510da72f8b1d4b11f8d76841d16b039a8c10';
    const MP_ADDRESS = process.env.MARKETPLACE_ADDRESS;


    const paymentService = new PaymentService();
    const treasuryContract = new TreasuryContract();
    await treasuryContract.connect();

    let tokenTransferredHandler;

    beforeEach(async () => {
            treasuryContract.addEventHandler(new TokenTransferredHandler());
            let dictionaryPaymentDataStorage = new DictionaryPaymentDataStorage();
            tokenTransferredHandler = new TokenTransferredHandler(dictionaryPaymentDataStorage);
            paymentService.setDataStore(dictionaryPaymentDataStorage);
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
        //const openOperation1 = (await paymentService.exchangeIn(USER_ADDRESS, 1)).operation;
        //const openOperation2 = (await paymentService.exchangeIn(USER_ADDRESS, 2)).operation;
        //const openOperation3 = (await paymentService.exchangeIn(USER_ADDRESS, 3)).operation;
        const transferId2 = nameSpacedUUID();
        const closedOperation = await tokenTransferredHandler.execute(
            {
                transactionHash: 'dummy transaction hash',
                blockHash: 'dummy block hash',
                type: 'mined',
                operation: Operation.Type.EXCHANGE_IN,
                transferId: transferId2,
                fromAddress: MP_ADDRESS,
                toAddress: USER_ADDRESS
            }
        );

        const operations = await paymentService.getOperations();

        assert.strictEqual(operations.length, 1);
        // helpers.assertIsOperationInList(openOperation1, operations);
        // helpers.assertIsOperationInList(openOperation2, operations);
        // helpers.assertIsOperationInList(openOperation3, operations);
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
            const transferId = nameSpacedUUID();
            const response = await tokenTransferredHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_IN,
                    transferId: transferId,
                    fromAddress: MP_ADDRESS,
                    toAddress: USER_ADDRESS
                }
            );
            const operations = await paymentService.getOperationsByTransferId(transferId);

            assert.strictEqual(operations.length, 1);
            assert.strictEqual(operations[0].transferId, transferId);
            assert.strictEqual(operations[0].type, Operation.Type.EXCHANGE_IN);
            assert.strictEqual(operations[0].status, Operation.Status.CLOSED);
            assert.strictEqual(operations[0].user, USER_ADDRESS);
        });


    it("Given a operation type When call getOperationByType Then return the list of operations",
        async () => {
            // const openOperation1 = (await paymentService.exchangeIn(USER_ADDRESS, 1)).operation;
            // const openOperation2 = (await paymentService.exchangeIn(USER_ADDRESS, 2)).operation;
            // const openOperation3 = (await paymentService.exchangeIn(USER_ADDRESS, 3)).operation;
            const transferId = nameSpacedUUID();
            const closedOperation = await tokenTransferredHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_IN,
                    transferId: transferId,
                    fromAddress: MP_ADDRESS,
                    toAddress: USER_ADDRESS
                }
            );

            const operations = await paymentService.getOperationsByType(Operation.Type.EXCHANGE_IN);

            assert.strictEqual(operations.length, 1);
            // helpers.assertIsOperationInList(openOperation1, operations);
            // helpers.assertIsOperationInList(openOperation2, operations);
            // helpers.assertIsOperationInList(openOperation3, operations);
            helpers.assertIsOperationInList(closedOperation, operations);
        }
    );

    it("Given 3 open operation and 1 closed When call getOperationByStatus with open filter " +
        "Then return the correct list of operations",
        async () => {
            // const openOperation1 = (await paymentService.exchangeIn(USER_ADDRESS, 1)).operation;
            // const openOperation2 = (await paymentService.exchangeIn(USER_ADDRESS, 2)).operation;
            // const openOperation3 = (await paymentService.exchangeIn(USER_ADDRESS, 3)).operation;
            const transferId = nameSpacedUUID();
            await tokenTransferredHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_IN,
                    transferId: transferId,
                    fromAddress: MP_ADDRESS,
                    toAddress: USER_ADDRESS
                }
            );

            const operations = await paymentService.getOperationsByStatus(Operation.Status.OPEN);

            assert.strictEqual(operations.length, 0);
            // helpers.assertIsOperationInList(openOperation1, operations);
            // helpers.assertIsOperationInList(openOperation2, operations);
            // helpers.assertIsOperationInList(openOperation3, operations);
        }
    );

    it("Given 3 open operation and 1 closed When call getOperationByStatus with close filter " +
        "Then return the correct list of operations",
        async () => {
            await paymentService.exchangeIn(USER_ADDRESS, 1);
            //const openOperation = (await paymentService.exchangeIn(USER_ADDRESS, 2)).operation;
            await paymentService.exchangeIn(USER_ADDRESS, 3);
            const closedOperation = await tokenTransferredHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_IN,
                    transferId: nameSpacedUUID(),
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
            const transferId1 = nameSpacedUUID();
            const transferId2 = nameSpacedUUID();
            const transferId3 = nameSpacedUUID();
            const response1 = await tokenTransferredHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_IN,
                    transferId: transferId1,
                    fromAddress: MP_ADDRESS,
                    toAddress: USER_ADDRESS
                }
            );
            const response2 = await tokenTransferredHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_IN,
                    transferId: transferId2,
                    fromAddress: MP_ADDRESS,
                    toAddress: USER2_ADDRESS
                }
            );
            const response3 = await tokenTransferredHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_IN,
                    transferId: transferId3,
                    fromAddress: MP_ADDRESS,
                    toAddress: USER_ADDRESS
                }
            );

            const operations = await paymentService.getOperationsByUser(USER_ADDRESS);

            assert.strictEqual(operations.length, 2);
            assert.strictEqual(transferId1, operations[0].transferId);
            assert.strictEqual(transferId3, operations[1].transferId);
        }
    );
});

