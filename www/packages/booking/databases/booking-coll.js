"use strict";

const Schema 	= require('mongoose');
const BASE_COLL = require('../../../database/intalize/base-coll');

/**
 * COLLECTION BOOKING CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('booking', {
	user: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	car: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	startTime: {
		type: Date
	},
	endTime: {
		type: Date
	},
	pickUpPlace: {
		type: String
	},
	dropOffPlace: {
		type: String
	},
	/**
	 * Đơn giá (Số tiền thuê xe trên một ngày)
	 */
	price: {
		type: Number
	},
	totalPrice: {
		type: Number
	},
	/**
	 * Trạng thái hoạt động.
	 * 5: Đã thanh toán
	 * 4: Đợi trả xe
	 * 3: Đợi duyệt
	 * 2: Đã hủy
	 * 1: Hoạt động
	 * 0: Không hoạt động
	 */
	status: {
		type: Number,
		default: 3
	},
});
