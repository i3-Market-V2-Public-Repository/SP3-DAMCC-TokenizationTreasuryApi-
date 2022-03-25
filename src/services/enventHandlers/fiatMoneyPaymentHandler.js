const EventHandler = require("./eventHandler");
const Operation = require("../../entities/operation");

class FiatMoneyPaymentHandler extends EventHandler {

    constructor(paymentDataStore) {
        super();
        this.paymentStore = paymentDataStore;
    }


    // emit FiatMoneyPayment(transferId, operation, fromAddress); // _transferId, "set_paid", msg.sender
    async execute(event) {
        console.log("[FiatMoneyPaymentHandler][execute] Event: " + JSON.stringify(event));

        // Cant check if I am the sender or receiver to avoid access to the DB
        return await this._handleSetPaid(event);
    }


    async _handleSetPaid(event) {
        const operations = await this.paymentStore.getOperationByTransferId(event.transferId);

        if (this._hasAnOpenClearingOperation(operations)) {
            return await this.getClosedClearingOperation(operations[0], event);
        }

        return Operation.NULL;
    }

    _hasAnOpenClearingOperation(operations) {
        return operations.length === 1 && operations[0].status === Operation.Status.OPEN;
    }

    async getClosedClearingOperation(openOperation, event) {
        let closeOperation;

        if (event.fromAddress === openOperation.user && openOperation.type === Operation.ClearingSubtypes.CLEARING_IN) {
            closeOperation = new Operation(
                Operation.ClearingSubtypes.CLEARING_IN, Operation.Status.CLOSED, openOperation.user
            );
        } else {
            closeOperation = new Operation(
                Operation.ClearingSubtypes.CLEARING_OUT, Operation.Status.CLOSED, openOperation.user
            );
        }
        closeOperation.transferId = openOperation.transferId;
        return await this.paymentStore.createOperation(closeOperation);
    }


}

module.exports = FiatMoneyPaymentHandler;