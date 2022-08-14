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

/**
 * BASES
 */
const BaseModel 					= require('../../../models/intalize/base_model');

/**
 * COLLECTIONS
 */
const CAR_CHARACTERISTIC_COLL  		= require('../databases/car_characteristic-coll');

/**
 * MODELS
 */
const IMAGE_MODEL                = require('../../image/models/image').MODEL;
const TOKEN_MODEL                = require('../../token/models/token').MODEL;

class Model extends BaseModel {
    constructor() {
        super(CAR_CHARACTERISTIC_COLL);
        this.STATUS_ACTIVE = 1;
        this.STATUS_INACTIVE = 0;
        this.STATUS_DELETED = 2;
    }

	insert({ carID, characteristicID, status = 1 }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(carID) || !ObjectID.isValid(characteristicID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                if(status && ![this.STATUS_ACTIVE, this.STATUS_INACTIVE].includes(+status))
                    return resolve({ error: true, message: 'Trạng thái không hợp lệ' });

                let dataInsert = {
                    carID, 
                    characteristicID,
                    status
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình tạo đặc điểm của xe' });

                return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    removeAllCarCharacteristicToInactive({ carID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(carID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });
                
                let resultAfterRemove = await CAR_CHARACTERISTIC_COLL.remove({ 
                    carID,
                    status: this.STATUS_ACTIVE
                });
                if(!resultAfterRemove)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình xóa đặc điểm của xe' });

                return resolve({ error: false, data: resultAfterRemove });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

}

exports.MODEL = new Model;
