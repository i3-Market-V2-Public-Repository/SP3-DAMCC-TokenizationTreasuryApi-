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
router.get('/marketplaces/:address',treasuryController.getMarketPlaceIndex)

/**
* @swagger
* /api/v1/treasury/balances/{address}:
*   get:
*     tags: [Endpoints]
*     summary: Get the Balance for a specific account
*     description: i3Treasury API endpoint to get the balance given an account address. Add the address of the marketplace to the address path variable.
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
*                   example: [0]
*/
router.get('/balances/:address',treasuryController.getAddressBalance)

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
router.get('/transactions/:transactionHash',treasuryController.getTransactionReceipt)

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
*                 transactionHash:
*                   type: string
*                   description: The pending transaction hash.
*                   example: "0xd9415ee9afde5787e11eac859bf4b7cae945daaf6896a28ebddf23270684744f"
*/
router.post('/marketplaces',treasuryController.addMarketPlace)

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
*                   example: "0x6dd4eeebaa827edd7df3c3298e00eb155c22d1af95800247c1f49ac7dd1e2eae"
*/
router.post('/transactions/exchange-in',treasuryController.exchangeIn)

/**
* @swagger
* /api/v1/treasury/payment:
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
*                   example: "0x327d02f4341f425fa129fe9085fc4f8e8604dd3aef5281e193e95a7861ab9a96"
*/
router.post('/payment',treasuryController.payment)

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
*                   example: "0xe365ffdfbd05b2ec49eda2c61d3a8113c54b2da281a6bae62901670bb22bb58f"
*/
router.post('/transactions/exchange-out',treasuryController.exchangeOut)

/**
* @swagger
* /api/v1/treasury/clearing:
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
*                   example: "0xd9415ee9afde5787e11eac859bf4b7cae945daaf6896a28ebddf23270684744f"
*/
router.post('/clearing', treasuryController.clearing)

module.exports = router;