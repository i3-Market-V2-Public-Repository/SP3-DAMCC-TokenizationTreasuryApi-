const express = require('express');
const router = express.Router();
const treasuryController = require('../controllers/treasuryController');

/**
* @swagger
* /api/v1/treasury/marketplaces/{address}:
*   get:
*     tags: [Endpoints]
*     summary: Get the index of a registered marketplace
*     description: i3Treasury API endpoint to get the marketplace index. Add the address of the marketplace to the address path variable.
*     parameters:
*       - in: path
*         name: address
*         required: true
*         description: Address of the marketplace.
*         schema:
*           type: string
*     responses:
*       200:
*        content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 index:
*                   type: string
*                   description: Index of marketplace.
*                   example: 3
*/
router.get('/marketplaces/:address', treasuryController.getMarketPlaceIndex)

/**
* @swagger
* /api/v1/treasury/balances/{address}:
*   get:
*     tags: [Endpoints]
*     summary: Get the Balance for a specific account
*     description: i3Treasury API endpoint to get the balance given an account address. Add the address to the path variable.
*     parameters:
*       - in: path
*         name: address
*         required: true
*         description: Address of the marketplace.
*         schema:
*           type: string
*     responses:
*       200:
*        content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 balance:
*                   type: object
*                   description: Balances.
*                   example: ["0","0"]
*/
router.get('/balances/:address', treasuryController.getAddressBalance)

/**
* @swagger
* /api/v1/treasury/transactions/{transactionHash}:
*   get:
*    tags: [Endpoints]
*    summary: Get the Receipt of a transaction given a TransactionHash
*    description: i3Treasury endpoint to get the receipt of a transaction. Add the transaction hash in the path variables to get the receipt.
*    parameters:
*     - in: path
*       name: transactionHash
*       required: true
*       description: Address of the marketplace.
*       schema:
*         type: string
*    responses:
*      200:
*       content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                receipt:
*                  type: object
*                  description: The pending transaction hash.
*                  example: {"transactionHash": "0xa3586e3442d87eda95dff2ae4804d78f3b6d0b0945fba61ef1cc1b96650349c9",
*                           "transactionIndex": 0,
*                           "blockHash": "0xc410fc12a2c18918d9032e167362d7e0b47fff38938cd83645c3319d49300d5e",
*                           "blockNumber": 123,
*                           "from": "0xd94f3239185c27937367b9a1a17ab70f4f631005",
*                           "to": "0x2567d618a8bc5996ab447ecda3a2b0bf7b323840",
*                           "gasUsed": 60741,
*                           "cumulativeGasUsed": 60741,
*                           "contractAddress": null,
*                           "logs": [],
*                           "status": true,
*                           "logsBloom":
*                           "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
*                           00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
*                           0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
*                           }
*      404:
*       content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                receipt:
*                  type: object
*                  description: The pending transaction hash.
*                  example: null
*/
router.get('/transactions/:transactionHash', treasuryController.getTransactionReceipt)


/**
* @swagger
* /api/v1/treasury/token-transfers/{transferId}:
*   get:
*    tags: [Endpoints]
*    summary: Get the Token Transfer given a TransferId
*    description: i3Treasury endpoint to get the receipt of a transaction. Add the transaction hash in the path variables to get the receipt.
*    parameters:
*     - in: path
*       name: transferId
*       required: true
*       description: Operation unique identifier.
*       schema:
*         type: string
*    responses:
*      200:
*       content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                transfer:
*                  type: object
*                  description: The pending transaction hash.
*                  example: {
*                        "0": "a8e70c41-3c76-5cb6-b0e9-07da49d94621",
*                        "1": "0x3bC438887726c79498c8a79CA3226e6e84d03458",
*                        "2": "0x6F0a2430CD784b871b9eB206B20a25b08351E3AE",
*                        "3": "100",
*                        "4": true,
*                        "5": "",
*                        "transferId": "a8e70c41-3c76-5cb6-b0e9-07da49d94621",
*                        "fromAddress": "0x3bC438887726c79498c8a79CA3226e6e84d03458",
*                        "toAddress": "0x6F0a2430CD784b871b9eB206B20a25b08351E3AE",
*                        "tokenAmount": "100",
*                       "isPaid": true,
*                       "transferCode": ""
*                     }
*      404:
*       content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                receipt:
*                  type: object
*                  description: The pending transaction hash.
*                  example: null
*/
router.get('/token-transfers/:transferId', treasuryController.getTransactionForTransferId)

