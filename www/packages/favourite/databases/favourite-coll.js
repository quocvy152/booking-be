"use strict";

const Schema 	= require('mongoose');
const BASE_COLL = require('../../../database/intalize/base-coll');

/**
 * COLLECTION BRAND CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('favourite', {
	car: {
		type: Schema.Types.ObjectId,
		ref: 'car'
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	/**
	 * Trạng thái hoạt động.
	 * 2: Đã xóa	
     * 1: Hoạt động
	 * 0: Không hoạt động
	 */
	status: {
		type: Number,
		default: 1
	},
});
