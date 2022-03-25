class PaymentDataStore {

    async getOperations() {
        throw "must implement getOperations, Returns an operation entity list"
    }

    async getOperationById(id) {
        throw "must implement getOperationById, Returns an operation entity"
    }

    async getOperationByTransferId(transferId) {
        throw "must implement getOperationByTransferId, Returns an operation entity list"
    }

    async getOperationsByType(type) {
        throw "must implement getOperationsByType, Returns an operation entity list"
    }

    async getOperationsByStatus(status) {
        throw "must implement getOperationsByStatus, Returns an operation entity list"
    }

    async getOperationsByDate(date) {
        throw "must implement getOperationsByDate, Returns an operation entity list"
    }

    async getOperationsByUser(user) {
        throw "must implement getOperationsByUser, Returns an operation entity list"
    }

    async createOperation(operation) {
        throw "must implement createOperation, Returns an operation entity"
    }

    async updateOperationStatus(id, status) {
        throw "must implement updateOperationStatus, Returns an operation entity"
    }
}

module.exports = PaymentDataStore;