/**
* @swagger
* /api/v1/treasury/marketplaces:
*   post:
*     tags: [Endpoints]
*     summary: Register a marketplace
*     description: Call add marketplace i3Treasury API to add a marketplace.
*                  In the body you need to pass a "senderAddress" and a "marketplaceAddress" in a JSON format. The two addresses need to be the same.
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               senderAddress:
*                 type: string
*                 description: The address of the sender.
*                 example: "0x79CD92CD7c1e380c1a6Ba5E9EF09D2F7c4820C6d"
*               marketplaceAddress:
*                 type: string
*                 description: The address of the marketpace.
*                 example: "0x79CD92CD7c1e380c1a6Ba5E9EF09D2F7c4820C6d"
*     responses:
*       200:
*        content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 transactionObject:
*                   type: string
*                   description: The pending transaction object.
*                   example: {
*                             "chainId": "1",
*                             "nonce": 1,
*                             "gasLimit": 6721975,
*                             "gasPrice": 201966,
*                             "to": "0x5780262041318FD9fc8E345F665bEc7684E15C75",
*                             "from": "0xb3a0ED21c54196E4B446D79b7925766aa86BC196",
*                             "data": "0x909770870000000000000000000000000000000000000000000000000000000000000060000000000000000000000000f3d15f97bf1b55b486486de2d819649bc92fff6b000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000002438646265373434372d333637362d353262632d623439312d30393638653735626134663400000000000000000000000000000000000000000000000000000000"
*                           }
*/
router.post('/marketplaces', treasuryController.addMarketPlace)

/**
* @swagger
* /api/v1/treasury/transactions/exchange-in:
*   post:
*     tags: [Endpoints]
*     summary: Exchange fiat money for tokens
*     description: Call exchange-in endpoint in order to exchange an amount of fiat money into tokens from a Marketplace.
*                  Pass a "senderAddress", a "userAddress" and a "tokens" which is the amount of tokens to exchange.

*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               senderAddress:
*                 type: string
*                 description: The address of the marketpace.
*                 example: "0xD94f3239185C27937367B9A1A17aB70f4F631005"
*               userAddress:
*                 type: string
*                 description: The address of the Data consumer.
*                 example: "0xb8E0101259550765a5f1287d0F680Ee9B09b42B3"
*               tokens:
*                 type: string
*                 description: The amount of tokens.
*                 example: 10
*     responses:
*       200:
*        content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 transferId:
*                   type: string
*                   description: The unique transfer id generated for this transaction.
*                   example: "6fa4973b-11ce-56d8-8544-660e1a334b92"
*                 transactionHash:
*                   type: string
*                   description: The pending transaction hash.
*                   example: {
*                             "chainId": "1",
*                             "nonce": 1,
*                             "gasLimit": 6721975,
*                             "gasPrice": 201966,
*                             "to": "0x5780262041318FD9fc8E345F665bEc7684E15C75",
*                             "from": "0xb3a0ED21c54196E4B446D79b7925766aa86BC196",
*                             "data": "0x909770870000000000000000000000000000000000000000000000000000000000000060000000000000000000000000f3d15f97bf1b55b486486de2d819649bc92fff6b000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000002438646265373434372d333637362d353262632d623439312d30393638653735626134663400000000000000000000000000000000000000000000000000000000"
*                           }
*/
router.post('/transactions/exchange-in', treasuryController.exchangeIn)

/**
* @swagger
* /api/v1/treasury/transactions/payment:
*   post:
*     tags: [Endpoints]
*     description: Call payment API to transfer the right amount of tokens to a Data Provider. Pass a "senderAddress", a "providerAddress" and an "amount" of tokens to transfer to the Data Provider.
*     summary: Pay the Data Provider
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               senderAddress:
*                 type: string
*                 description: The address of the sender.
*                 example: "0xb8E0101259550765a5f1287d0F680Ee9B09b42B3"
*               providerAddress:
*                 type: string
*                 description: The address of the Data Provider.
*                 example: "0xb13894b969ad9A69108684dA8004E53A32c6deC6"
*               amount:
*                 type: string
*                 description: The amount of tokens.
*                 example: 10
*     responses:
*       200:
*        content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 transferId:
*                   type: string
*                   description: The unique transfer id generated for this transaction.
*                   example: "6fa4973b-11ce-56d8-8544-660e1a334b92"
*                 transactionHash:
*                   type: string
*                   description: The pending transaction hash.
*                   example: {
*                             "chainId": "1",
*                             "nonce": 1,
*                             "gasLimit": 6721975,
*                             "gasPrice": 201966,
*                             "to": "0x5780262041318FD9fc8E345F665bEc7684E15C75",
*                             "from": "0xb3a0ED21c54196E4B446D79b7925766aa86BC196",
*                             "data": "0x909770870000000000000000000000000000000000000000000000000000000000000060000000000000000000000000f3d15f97bf1b55b486486de2d819649bc92fff6b000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000002438646265373434372d333637362d353262632d623439312d30393638653735626134663400000000000000000000000000000000000000000000000000000000"
*                           }
*/
router.post('/transactions/payment', treasuryController.payment)

