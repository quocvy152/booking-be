"use strict";

const Schema 	= require('mongoose');
const BASE_COLL = require('../../../database/intalize/base-coll');

/**
 * COLLECTION USER CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('characteristic', {
	value: {
		type: String,
		trim: true
	},
	icon: {
		type: String,
		trim: true
	},
	characteristicTypeID: {
		type: Schema.Types.ObjectId,
		ref: 'characteristic_type'
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
