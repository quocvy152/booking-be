"use strict";

const Schema 	= require('mongoose');
const BASE_COLL = require('../../../database/intalize/base-coll');

/**
 * COLLECTION USER CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('user', {
	username: {
		type: String,
		trim: true,
		unique : true
	}, 
	email: {
		type: String,
		trim: true,
		unique : true
	},
	phone: {
		type: String,
		trim: true,
		unique : true
	},
	password: {
		type: String
	},
	firstName: {
		type: String,
		trim: true,
	},
	lastName: {
		type: String,
		trim: true,
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
	/**
	 * Phân quyền truy cập.
	 * 0. ADMIN
	 * 1. USER
	 */
	role: {
		type: Number,
		default: 1
	},
	avatar: {
		type: Schema.Types.ObjectId,
		ref: 'image'
	},
	address: {
		type: String,
		trim: true,
	},
	citizenIdentificationNo: {
		type: String
	},
	citizenIdentificationFront: {
		type: Schema.Types.ObjectId,
		ref: 'image'
	},
	citizenIdentificationBack: {
		type: Schema.Types.ObjectId,
		ref: 'image'
	},
	drivingLicenseFront: {
		type: Schema.Types.ObjectId,
		ref: 'image'
	},
	drivingLicenseBack: {
		type: Schema.Types.ObjectId,
		ref: 'image'
	},
	drivingLicenseNo: {
		type: String
	},
});
