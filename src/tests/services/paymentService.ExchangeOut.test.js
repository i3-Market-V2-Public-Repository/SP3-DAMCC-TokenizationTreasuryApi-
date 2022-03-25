const PaymentService = require('../../services/paymentService');
const DictionaryPaymentDataStorage = require('../../dataStores/dictionaryPaymentDataStorage');
const Operation = require('../../entities/operation');
const TokenTransferredHandler = require("../../services/enventHandlers/tokenTransferredHandler");
const TreasuryContract = require('./fakeTreasuryContractService');

const helpers = require("../helpers");
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

    beforeEach(async () => {
            treasuryContract.addEventHandler(new TokenTransferredHandler());
            let dictionaryPaymentDataStorage = new DictionaryPaymentDataStorage();
            tokenTransferredHandler = new TokenTransferredHandler(dictionaryPaymentDataStorage);
            paymentService.setDataStore(dictionaryPaymentDataStorage);
            paymentService.setTreasurySmartContractService(treasuryContract);
        }
    );


    it("Given a data provider When call ExchangeOut then save then return the operation", async () => {
        const operation = (await paymentService.exchangeOut(USER_ADDRESS)).operation;

        assert.notStrictEqual(operation.transferId, "");
        assert.strictEqual(operation.type, Operation.Type.EXCHANGE_OUT);
        assert.strictEqual(operation.status, Operation.Status.OPEN);
        assert.strictEqual(operation.user, USER_ADDRESS);
    });

    it("Given an exchangeOut event When the event is captured Then update the operation status to in_progress",
        async () => {
            const openOperation = (await paymentService.exchangeOut(USER_ADDRESS)).operation;
            const inProgressOperation = await tokenTransferredHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_OUT,
                    transferId: openOperation.transferId,
                    fromAddress: MP_ADDRESS,
                    toAddress: USER_ADDRESS
                }
            )

            const operations = await paymentService.getOperationByTransferId(openOperation.transferId);

            assert.strictEqual(operations.length, 2);
            assert.strictEqual(inProgressOperation.status, Operation.Status.IN_PROGRESS);
            helpers.assertIsOperationInList(inProgressOperation, operations);
        }
    );


});