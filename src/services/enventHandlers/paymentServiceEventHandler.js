const EventHandler = require("./eventHandler");
const Operation = require("../../entities/operation");


class PaymentServiceEventHandler extends EventHandler {

    constructor(paymentDataStore) {
        super();
        this.paymentStore = paymentDataStore;
    }

    async execute(event) {
        console.log("[PaymentServiceEventHandler][execute] Event: " + JSON.stringify(event));

        if (event.operation === Operation.Type.EXCHANGE_IN) {
            return await this._closeExchangeInOperation(event);
        } else if (event.operation === Operation.Type.EXCHANGE_OUT) {
            return await this._handleExchangeOutOperation(event);
        } else {
            console.log("[PaymentServiceEventHandler][execute] Event" + event.operation + " NOT FOUND")
        }
    }

    async _closeExchangeInOperation(event) {
        let operations = await this.paymentStore.getOperationByTransferId(event.transferId);
        console.log("[PaymentServiceEventHandler][_closeOperation] operations " + JSON.stringify(operations));
        if (operations && operations.length === 1 && operations[0].status === Operation.Status.OPEN) {
            let operation = new Operation(Operation.Type.EXCHANGE_IN, Operation.Status.CLOSED, operations[0].user);
            operation.setTransferId(event.transferId);
            return await this.paymentStore.createOperation(operation);
        }

        return Operation.NULL
    }

    async _handleExchangeOutOperation(event) {
        let operations = await this.paymentStore.getOperationByTransferId(event.transferId);
        console.log("[PaymentServiceEventHandler][_handleExchangeOutOperation] operations " + JSON.stringify(operations));
        if (operations && operations.length === 1 && operations[0].status === Operation.Status.OPEN) {
            let operation = new Operation(
                Operation.Type.EXCHANGE_OUT, Operation.Status.IN_PROGRESS, operations[0].user
            );
            operation.setTransferId(event.transferId);

            return await this.paymentStore.createOperation(operation);
        }

        return Operation.NULL
    }

}

module.exports = PaymentServiceEventHandler;