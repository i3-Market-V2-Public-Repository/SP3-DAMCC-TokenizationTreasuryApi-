/**
 * Copyright (c) 2020-2022 in alphabetical order:
 * GFT, Telesto Technologies
 *
 * This program and the accompanying materials are made
 * available under the terms of the EUROPEAN UNION PUBLIC LICENCE v. 1.2
 * which is available at https://gitlab.com/i3-market/code/wp3/t3.3/nodejs-tokenization-treasury-api/-/blob/master/LICENCE.md
 *
 * License-Identifier: EUPL-1.2
 *
 * Contributors:
 *    Vangelis Giannakosian (Telesto Technologies)
 *    Dimitris Kokolakis (Telesto Technologies)
 *
 */

const catchAsync = require('../utils/catchAsync');
const treasuryContract = require('../services/treasuryContractServiceWithCustomEventHandler').getInstance()
const {nameSpacedUUID} = require('../utils/uuid_generator')

exports.getOperations = catchAsync(async (req, res, next) => {
    return res.json({'a': 'hola'})
})