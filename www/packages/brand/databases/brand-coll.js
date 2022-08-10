"use strict";

const Schema 	= require('mongoose');
const BASE_COLL = require('../../../database/intalize/base-coll');

/**
 * COLLECTION BRAND CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('brand', {
	name: {
		type: String,
		required: true
	},
	icon: {
		type: String,
	},
	/**
	 * Trạng thái hoạt động.
	 * 1: Hoạt động
	 * 0: Không hoạt động
	 */
	status: {
		type: Number,
		default: 1
	},
});
