"use strict";

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
	password: {
		type: String
	},
	/**
	 * Trạng thái hoạt động.
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
	 * 1. OWNER BRAND
	 * 2. EDITER
	 */
	role: {
		type: Number,
		default: 0
	},
	
});
