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
const CAR_CHARACTERISTIC_MODEL      = require('../../characteristic/models/car_characteristic').MODEL;

/**
 * COLLECTIONS, MODELS
 */
const FAVOURITE_COLL  				= require('../databases/favourite-coll');

class Model extends BaseModel {
    constructor() {
        super(FAVOURITE_COLL);
		this.STATUS_INACTIVE = 0;
        this.STATUS_ACTIVE   = 1;
        this.STATUS_REMOVED  = 2;
    }

    /**
     * TẠO FAVOURITE
     */
	insert({ carID, userID, status = this.STATUS_ACTIVE }) {
        return new Promise(async resolve => {
            try {
				if(!ObjectID.isValid(carID) || !ObjectID.isValid(userID))
					return resolve({ error: true, message: 'Tham số không hợp lệ' });

                // This case is created FAVOURITE record
                let isExistFavourite = await FAVOURITE_COLL.findOne({ car: carID, user: userID });
                if(isExistFavourite) {
                    if(isExistFavourite.status == this.STATUS_INACTIVE || isExistFavourite.status == this.STATUS_REMOVED) {
                        let infoFavouriteAfterUpdate = await FAVOURITE_COLL.findByIdAndUpdate(isExistFavourite._id, { status: this.STATUS_ACTIVE }, { new: true });
                        return resolve({ error: false, data: infoFavouriteAfterUpdate });
                    }
                    return resolve({ error: false, data: isExistFavourite });
                }

                let dataInsert = {
                    car: carID, 
                    user: userID,
                    status: +status 
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình tạo record FAVOURITE' });

				return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * BỎ YÊU THÍCH
     */
	unFavourite({ favouriteID }) {
        return new Promise(async resolve => {
            try {
				if(!ObjectID.isValid(favouriteID))
					return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let infoFavouriteAfterUpdate = await FAVOURITE_COLL.findByIdAndUpdate(favouriteID, { status: this.STATUS_INACTIVE }, { new: true });
                if(!infoFavouriteAfterUpdate) 
				    return resolve({ error: false, message: 'Xảy ra lỗi trong quá trình bỏ yêu thích' });

				return resolve({ error: false, data: infoFavouriteAfterUpdate, message: 'Bạn đã loại bỏ xe này ra khỏi danh sách yêu thích' });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * DANH SÁCH YÊU THÍCH CỦA MỘT USER
     */
	getListFavouriteOfUser({ userID, name }) {
        return new Promise(async resolve => {
            try {
				if(!ObjectID.isValid(userID))
					return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let listFavouriteOfUser = await FAVOURITE_COLL
                                            .find({ user: userID, status: this.STATUS_ACTIVE })
                                            .populate({
                                                path: 'user car',
                                                populate: {
                                                    path: 'brandID userID avatar gallery',
                                                    select: 'name icon firstName lastName path size avatar phone',
                                                    populate: {
                                                        path: 'avatar',
                                                        select: 'size path'
                                                    }
                                                }
                                            })
                                            .lean();

                let listCarFavouriteRes = [];
                for await (let favourite of listFavouriteOfUser) {
                    let listCharacteristicOfCar = await CAR_CHARACTERISTIC_MODEL.getListByCar({ carID: favourite.car._id });
                    listCarFavouriteRes[listCarFavouriteRes.length++] = {
                        favouriteID: favourite._id,
                        infoCar: favourite.car,
                        details: listCharacteristicOfCar && listCharacteristicOfCar.data
                    }
                } 
                
                if(name != 'undefined' && name) {
                    let listCarAfterFilter = listCarFavouriteRes.filter(car => car.infoCar.name.toLowerCase().includes(name.toLowerCase()));
                    return resolve({ error: false, data: listCarAfterFilter });
                }

                return resolve({ error: false, data: listCarFavouriteRes });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;
