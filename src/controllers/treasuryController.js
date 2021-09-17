const catchAsync = require('../utils/catchAsync');
const treasuryContract = require('../services/TreasuryContractService').getInstance()
const {nameSpacedUUID} = require('../utils/uuid_generator')

exports.getTransactionReceipt = catchAsync(async (req, res, next) => {
    const hash = req.params.transactionHash
    const receipt = await treasuryContract.getTransactionReceipt(hash)
    if (receipt) {
        return res.json({receipt})
    }
    return res.status(404).json()
})

exports.getMarketPlaceIndex = catchAsync(async (req, res, next) => {
    const address = req.params.address
    const index = await treasuryContract.getMarketPlaceIndex(address)
    return res.json({index})
})

exports.getAddressBalance = catchAsync(async (req, res, next) => {
    const address = req.params.address
    const balance = await treasuryContract.getBalanceForAddress(address)
    return res.json({balance})
})

exports.getTransactionForTransferId = catchAsync(async (req, res, next) => {
    const transferId = req.params.transferId
    const transfer = await treasuryContract.getTransactionByTransferId(transferId)
    if (transfer) {
        return res.json({transfer})
    }
    return res.status(404).json()
})

exports.addMarketPlace = catchAsync(async (req, res, next) => {

    const {senderAddress, marketplaceAddress} = req.body

    if (!senderAddress || !marketplaceAddress) {
        return res.status(400).json({
            message: 'You must provide senderAddress and marketplaceAddress'
        })
    }

    const transactionHash = await treasuryContract.addMarketPlace(senderAddress, marketplaceAddress)
    return res.json({transactionHash})
})

exports.exchangeIn = catchAsync(async (req, res, next) => {
    const {senderAddress, userAddress, tokens} = req.body

    if (!senderAddress || !userAddress || !tokens) {
        return res.status(400).json({
            message: 'You must provide senderAddress, userAddress and tokens amount'
        })
    }
    const transferId = nameSpacedUUID();
    const transactionHash = await treasuryContract.exchangeIn(transferId, senderAddress, userAddress, tokens)
    return res.json({transferId, transactionHash})
})

exports.exchangeOut = catchAsync(async (req, res, next) => {
    const {senderAddress, marketplaceAddress} = req.body

    if (!senderAddress || !marketplaceAddress) {
        return res.status(400).json({
            message: 'You must provide senderAddress and marketplaceAddress'
        })
    }

    const transferId = nameSpacedUUID();
    const transactionHash = await treasuryContract.exchangeOut(transferId, senderAddress, marketplaceAddress)
    return res.json({transferId, transactionHash})
})

exports.payment = catchAsync(async (req, res, next) => {
    const {senderAddress, providerAddress, amount} = req.body

    if (!senderAddress || !providerAddress || !amount) {
        return res.status(400).json({
            message: 'You must provide senderAddress, providerAddress and amount'
        })
    }

    const transferId = nameSpacedUUID();
    const transactionHash = await treasuryContract.payment(transferId, senderAddress, providerAddress, amount)
    return res.json({transferId, transactionHash})

})

exports.clearing = catchAsync(async (req, res, next) => {
    const {senderAddress} = req.body

    if (!senderAddress) {
        return res.status(400).json({
            message: 'You must provide senderAddress'
        })
    }

    const transferId = nameSpacedUUID();
    const transactionHash = await treasuryContract.clearing(transferId, senderAddress)
    return res.json({transferId, transactionHash})

})

