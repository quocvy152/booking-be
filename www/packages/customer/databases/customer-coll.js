"use strict";

const Schema 	= require('mongoose');
const BASE_COLL = require('../../../database/intalize/base-coll');

/**
 * COLLECTION CUSTOMER CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('customer', {
	code: {
		type: String,
		required: true,
		max: 8
	},
	fullname: {
		type: String,
		trim: true,
		required: true
	},
	email: {
		type: String,
		trim: true,
		required: true
	},
	phone: {
		type: String,
		default: ''
	},
	birthday: {
		type: Date,
	},
	password: {
		type: String,
		trim: true
	},
	/**
	 * Điểm dùng để xếp hạng khách hàng +
	 */
	pointRanking: {
		type: Number,
		default: 0
	},
	/**
	 * Điểm hiện tại của user +-
	 */
	point: {
		type: Number,
		default: 0
	},
	qrCode: {
		type: Schema.Types.ObjectId,
		ref: 'qr_code'
	},
	avatar: {
		type: Schema.Types.ObjectId,
		ref: 'image'
	},

	codeChangeEmail: String,
	/**
	 * ==============TỪ FIREBASE GỬI VỀ==============
	 */
	picture: {
		type: String,
	},
	id: {
		type: String,
	},
	birthday: {
		type: String,
	},
	token: {
		type: String,
	},
	/**
	 * ==============TỪ FIREBASE GỬI VỀ==============
	 */
	/**
	 * 0: Normal
	 * 1: Google
	 * 2: Facebook
	 * 3: Apple
	 */
	type: {
		type: Number,
		default: 0
	},
	googleUID: {
		type: String,
	},
	facebookUID: {
		type: String,
	},
	appleUID: {
		type: String,
	},
	/**
	 * Giới tính
	 * 0: Nữ
	 * 1: Nam
	 * 2: Khác
	 */
	gender: {
		type: Number,
		default: 2
	},
	/**
	 * Địa chỉ khách hàng(text)
	 */
	address: String,
	/**
	 * Trạng thái hoạt động.
	 * 1: Hoạt động
	 * 0: Khóa
	 */
	status: {
		type: Number,
		default: 1
	},
	/**
	 * Bên AMS đã đụng chạm dữ liệu
	 */
	intervention: {
		type: Boolean,
		default: false
	}
});
