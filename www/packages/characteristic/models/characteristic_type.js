'use strict';

/**
 * EXTERNAL PACKAGES
 */
const ObjectID                      = require('mongoose').Types.ObjectId;
const jwt                           = require('jsonwebtoken');
const { hash, hashSync, compare }   = require('bcryptjs');

/**
 * INTERNAL PACKAGES
 */
const cfJWS                         = require('../../../config/cf_jws');
const { 
    GENERATE_CODE_CHARACTERISTIC
}                                   = require('../../../utils/string_utils');

/**
 * BASES
 */
const BaseModel 					= require('../../../models/intalize/base_model');

/**
 * COLLECTIONS
 */
const CHARACTERISTIC_TYPE_COLL      = require('../databases/characteristic_type-coll');

/**
 * MODELS
 */
const IMAGE_MODEL                = require('../../image/models/image').MODEL;
const TOKEN_MODEL                = require('../../token/models/token').MODEL;

class Model extends BaseModel {
    constructor() {
        super(CHARACTERISTIC_TYPE_COLL);
        this.STATUS_ACTIVE = 1;
        this.STATUS_INACTIVE = 0;
        this.STATUS_DELETED = 2;
    }

	insert({ name, icon, status = 1 }) {
        return new Promise(async resolve => {
            try {
                if(!name)
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let code = GENERATE_CODE_CHARACTERISTIC(name);

                let isExist = await CHARACTERISTIC_TYPE_COLL.findOne({
                    $or: [
                        { name },
                        { code }
                    ]
                })
                if(isExist)
                    return resolve({ error: true, message: 'Loại đặc điểm đã tồn tại' });

                if(![this.STATUS_ACTIVE, this.STATUS_INACTIVE, this.STATUS_DELETED].includes(+status))
                    return resolve({ error: true, message: 'Trạng thái không hợp lệ' });

                let dataInsert = {
                    name, 
                    code,
                    status
                }

                icon && (dataInsert.icon = icon);

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình tạo loại đặc điểm' });

                return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    update({ characteristicTypeID, name, icon, status }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(characteristicTypeID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let dataUpdate = {};

                if(name) {
                    let code = GENERATE_CODE_CHARACTERISTIC(name);

                    let isExist = await CHARACTERISTIC_TYPE_COLL.findOne({
                        _id: { $ne: characteristicTypeID },
                        $or: [
                            { name },
                            { code }
                        ]
                    })
                    if(isExist)
                        return resolve({ error: true, message: 'Loại đặc điểm đã tồn tại' });

                    dataUpdate.name = name;
                    dataUpdate.code = code;
                }

                if(status) {
                    if(![this.STATUS_ACTIVE, this.STATUS_INACTIVE, this.STATUS_DELETED].includes(+status))
                        return resolve({ error: true, message: 'Trạng thái không hợp lệ' });

                    dataUpdate.status = +status;
                }

                icon && (dataUpdate.icon = icon);

                let infoAfterUpdate = await CHARACTERISTIC_TYPE_COLL.findByIdAndUpdate(characteristicTypeID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình cập nhật loại đặc điểm' });

                return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    getInfo({ characteristicTypeID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(characteristicTypeID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let infoCharacteristicType = await CHARACTERISTIC_TYPE_COLL.findById(characteristicTypeID);
                if(!infoCharacteristicType)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy thông tin loại đặc điểm' });

                return resolve({ error: false, data: infoCharacteristicType });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    remove({ characteristicTypeID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(characteristicTypeID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let dataUpdate = {
                    status: this.STATUS_DELETED
                };

				let infoAfterDelete = await CHARACTERISTIC_TYPE_COLL.findByIdAndUpdate(characteristicTypeID, dataUpdate, { new: true });
                if(!infoAfterDelete) 
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình xóa loại đặc điểm' });

                return resolve({ error: false, data: infoAfterDelete });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getList(){
        return new Promise(async resolve => {
            try {
                let listCharacteristicType = await CHARACTERISTIC_TYPE_COLL.find({
                    status: this.STATUS_ACTIVE
                }).lean();
                if(!listCharacteristicType)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy danh sách loại đặc điểm' });

                return resolve({ error: false, data: listCharacteristicType });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;
