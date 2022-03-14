const PaymentService = require('../../services/paymentService');
const DictionaryPaymentDataStorage = require('../../dataStores/dictionaryPaymentDataStorage')
const Operation = require('../../entities/operation')
const PaymentServiceEventHandler = require("../../services/enventHandlers/paymentServiceEventHandler");
const TreasuryContract = require('./fakeTreasuryContractService');
const PaymentEventHandler = require("../../services/enventHandlers/paymentServiceEventHandler");

const helpers = require("../helpers");
const assert = require('assert').strict


require('dotenv').config()

describe("Payment Service test suit", async () => {

    const USER_ADDRESS = '0x3c23fd1f50cde56530f4edcc173b48d1d65ea05c'
    const USER2_ADDRESS = '0x7a64510da72f8b1d4b11f8d76841d16b039a8c10'

    const paymentService = PaymentService.getInstance();
    const treasuryContract = TreasuryContract.getInstance();

    await treasuryContract.connect();

    beforeEach(async () => {
            treasuryContract.addEventHandler(new PaymentEventHandler);

            let dictionaryPaymentDataStorage = new DictionaryPaymentDataStorage();
            this.paymentServiceEventHandler = new PaymentServiceEventHandler(dictionaryPaymentDataStorage);
            paymentService.setDataStore(dictionaryPaymentDataStorage);
            paymentService.setTreasurySmartContractService(treasuryContract);
        }
    );

    it("Given a transfer id When there is no operation Then return an empty list",
        async () => {
            const operation = await paymentService.getOperationByTransferId('no existing dummy id')
            assert.strictEqual(
                JSON.stringify(operation),
                JSON.stringify([])
            )
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

    it("Given a transactionId When call getOperationTransferId Then return the operation list",
        async () => {
            const response = await paymentService.exchangeIn(USER_ADDRESS, 30);
            const operations = await paymentService.getOperationByTransferId(response.operation.transferId);

            assert.strictEqual(operations.length, 1);
            assert.strictEqual(operations[0].transferId, response.operation.transferId);
            assert.strictEqual(operations[0].type, Operation.Type.EXCHANGE_IN);
            assert.strictEqual(operations[0].status, Operation.Status.OPEN);
            assert.strictEqual(operations[0].user, USER_ADDRESS);
        });


    it("Given an exchangeIn event When the event is captured Then Return two operations with different status",
        async () => {
            const openOperation = (await paymentService.exchangeIn(USER_ADDRESS, 30)).operation;
            const closedOperation = await this.paymentServiceEventHandler.execute({
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: 'exchange_in',
                    transferId: openOperation.transferId,
                    sender: process.env.MARKETPLACE_ADDRESS,
                }
            )

            const operations = await paymentService.getOperationByTransferId(openOperation.transferId);

            assert.strictEqual(operations.length, 2);
            helpers.assertIsOperationInList(openOperation, operations);
            helpers.assertIsOperationInList(closedOperation, operations);
        }
    );

    it("Given a operation type When call getOperationByType Then return the list of operations",
        async () => {
            const openOperation1 = (await paymentService.exchangeIn(USER_ADDRESS, 1)).operation;
            const openOperation2 = (await paymentService.exchangeIn(USER_ADDRESS, 2)).operation;
            const openOperation3 = (await paymentService.exchangeIn(USER_ADDRESS, 3)).operation;
            const closedOperation = await this.paymentServiceEventHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: 'exchange_in',
                    transferId: openOperation2.transferId,
                    sender: process.env.MARKETPLACE_ADDRESS,
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

    it("Given 3 open operation and 1 closed When call getOperationByStatus with open filter Then return the correct list of operations",
        async () => {
            const openOperation1 = (await paymentService.exchangeIn(USER_ADDRESS, 1)).operation;
            const openOperation2 = (await paymentService.exchangeIn(USER_ADDRESS, 2)).operation;
            const openOperation3 = (await paymentService.exchangeIn(USER_ADDRESS, 3)).operation;
            await this.paymentServiceEventHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: 'exchange_in',
                    transferId: openOperation2.transferId,
                    sender: process.env.MARKETPLACE_ADDRESS,
                }
            );

            const operations = await paymentService.getOperationsByStatus(Operation.Status.OPEN);

            assert.strictEqual(operations.length, 3);
            helpers.assertIsOperationInList(openOperation1, operations);
            helpers.assertIsOperationInList(openOperation2, operations);
            helpers.assertIsOperationInList(openOperation3, operations);
        }
    );

    it("Given 3 open operation and 1 closed When call getOperationByStatus  with close filter Then return the correct list of operations",
        async () => {
            await paymentService.exchangeIn(USER_ADDRESS, 1);
            const openOperation = (await paymentService.exchangeIn(USER_ADDRESS, 2)).operation;
            await paymentService.exchangeIn(USER_ADDRESS, 3);
            const closedOperation = await this.paymentServiceEventHandler.execute(
                {
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: 'exchange_in',
                    transferId: openOperation.transferId,
                    sender: process.env.MARKETPLACE_ADDRESS,
                }
            );

            const operations = await paymentService.getOperationsByStatus(Operation.Status.CLOSED);

            assert.strictEqual(operations.length, 1);
            helpers.assertIsOperationInList(closedOperation, operations);
        }
    );

    it("Given 2 operation to the same user and 1 to other one When call getOperationByUser with first user Then return the correct list of operations",
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
            const inProgressOperation = await this.paymentServiceEventHandler.execute({
                    transactionHash: 'dummy transaction hash',
                    blockHash: 'dummy block hash',
                    type: 'mined',
                    operation: Operation.Type.EXCHANGE_OUT,
                    transferId: openOperation.transferId,
                    sender: USER_ADDRESS,
                }
            )

            const operations = await paymentService.getOperationByTransferId(openOperation.transferId);

            assert.strictEqual(operations.length, 2);
            assert.strictEqual(inProgressOperation.status, Operation.Status.IN_PROGRESS);
            helpers.assertIsOperationInList(inProgressOperation, operations);
        }
    );


});

