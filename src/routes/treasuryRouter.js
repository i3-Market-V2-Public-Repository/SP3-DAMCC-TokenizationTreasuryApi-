const express = require('express');
const router = express.Router();
const treasuryController = require('../controllers/treasuryController');

//Add new marketplace
router.post('/marketplaces',treasuryController.addMarketPlace)

//Get marketplace index
router.get('/marketplaces/:address',treasuryController.getMarketPlaceIndex)
router.get('/balances/:address',treasuryController.getAddressBalance)

//Token exchange endpoints
router.post('/transactions/exchange-in',treasuryController.exchangeIn)
router.post('/transactions/exchange-out',treasuryController.exchangeOut)

//Get Receipt for Transaction
router.get('/transactions/:transactionHash',treasuryController.getTransactionReceipt)

module.exports = router;