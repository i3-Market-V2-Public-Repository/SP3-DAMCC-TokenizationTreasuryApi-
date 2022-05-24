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
const TokenTransferredHandler = require("../../services/enventHandlers/tokenTransferredHandler");
const FiatMoneyPaymentHandler = require("../../services/enventHandlers/fiatMoneyPaymentHandler");
const TreasuryContract = require('./fakeTreasuryContractService');
const Network = require("../../currentNetworkConfig");


const assert = require('assert').strict;
const Operation = require("../../entities/operation");

require('dotenv').config();

describe("Payment Service Clearing test suit", async () => {

    process.env.MARKETPLACE_ADDRESS = process.env.MARKETPLACE_ADDRESS || Network.MP_ADDRESS

    const MP1_ADDRESS = process.env.MARKETPLACE_ADDRESS
    const MP2_ADDRESS = '0x2253fd1f50cde56530f4edbc173b48d1d65ea222';
    const MP3_ADDRESS = '0x2253fd1f50cde56530f4edbc173b48d1d65ea333';

    const paymentService = new PaymentService();
    const treasuryContract = new TreasuryContract();
    await treasuryContract.connect();

    let fiatPaymentEventHandler, tokenTransferredEventHandler;

    beforeEach(async () => {
            let dictionaryPaymentDataStorage = new DictionaryPaymentDataStorage();
            tokenTransferredEventHandler = new TokenTransferredHandler(dictionaryPaymentDataStorage);
            fiatPaymentEventHandler = new FiatMoneyPaymentHandler(dictionaryPaymentDataStorage);

            paymentService.setDataStore(dictionaryPaymentDataStorage);
            paymentService.setTreasurySmartContractService(treasuryContract);
        }
    );

    it('Given a MP balances When call _generateTokenTransfers Then return the TokenTransferList', async () => {
        treasuryContract.setDummyMPIndex(MP1_ADDRESS, 0);
        treasuryContract.setDummyMPIndex(MP2_ADDRESS, 1);
        treasuryContract.setDummyMPIndex(MP3_ADDRESS, 2);
        treasuryContract.setDummyBalances(MP1_ADDRESS, {"balance": ["15", "0", "2"]});

        const balances = treasuryContract.getBalanceForAddress(MP1_ADDRESS);
        const clearingOperations = await paymentService._generateClearingOperations(balances.balance);

        assert.strictEqual(clearingOperations.length, 1);
        assert.notStrictEqual(clearingOperations[0].transferId, "");
        assert.strictEqual(clearingOperations[0].toAdd, MP3_ADDRESS);
        assert.strictEqual(clearingOperations[0].tokenAmount, '2');
    });

    it('Given MP When call clearing Then call clearing in treasuryService with the proper tokenTransfer',
        async () => {
            treasuryContract.setDummyMPIndex(MP1_ADDRESS, 0);
            treasuryContract.setDummyMPIndex(MP2_ADDRESS, 1);
            treasuryContract.setDummyMPIndex(MP3_ADDRESS, 2);
            treasuryContract.setDummyBalances(MP1_ADDRESS, {"balance": ["15", "0", "2"]});

            await paymentService.clearing();

            assert.strictEqual(paymentService.treasurySmartContract.clearingArgs.senderAddress, MP1_ADDRESS);
            assert.strictEqual(paymentService.treasurySmartContract.clearingArgs.clearingOperations.length, 1);

            const tokenTransfer = paymentService.treasurySmartContract.clearingArgs.clearingOperations[0];
            assert.strictEqual(tokenTransfer.toAdd, MP3_ADDRESS);
            assert.strictEqual(tokenTransfer.tokenAmount, '2');
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
