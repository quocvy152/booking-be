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
const CHARACTERISTIC_COLL      = require('../databases/characteristic-coll');

/**
 * MODELS
 */
const IMAGE_MODEL                = require('../../image/models/image').MODEL;
const TOKEN_MODEL                = require('../../token/models/token').MODEL;

class Model extends BaseModel {
    constructor() {
        super(CHARACTERISTIC_COLL);
        this.STATUS_ACTIVE = 1;
        this.STATUS_INACTIVE = 0;
        this.STATUS_DELETED = 2;
    }

	insert({ characteristicTypeID, value, icon, status = 1 }) {
        return new Promise(async resolve => {
            try {
                if(!value)
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                if(!ObjectID.isValid(characteristicTypeID))
                    return resolve({ error: true, message: 'Vui lòng chọn loại đặc điểm' });

                if(![this.STATUS_ACTIVE, this.STATUS_INACTIVE, this.STATUS_DELETED].includes(+status))
                    return resolve({ error: true, message: 'Trạng thái không hợp lệ' });

                let dataInsert = {
                    characteristicTypeID,
                    value, 
                    status
                }

                icon && (dataInsert.icon = icon);

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình tạo đặc điểm' });

                return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    update({ characteristicID, characteristicTypeID, value, icon, status }) {
        return new Promise(async resolve => {
            try {
                let dataUpdate = {};

                if(!ObjectID.isValid(characteristicID) || (characteristicTypeID && !ObjectID.isValid(characteristicTypeID)))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                value && (dataUpdate.value = value);
                icon  && (dataUpdate.icon = icon);
                characteristicTypeID && (dataUpdate.characteristicTypeID = characteristicTypeID);

                if(status) {
                    if(![this.STATUS_ACTIVE, this.STATUS_INACTIVE, this.STATUS_DELETED].includes(+status))
                        return resolve({ error: true, message: 'Trạng thái không hợp lệ' });

                    dataUpdate.status = +status;
                }

                let infoAfterUpdate = await CHARACTERISTIC_COLL.findByIdAndUpdate(characteristicID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình tạo đặc điểm' });

                return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    getInfo({ characteristicID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(characteristicID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let infoCharacteristic = await CHARACTERISTIC_COLL.findById(characteristicID).populate({
                    path: 'characteristicTypeID',
                    select: 'name code icon'
                });
                if(!infoCharacteristic)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy thông tin đặc điểm' });

                return resolve({ error: false, data: infoCharacteristic });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    getListOfCharacteristicType({ characteristicTypeID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(characteristicTypeID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let listCharacteristic = await CHARACTERISTIC_COLL.find({
                    characteristicTypeID
                }).populate({
                    path: 'characteristicTypeID',
                    select: 'name code icon'
                });
                if(!listCharacteristic || !listCharacteristic.length)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy danh sách đặc điểm của một loại đặc điểm' });

                return resolve({ error: false, data: listCharacteristic });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    remove({ characteristicID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(characteristicID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let dataUpdate = {
                    status: this.STATUS_DELETED
                };

				let infoAfterDelete = await CHARACTERISTIC_COLL.findByIdAndUpdate(characteristicID, dataUpdate, { new: true });
                if(!infoAfterDelete) 
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình xóa đặc điểm' });

                return resolve({ error: false, data: infoAfterDelete });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getList(){
        return new Promise(async resolve => {
            try {
                let listCharacteristic = await CHARACTERISTIC_COLL
                                                .find({
                                                    status: this.STATUS_ACTIVE
                                                })
                                                .populate({
                                                    path: 'characteristicTypeID',
                                                    select: 'name code icon'
                                                })
                if(!listCharacteristic)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy danh sách đặc điểm' });

                return resolve({ error: false, data: listCharacteristic });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;
