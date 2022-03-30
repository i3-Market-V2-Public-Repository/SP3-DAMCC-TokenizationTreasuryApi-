#!/bin/bash

#
# Copyright (c) 2020-2022 in alphabetical order:
# GFT, HOPU, Telesto Technologies
#
# This program and the accompanying materials are made
# available under the terms of the EUROPEAN UNION PUBLIC LICENCE v. 1.2
# which is available at https://gitlab.com/i3-market/code/wp3/t3.3/nodejs-tokenization-treasury-api/-/blob/master/LICENCE.md
#
#  License-Identifier: EUPL-1.2
#
#  Contributors:
#    Vangelis Giannakosian (Telesto Technologies)
#    Dimitris Kokolakis (Telesto Technologies)
#    George Benos (Telesto Technologies)
#    Germán Molina (HOPU)
#
#

SCRIPTPATH=$(cd -- "$(dirname "$0")" > /dev/null 2>&1 ; pwd -P ) || exit
echo "Removing previous contracts"
rm -rf "$SCRIPTPATH"/../contracts_tmp

echo "Cloning repository"
git clone git@gitlab.com:i3-market/code/wp3/t3.3/tokenization.git "$SCRIPTPATH"/../contracts_tmp
cd "$SCRIPTPATH"/../contracts_tmp/contracts || exit; truffle compile
cp "$SCRIPTPATH"/../contracts_tmp/build/contracts/I3MarketTreasury.json "$SCRIPTPATH"/../contracts/treasury/I3MarketTreasury.json
rm -rf "$SCRIPTPATH"/../contracts_tmp