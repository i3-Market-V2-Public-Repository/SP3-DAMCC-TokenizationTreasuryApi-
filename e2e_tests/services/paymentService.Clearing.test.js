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
const FiatMoneyPaymentHandler = require("../../src/services/enventHandlers/fiatMoneyPaymentHandler");
const Network = require("../../test_networks/ganacheNetwork");
const assert = require('assert').strict;

require('dotenv').config();

describe("Payment Service test suit", async () => {

    process.env.MARKETPLACE_ADDRESS = process.env.MARKETPLACE_ADDRESS || Network.MP_ADDRESS

    const MP1_ADDRESS = process.env.MARKETPLACE_ADDRESS
    const MP2_ADDRESS = '0x2253fd1f50cde56530f4edbc173b48d1d65ea222';
    const MP3_ADDRESS = '0x2253fd1f50cde56530f4edbc173b48d1d65ea333';

    const paymentService = new PaymentService();
    const treasuryContract = new TreasuryContract();
    await treasuryContract.connect();

    let fiatPaymentEventHandler, tokenTransferredEventHandler;

    const dataStore =new SequelizePaymentDataStore(
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

            tokenTransferredEventHandler = new TokenTransferredHandler(dataStore);
            fiatPaymentEventHandler = new FiatMoneyPaymentHandler(dataStore);

            paymentService.setDataStore(dataStore);
            paymentService.setTreasurySmartContractService(treasuryContract);
        }
    );

    it('Given a MP balances When call _generateTokenTransfers Then return the TokenTransferList', async () => {
        treasuryContract.setDummyMPIndex(MP1_ADDRESS, 0);
        treasuryContract.setDummyMPIndex(MP2_ADDRESS, 1);
        treasuryContract.setDummyMPIndex(MP3_ADDRESS, 2);
        treasuryContract.setDummyBalances(MP1_ADDRESS, {"balance": ["15", "0", "2"]});

        const balances = treasuryContract.getBalanceForAddress(MP1_ADDRESS);
        const tokenTransfers = await paymentService._generateClearingOperations(balances.balance);

        assert.strictEqual(tokenTransfers.length, 1);
        assert.notStrictEqual(tokenTransfers[0].transferId, "");
        assert.strictEqual(tokenTransfers[0].fromAddress, MP1_ADDRESS);
        assert.strictEqual(tokenTransfers[0].toAddress, MP3_ADDRESS);
        assert.strictEqual(tokenTransfers[0].tokenAmount, '2');
        assert.strictEqual(tokenTransfers[0].isPaid, false);
        assert.strictEqual(tokenTransfers[0].transferCode, "");
    });

    it('Given MP When call clearing Then call clearing in treasuryService with the proper tokenTransfer',
        async () => {
            treasuryContract.setDummyMPIndex(MP1_ADDRESS, 0);
            treasuryContract.setDummyMPIndex(MP2_ADDRESS, 1);
            treasuryContract.setDummyMPIndex(MP3_ADDRESS, 2);
            treasuryContract.setDummyBalances(MP1_ADDRESS, {"balance": ["15", "0", "2"]});

            await paymentService.clearing();

            assert.strictEqual(paymentService.treasurySmartContract.clearingArgs.senderAddress, MP1_ADDRESS);
            assert.strictEqual(paymentService.treasurySmartContract.clearingArgs.tokenTransfers.length, 1);

            const tokenTransfer = paymentService.treasurySmartContract.clearingArgs.tokenTransfers[0];
            assert.strictEqual(tokenTransfer.fromAddress, MP1_ADDRESS);
            assert.strictEqual(tokenTransfer.toAddress, MP3_ADDRESS);
            assert.strictEqual(tokenTransfer.tokenAmount, '2');
            assert.strictEqual(tokenTransfer.isPaid, false);
            assert.strictEqual(tokenTransfer.transferCode, "");
        }
    );

    it('Given a clearing event When the MP is the clearing executor add the clearing_in operation open to the database',
        async () => {
            await tokenTransferredEventHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.CLEARING,
                    transferId: "0",
                    fromAddress: MP1_ADDRESS,
                    toAddress: MP2_ADDRESS
                }
            );

            const operations = await paymentService.getOperationsByType(Operation.ClearingSubtypes.CLEARING_IN);

            assert.strictEqual(operations.length, 1);

            const operation = operations[0];
            assert.strictEqual(operation.transferId, "0");
            assert.strictEqual(operation.type, Operation.ClearingSubtypes.CLEARING_IN);
            assert.strictEqual(operation.status, Operation.Status.OPEN);
            assert.strictEqual(operation.user, MP2_ADDRESS);
        }
    );

    it('Given a clearing event When the MP is the clearing executor add the clearing_out operation open to the database',
        async () => {
            await tokenTransferredEventHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.CLEARING,
                    transferId: "0",
                    fromAddress: MP2_ADDRESS,
                    toAddress: MP1_ADDRESS
                }
            );

            const operations = await paymentService.getOperationsByType(Operation.ClearingSubtypes.CLEARING_OUT);

            assert.strictEqual(operations.length, 1);
            const operation = operations[0];
            assert.strictEqual(operation.transferId, "0");
            assert.strictEqual(operation.type, Operation.ClearingSubtypes.CLEARING_OUT);
            assert.strictEqual(operation.status, Operation.Status.OPEN);
            assert.strictEqual(operation.user, MP2_ADDRESS);
        }
    );


    it('Given a FiatMoneyPayment event When the MP is the clearing_in executor add the clearing_in closed operation to the database',
        async () => {
            await tokenTransferredEventHandler.execute(
                {
                    transactionHash: 'dummy transaction hash 0',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.CLEARING,
                    transferId: "0",
                    fromAddress: MP1_ADDRESS,
                    toAddress: MP2_ADDRESS
                }
            );
            await fiatPaymentEventHandler.execute(
                {
                    transactionHash: 'dummy transaction hash 0',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.CLEARING,
                    transferId: "0",
                    fromAddress: MP2_ADDRESS,
                }
            );

            const operations = await paymentService.getOperationsByType(Operation.ClearingSubtypes.CLEARING_IN);
            const closedOperation = (await paymentService.getOperationsByStatus(Operation.Status.CLOSED))[0];

            assert.strictEqual(operations.length, 2);
            assert.strictEqual(closedOperation.transferId, "0");
            assert.strictEqual(closedOperation.status, Operation.Status.CLOSED);
            assert.strictEqual(closedOperation.type, Operation.ClearingSubtypes.CLEARING_IN);
            assert.strictEqual(closedOperation.user, MP2_ADDRESS);
        }
    );

    it('Given a FiatMoneyPayment event When the MP is the clearing_out executor add the clearing_out closed operation to the database',
        async () => {
            await tokenTransferredEventHandler.execute(
                {
                    transactionHash: 'dummy transaction hash 0',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.CLEARING,
                    transferId: "0",
                    fromAddress: MP2_ADDRESS,
                    toAddress: MP1_ADDRESS
                }
            );
            await fiatPaymentEventHandler.execute(
                {
                    transactionHash: 'dummy transaction hash 0',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.CLEARING,
                    transferId: "0",
                    fromAddress: MP1_ADDRESS,
                }
            );

            const operations = await paymentService.getOperationsByType(Operation.ClearingSubtypes.CLEARING_OUT);
            const closedOperation = (await paymentService.getOperationsByStatus(Operation.Status.CLOSED))[0];

            assert.strictEqual(operations.length, 2);
            assert.strictEqual(closedOperation.transferId, "0");
            assert.strictEqual(closedOperation.status, Operation.Status.CLOSED);
            assert.strictEqual(closedOperation.type, Operation.ClearingSubtypes.CLEARING_OUT);
            assert.strictEqual(closedOperation.user, MP2_ADDRESS);
        }
    );


});

