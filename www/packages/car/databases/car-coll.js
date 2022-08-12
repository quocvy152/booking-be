"use strict";

const Schema 	= require('mongoose');
const BASE_COLL = require('../../../database/intalize/base-coll');

/**
 * COLLECTION USER CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('car', {
	name: {
		type: String,
		trim: true
	},
	provinceID: {
		type: Number
	},
	districtID: {
		type: Number
	},
	wardID: {
		type: Number
	},
	provinceText: {
		type: String,
		trim: true
	},
	districtText: {
		type: String,
		trim: true
	},
	wardText: {
		type: String,
		trim: true
	},
	address: {
		type: String,
		trim: true
	},
	price: {
		type: Number
	},
	mortage: {
		type: String,
		trim: true
	},
	rules: {
		type: String,
		trim: true
	},
	userID: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	brandID: {
		type: Schema.Types.ObjectId,
		ref: 'brand'
	},
	description: {
		type: String,
		trim: true
	},
	avatar: {
		type: Schema.Types.ObjectId,
		ref: 'image'
	},
	gallery: [{
		type: Schema.Types.ObjectId,
		ref: 'image'
	}],
	/**
	 * Trạng thái hoạt động.
	 * 2. Đã xóa
	 * 1. Hoạt động
	 * 0. Khóa
	 */
	status: {
		type: Number,
		default: 1
	}
});
