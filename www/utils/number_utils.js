"use strict";

const utils = require('./utils');

exports.priceFormat = function (num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
};

exports.baseFormatNumber = function (number, fixLength) {
    return utils.currencyFormat(number, fixLength);
};

exports.validPhone = (phone) => {
	let phone_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
	return phone_regex.test(phone);
}