/**
* @swagger
* /api/v1/treasury/transactions/exchange-out:
*   post:
*     tags: [Endpoints]
*     description: Call exchange-out endpoint in order to exchange the right amount of tokens available with money from a Data Marketplace.
*     summary: Exchange tokens for money
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               senderAddress:
*                 type: string
*                 description: The address of the sender.
*                 example: "0xD94f3239185C27937367B9A1A17aB70f4F631005"
*               marketplaceAddress:
*                 type: string
*                 description: The address of the the marketplace.
*                 example: "0xb8E0101259550765a5f1287d0F680Ee9B09b42B3"
*     responses:
*       200:
*        content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 transferId:
*                   type: string
*                   description: The unique transfer id generated for this transaction.
*                   example: "6fa4973b-11ce-56d8-8544-660e1a334b92"
*                 transactionHash:
*                   type: string
*                   description: The transaction hash of the exchange.
*                   example: {
*                             "chainId": "1",
*                             "nonce": 1,
*                             "gasLimit": 6721975,
*                             "gasPrice": 201966,
*                             "to": "0x5780262041318FD9fc8E345F665bEc7684E15C75",
*                             "from": "0xb3a0ED21c54196E4B446D79b7925766aa86BC196",
*                             "data": "0x909770870000000000000000000000000000000000000000000000000000000000000060000000000000000000000000f3d15f97bf1b55b486486de2d819649bc92fff6b000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000002438646265373434372d333637362d353262632d623439312d30393638653735626134663400000000000000000000000000000000000000000000000000000000"
*                           }
*/
router.post('/transactions/exchange-out', treasuryController.exchangeOut)

/**
* @swagger
* /api/v1/treasury/transactions/clearing:
*   post:
*     tags: [Endpoints]
*     description: Call clearing endpoint in order to clear the balance of a Data Marketplace.
*     summary: Crear the balance
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               senderAddress:
*                 type: string
*                 description: The address of the marketplace.
*                 example: "0x79CD92CD7c1e380c1a6Ba5E9EF09D2F7c4820C6d"
*     responses:
*       200:
*        content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 transferId:
*                   type: string
*                   description: The unique transfer id generated for this transaction.
*                   example: "6fa4973b-11ce-56d8-8544-660e1a334b92"
*                 transactionHash:
*                   type: string
*                   description: The transaction hash of the exchange.
*                   example: {
*                             "chainId": "1",
*                             "nonce": 1,
*                             "gasLimit": 6721975,
*                             "gasPrice": 201966,
*                             "to": "0x5780262041318FD9fc8E345F665bEc7684E15C75",
*                             "from": "0xb3a0ED21c54196E4B446D79b7925766aa86BC196",
*                             "data": "0x909770870000000000000000000000000000000000000000000000000000000000000060000000000000000000000000f3d15f97bf1b55b486486de2d819649bc92fff6b000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000002438646265373434372d333637362d353262632d623439312d30393638653735626134663400000000000000000000000000000000000000000000000000000000"
*                           }
*/
router.post('/transactions/clearing', treasuryController.clearing)


/**
* @swagger
* /api/v1/treasury/transactions/set-paid:
*   post:
*     tags: [Endpoints]
*     description: Call set-paid endpoint in order to mark a token transfer as paid.
*     summary: Set isPaid as true to a specified Token Transfer
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               transferId:
*                 type: string
*                 description: The transfer's unique identifier
*                 example: "6fa4973b-11ce-56d8-8544-660e1a334b92"
*               senderAddress:
*                 type: string
*                 description: The address of the message sender.
*                 example: "0x79CD92CD7c1e380c1a6Ba5E9EF09D2F7c4820C6d"
*     responses:
*       200:
*        content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 transactionHash:
*                   type: string
*                   description: The transaction hash generated for this block.
*                   example: {
*                             "chainId": "1",
*                             "nonce": 1,
*                             "gasLimit": 6721975,
*                             "gasPrice": 201966,
*                             "to": "0x5780262041318FD9fc8E345F665bEc7684E15C75",
*                             "from": "0xb3a0ED21c54196E4B446D79b7925766aa86BC196",
*                             "data": "0x909770870000000000000000000000000000000000000000000000000000000000000060000000000000000000000000f3d15f97bf1b55b486486de2d819649bc92fff6b000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000002438646265373434372d333637362d353262632d623439312d30393638653735626134663400000000000000000000000000000000000000000000000000000000"
*                           }
*/
router.post('/transactions/set-paid', treasuryController.setPaid)

module.exports = router;