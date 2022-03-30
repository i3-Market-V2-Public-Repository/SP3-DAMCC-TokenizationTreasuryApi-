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

            const operations = await paymentService.getOperationsByTransferId(openOperation.transferId);

            assert.strictEqual(operations.length, 2);
            assert.strictEqual(inProgressOperation.status, Operation.Status.IN_PROGRESS);
            helpers.assertIsOperationInList(inProgressOperation, operations);
        }
    );


});