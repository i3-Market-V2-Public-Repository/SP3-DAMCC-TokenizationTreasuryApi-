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
    const MP_ADDRESS = process.env.MARKETPLACE_ADDRESS;
    const MP2_ADDRESS = '0x2253fd1f50cde56530f4edbc173b48d1d65eaccc';

    const paymentService = new PaymentService();
    const treasuryContract = new TreasuryContract();
    await treasuryContract.connect();

    let tokenTransferredHandler;

    const dataStore = new SequelizePaymentDataStore(
        'test_db',
        'test_user',
        'test_pass', {
            host: 'localhost',
            dialect: 'postgres',
            logging: false
        }
    );

    beforeEach(async () => {
            dataStore.initModel();
            await dataStore.sequelize.sync();
            await OperationModel.truncate();

            treasuryContract.addEventHandler(new TokenTransferredHandler());
            tokenTransferredHandler = new TokenTransferredHandler(dataStore);
            paymentService.setDataStore(dataStore);
            paymentService.setTreasurySmartContractService(treasuryContract);
        }
    );

    it("Given a user address and an amount When the MP call exchangeIn Then return the operation",
        async () => {
            const response = await paymentService.exchangeIn(USER_ADDRESS, 30);

            assert.strictEqual(response.operation.type, Operation.Type.EXCHANGE_IN);
            assert.strictEqual(response.operation.status, Operation.Status.OPEN);
            assert.strictEqual(response.operation.user, USER_ADDRESS);
            assert.strictEqual(response.operation.transferId, response.transferId);
        }
    );

    it("Given an exchangeIn event When the event is captured Then Return two operations with different status",
        async () => {
            const openOperation = (await paymentService.exchangeIn(USER_ADDRESS, 30)).operation;
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
            )

            const operations = await paymentService.getOperationsByTransferId(openOperation.transferId);

            assert.strictEqual(operations.length, 2);
            helpers.assertIsOperationInList(openOperation, operations);
            helpers.assertIsOperationInList(closedOperation, operations);
        }
    );

    it("Given an exchangeIn event with a different MP in the sender When a exchange in event is captured " +
        "Then Do NOT create the new operation",
        async () => {
            const openOperation = (await paymentService.exchangeIn(USER_ADDRESS, 30)).operation;
            const closedOperation = await tokenTransferredHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_IN,
                    transferId: openOperation.transferId,
                    fromAddress: MP2_ADDRESS,
                    toAddress: USER_ADDRESS
                }
            )

            const operations = await paymentService.getOperationsByTransferId(openOperation.transferId);

            assert.strictEqual(operations.length, 1);
            helpers.assertIsOperationInList(openOperation, operations);
        }
    );

});

