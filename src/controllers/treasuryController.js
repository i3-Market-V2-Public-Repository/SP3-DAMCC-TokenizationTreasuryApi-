const catchAsync = require('../utils/catchAsync');
const treasuryContract = require('../services/TreasuryContractService').getInstance()


exports.getTransactionReceipt = catchAsync(async (req, res, next) => {
    const hash = req.params.transactionHash
    const receipt = await treasuryContract.getTransactionReceipt(hash)
    res.json({receipt})
})

exports.getMarketPlaceIndex = catchAsync(async (req, res, next) => {
    const address = req.params.address
    const index = await treasuryContract.getMarketPlaceIndex(address)
    res.json({index})
})

exports.getAddressBalance = catchAsync(async (req, res, next) => {
    const address = req.params.address
    const balance = await treasuryContract.getBalanceForAddress(address)
    return res.json({balance})
})

exports.addMarketPlace = catchAsync(async (req, res, next) => {

    const {fromAddress, toAddress} = req.body

    if (!fromAddress || !toAddress) {
        return res.status(400).json({
            message: 'You must provide fromAddress and toAddress'
        })
    }

    const transactionHash = await treasuryContract.addMarketPlace(fromAddress, toAddress)
    return res.json({transactionHash})
})

exports.exchangeIn = catchAsync(async (req, res, next) => {
    const {fromAddress, toAddress, tokens} = req.body

    if (!fromAddress || !toAddress || !tokens) {
        return res.status(400).json({
            message: 'You must provide fromAddress, toAddress and tokens amount'
        })
    }

    const transactionHash = await treasuryContract.exchangeIn(fromAddress, toAddress, tokens)
    return res.json({transactionHash})
})

exports.exchangeOut = catchAsync(async (req, res, next) => {
    const {providerAddress, marketplaceAddress} = req.body

    if (!providerAddress || !marketplaceAddress) {
        return res.status(400).json({
            message: 'You must provide providerAddress and marketplaceAddress'
        })
    }

    const transactionHash = await treasuryContract.exchangeOut(providerAddress, marketplaceAddress)
    return res.json({transactionHash})
})

exports.payment = catchAsync(async (req, res, next) => {
    const {fromAddress, toAddress, ammount} = req.body

    if (!fromAddress || !toAddress || !ammount) {
        return res.status(400).json({
            message: 'You must provide fromAddress, toAddress and ammount'
        })
    }

    const transactionHash = await treasuryContract.payment(fromAddress, toAddress, ammount)
    return res.json({transactionHash})

})

exports.clearing = catchAsync(async (req, res, next) => {
    const {fromAddress} = req.body

    if (!fromAddress) {
        return res.status(400).json({
            message: 'You must provide fromAddress'
        })
    }

    const transactionHash = await treasuryContract.clearing(fromAddress)
    return res.json({transactionHash})

})

