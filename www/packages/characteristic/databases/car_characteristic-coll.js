"use strict";

const Schema 	= require('mongoose');
const BASE_COLL = require('../../../database/intalize/base-coll');

/**
 * COLLECTION USER CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('car_characteristic', {
	carID: {
		type: Schema.Types.ObjectId,
		ref: 'car'
	},
	characteristicID: {
		type: Schema.Types.ObjectId,
		ref: 'characteristic'
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
