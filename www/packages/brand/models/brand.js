"use strict";

/**
 * EXTERNAL PACKAGE
 */
const ObjectID                      = require('mongoose').Types.ObjectId;
const jwt                           = require('jsonwebtoken');
const { hash, hashSync, compare }   = require('bcryptjs');
const moment                        = require('moment');
const { sendMailChangeEmail } = require('../../../mailer/module/mail_user');

/**
 * INTERNAL PACKAGE
 */
const cfJWS                        	= require('../../../config/cf_jws');
const { checkEmail, loadPathImage } = require('../../../utils/utils');
const { validPhone } 				= require('../../../utils/number_utils');
const { 
	validEmail, 
	randomNumbers 
} = require('../../../utils/string_utils');

/**
 * BASE
 */
const BaseModel 					= require('../../../models/intalize/base_model');
const { IMAGE_MODEL }				= require('../../image');

/**
 * COLLECTIONS, MODELS
 */
const BRAND_COLL  				= require('../databases/brand-coll');

class Model extends BaseModel {
    constructor() {
        super(BRAND_COLL);
		this.STATUS_INACTIVE = 0;
        this.STATUS_ACTIVE   = 1;
        this.STATUS_REMOVED  = 2;
    }

    /**
     * TẠO BRAND
     */
	insert({ name, icon }) {
        return new Promise(async resolve => {
            try {
				if(!name)
					return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let isExistBrandName = await BRAND_COLL.findOne({ name });
                if(isExistBrandName)
                    return resolve({ error: true, message: 'Thương hiệu đã tồn tại' });

                let dataInsert = {
                    name, 
                    icon
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình thêm' })

				return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    update({ brandID, name, icon, status }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(brandID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                if(status && ![this.STATUS_ACTIVE, this.STATUS_INACTIVE, this.STATUS_REMOVED].includes(+status))
                    return resolve({ error: true, message: 'Trạng thái cập nhật không hợp lệ' });

                let isExistBrandName = await BRAND_COLL.findOne({
                    _id: {
                        $ne: brandID
                    },
                    name
                });
                if(isExistBrandName)
                    return resolve({ error: true, message: 'Thương hiệu đã tồn tại' });

                let dataUpdate = {};

                name   && (dataUpdate.name = name);
                icon   && (dataUpdate.icon = icon);
                status && (dataUpdate.status = +status);

                let infoBrandAfterUpdate = await BRAND_COLL.findByIdAndUpdate(brandID, dataUpdate, {
                    new: true
                });
                if(!infoBrandAfterUpdate)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình cập nhật thương hiệu' });

                return resolve({ error: false, data: infoBrandAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getList(){
        return new Promise(async resolve => {
            try {
                let listBrand = await BRAND_COLL
                    .find({
                        status: this.STATUS_ACTIVE                       
                    })
					.sort({ name: 1 })
					.lean();
                if(!listBrand)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy danh sách thương hiệu' });

                return resolve({ error: false, data: listBrand });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getInfo({ brandID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(brandID))
                    return resolve({ error: true, message: "Tham số không hợp lệ" });

				let infoBrand = await BRAND_COLL
					.findById(brandID)
					.lean();

                if(!infoBrand) 
                    return resolve({ error: true, message: "Xảy ra lỗi lấy thông tin chi tiết thương hiệu" });
                
                return resolve({ error: false, data: infoBrand });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    remove({ brandID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(brandID))
                    return resolve({ error: true, message: "Tham số không hợp lệ" });

                let dataUpdateToRemove = { status: this.STATUS_REMOVED };

				let infoAfterDelete = await BRAND_COLL.findByIdAndUpdate(brandID, dataUpdateToRemove, {
                    new: true
                });
                if(!infoAfterDelete) 
                    return resolve({ error: true, message: "Xảy ra lỗi trong quá trình xóa thương hiệu" });

                return resolve({ error: false, data: infoAfterDelete });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;
