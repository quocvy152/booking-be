"use strict";

const Schema 	= require('mongoose');
const BASE_COLL = require('../../../database/intalize/base-coll');

/**
 * COLLECTION USER CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('characteristic_type', {
	name: {
		type: String,
		trim: true,
		unique : true
	}, 
	icon: {
		type: String,
		trim: true,
	},
	code: {
		type: String,
		trim: true,
		unique : true
	},
	/**
	 * Trạng thái hoạt động.
	 * 2. Đã xóa
	 * 1. Hoạt động
	 * 0. Khóa
	 */
	status: {
		type: Number,
		default: 1
	},
});
