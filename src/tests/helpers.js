const {strict: assert} = require("assert");
const {collectSources} = require("truffle/build/672.bundled");
helpers = {}

helpers.assertIsOperationInList = (operation, operationList) => {

    for (let i = 0; i < operationList.length; i++) {
        let o = operationList[i];
        if (o.id === operation.id) {
            console.log(
                "[HELPER][assertIsOperationInList]: \nActual: " +
                JSON.stringify(operation) + "\nexpected: " + JSON.stringify(o)
            );
            assert.strictEqual(operation.id, o.id);
            assert.strictEqual(operation.type, o.type);
            assert.strictEqual(operation.status, o.status);
            assert.strictEqual(operation.user, o.user);
            assert.strictEqual(operation.date, o.date);

            return;
        }
    }

    assert.fail("Operation " + operation.id + " NOT found");
}

module.exports = helpers;