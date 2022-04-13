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
const FiatMoneyPaymentHandler = require("../../services/enventHandlers/fiatMoneyPaymentHandler");
const assert = require('assert').strict;


require('dotenv').config();

describe("Payment Service ExchangeOut test suit", async () => {

    const SENDER_ADDRESS = '0x3c23fd1f50cde56530f4edcc173b48d1d65ea05c';
    const USER2_ADDRESS = '0x7a64510da72f8b1d4b11f8d76841d16b039a8c10';
    const MP_ADDRESS = process.env.MARKETPLACE_ADDRESS;


    const paymentService = new PaymentService();
    const treasuryContract = new TreasuryContract();
    await treasuryContract.connect();

    let tokenTransferredHandler;
    let fiatMoneyPaymentHandler;

    beforeEach(async () => {
            treasuryContract.addEventHandler(new TokenTransferredHandler());
            let dictionaryPaymentDataStorage = new DictionaryPaymentDataStorage();
            tokenTransferredHandler = new TokenTransferredHandler(dictionaryPaymentDataStorage);
            fiatMoneyPaymentHandler = new FiatMoneyPaymentHandler(dictionaryPaymentDataStorage);

            paymentService.setDataStore(dictionaryPaymentDataStorage);
            paymentService.setTreasurySmartContractService(treasuryContract);
        }
    );


    it("Given a data provider When call ExchangeOut then save then return the operation", async () => {
        const operation = (await paymentService.exchangeOut(SENDER_ADDRESS, MP_ADDRESS)).operation;

        assert.notStrictEqual(operation.transferId, "");
        assert.strictEqual(operation.type, Operation.Type.EXCHANGE_OUT);
        assert.strictEqual(operation.status, Operation.Status.OPEN);
        assert.strictEqual(operation.user, SENDER_ADDRESS);
    });

    it("Given an exchangeOut event When the event is captured Then update the operation status to in_progress",
        async () => {
            const openOperation = (await paymentService.exchangeOut(SENDER_ADDRESS)).operation;
            const inProgressOperation = await tokenTransferredHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_OUT,
                    transferId: openOperation.transferId,
                    fromAddress: MP_ADDRESS,
                    toAddress: SENDER_ADDRESS
                }
            );

            const operations = await paymentService.getOperationsByTransferId(openOperation.transferId);

            assert.strictEqual(operations.length, 2);
            assert.strictEqual(inProgressOperation.status, Operation.Status.IN_PROGRESS);
            helpers.assertIsOperationInList(inProgressOperation, operations);
        }
    );

    it("Given a FiatMoneyPayment event " +
        "When message sender is the MP and the exchange_out operation is in progress " +
        "Then update the operation status to closed",
        async () => {
            const openOperation = (await paymentService.exchangeOut(SENDER_ADDRESS)).operation;
            await tokenTransferredHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_OUT,
                    transferId: openOperation.transferId,
                    fromAddress: MP_ADDRESS,
                    toAddress: SENDER_ADDRESS
                }
            );
            await fiatMoneyPaymentHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_OUT,
                    transferId: openOperation.transferId,
                    fromAddress: MP_ADDRESS
                }
            );

            const closedOperation = (await paymentService.getOperationsByStatus(Operation.Status.CLOSED))[0];

            assert.notStrictEqual(closedOperation.transferId, "");
            assert.strictEqual(closedOperation.type, Operation.Type.EXCHANGE_OUT);
            assert.strictEqual(closedOperation.status, Operation.Status.CLOSED);
            assert.strictEqual(closedOperation.user, SENDER_ADDRESS);
        });


});