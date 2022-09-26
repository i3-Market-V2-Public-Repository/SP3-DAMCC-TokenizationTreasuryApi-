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
const TreasuryContract = require('./fakeTreasuryContractService');
const TokenTransferredHandler = require('../../services/enventHandlers/tokenTransferredHandler');
const DictionaryPaymentDataStorage = require('../../dataStores/dictionaryPaymentDataStorage');
const {strict: assert} = require('assert');
const Operation = require('../../entities/operation');
const Network = require("../../../test_networks/ganacheNetwork");
const helpers = require("../helpers");

require('dotenv').config();

describe(`Payment Service FeePayment test suit`, async () => {

    process.env.COMMUNITY_ADDRESS = process.env.COMMUNITY_ADDRESS || Network.COMMUNITY_ADDRESS;

    const USER_ADDRESS = '0x3c23fd1f50cde56530f4edcc173b48d1d65ea05c';
    const DATA_PROVIDER_MP_ADDRESS = '0x7a64510da72f8b1d4b11f8d76841d16b039a8c13';

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

    it(`Given a MP When call feePayment then returns the stored operations`, async () => {
        const operations = (
            await paymentService.feePayment(USER_ADDRESS, DATA_PROVIDER_MP_ADDRESS, 20)
        ).operations;

        const communityWallet = await treasuryContract.getCommunityWallet();
        assert.strictEqual(operations.length, 2);
        assert.strictEqual(operations.every(o => o.transferId !== ''), true);
        assert.strictEqual(operations.every(o => o.type === Operation.Type.FEE_PAYMENT), true);
        assert.strictEqual(operations.every(o => o.status === Operation.Status.UNSIGNED), true);
        assert.strictEqual(operations.some(o => o.user === communityWallet), true);
        assert.strictEqual(operations.some(o => o.user === DATA_PROVIDER_MP_ADDRESS), true);
    });

    it(`Given the Token transferred event When the tokens transferred handler capture the event Then add the 
    operations to the database`, async () => {
        const operations = (
            await paymentService.feePayment(USER_ADDRESS, DATA_PROVIDER_MP_ADDRESS, 20)
        ).operations;

        await tokenTransferredHandler.execute(
            {
                transactionHash: 'dummy transaction hash',
                blockHash: 'dummy block hash',
                type: 'mined',
                operation: Operation.Type.FEE_PAYMENT,
                transferId: operations[0].transferId,
                fromAddress: USER_ADDRESS,
                toAddress: DATA_PROVIDER_MP_ADDRESS
            }
        )
        await tokenTransferredHandler.execute(
            {
                transactionHash: 'dummy transaction hash 2',
                blockHash: 'dummy block hash 2',
                type: 'mined',
                operation: Operation.Type.FEE_PAYMENT,
                transferId: operations[1].transferId,
                fromAddress: USER_ADDRESS,
                toAddress: process.env.COMMUNITY_ADDRESS
            }
        )
        helpers.assertIsClosed(await paymentService.getOperationsByTransferId(operations[0].transferId));
        helpers.assertIsClosed(await paymentService.getOperationsByTransferId(operations[1].transferId));
    });

});