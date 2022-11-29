"use strict";

const Schema 	= require('mongoose');
const BASE_COLL = require('../../../database/intalize/base-coll');

/**
 * COLLECTION BOOKING CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('booking_rating', {
	customer: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	booking: {
		type: Schema.Types.ObjectId,
		ref: 'booking'
	},
	/**
	 * Chủ xe
	 */
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	/**
	 * Số sao
	 */
	rating: {
		type: Number
	},
	/**
	 * Đánh giá
	 */
	ratingText: {
		type: String
	},
	/**
	 * Trạng thái hoạt động.
	 * 1: Hoạt động
	 * 2 Không hoạt động
	 */
	status: {
		type: Number,
		default: 2
	},
});
