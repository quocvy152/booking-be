"use strict";

const Schema 	= require('mongoose');
const BASE_COLL = require('../../../database/intalize/base-coll');

/**
 * COLLECTION CUSTOMER CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('customer_import', {
	name: {
		type: String,
	},
	phone: {
		type: String,
		default: ''
	},
	/**
	 * Điểm hiện tại của user +-
	 */
	point: {
		type: Number,
	},
    isDelete: Number
});
