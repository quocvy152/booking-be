'use strict';

/**
 * EXTERNAL PACKAGES
 */
const ObjectID                      = require('mongoose').Types.ObjectId;
const jwt                           = require('jsonwebtoken');
const { hash, hashSync, compare }   = require('bcryptjs');
const _                             = require('lodash');

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
const CAR_COLL  					= require('../databases/car-coll');

/**
 * MODELS
 */
const IMAGE_MODEL                = require('../../image/models/image').MODEL;
const TOKEN_MODEL                = require('../../token/models/token').MODEL;
const CAR_CHARACTERISTIC_MODEL   = require('../../characteristic/models/car_characteristic').MODEL;
const CHARACTERISTIC_MODEL       = require('../../characteristic/models/characteristic').MODEL;
class Model extends BaseModel {
    constructor() {
        super(CAR_COLL);
        this.ADMIN_ROLE = 0;
        this.USER_ROLE  = 1;
        this.STATUS_ACTIVE = 1;
        this.STATUS_INACTIVE = 0;
        this.STATUS_DELETED = 2;
    }

	insert({ name, provinceID, districtID, wardID, provinceText, districtText, wardText, address, price, mortage, rules, userID, brandID, description, avatar, gallery = [], status = 1, listCharacteristicID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ. Vui lòng kiểm tra thông tin chủ xe' });

                if(!ObjectID.isValid(brandID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ. Vui lòng kiểm tra thông tin thương hiệu' });

                if(!name)
                    return resolve({ error: true, message: 'Vui lòng nhập tên xe' });

                if(!provinceID || !districtID || !wardID || !address)
                    return resolve({ error: true, message: 'Vui lòng nhập đầy đủ thông tin địa chỉ' });

                if(!price)
                    return resolve({ error: true, message: 'Vui lòng nhập giá thuê xe' });
                
                if(Number(price) <= 0)
                    return resolve({ error: true, message: 'Giá thuê xe không hợp lệ' });

                if(!mortage)
                    return resolve({ error: true, message: 'Vui lòng nhập thông tin tài sản thế chấp' });
                
                if(!rules)
                    return resolve({ error: true, message: 'Vui lòng nhập điều khoản khi thuê xe' });

                if(!description)
                    return resolve({ error: true, message: 'Vui lòng nhập mô tả của xe' });

                if(status && ![this.STATUS_ACTIVE, this.STATUS_INACTIVE].includes(+status))
                    return resolve({ error: true, message: 'Trạng thái không hợp lệ' });

                let dataInsert = {
                    name, 
                    provinceID, 
                    districtID, 
                    wardID, 
                    provinceText, 
                    districtText, 
                    wardText, 
                    address, 
                    price, 
                    mortage, // tài sản thế chấp
                    rules, 
                    userID, 
                    brandID, 
                    description,
                    status
                }

                if(avatar) {
                    let { name, size, urlImgServer: path } = avatar;

                    let resultInsertImage = await IMAGE_MODEL.insert({ name, size, path });
                    if(resultInsertImage.error) return resolve(resultInsertImage);

                    dataInsert.avatar = resultInsertImage.data._id;
                }

                if(gallery && gallery.lenght) {
                    let listPromise = gallery.map(galleryItem => IMAGE_MODEL.insert({
                        name: galleryItem.name,
                        size: galleryItem.size,
                        path: galleryItem.path
                    }));

                    let resultAfterPromiseAll = await Promise.all(listPromise);
                    let listImageGalleryID = resultAfterPromiseAll.map(resultImage => resultImage.data._id);

                    dataInsert.gallery = listImageGalleryID;
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình tạo xe' });

                listCharacteristicID = listCharacteristicID && listCharacteristicID.split(',');
                if(listCharacteristicID && listCharacteristicID.length) {
                    let listPromise = await listCharacteristicID.map(characteristic => CAR_CHARACTERISTIC_MODEL.insert({ 
                        carID: infoAfterInsert._id,
                        characteristicID: characteristic
                    }));

                    let resultAfterPromiseAll = await Promise.all(listPromise);
                }

                return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    getInfo({ carID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(carID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let infoCar = await CAR_COLL.findById(carID).populate({
                    path: 'brandID userID avatar gallery',
                    select: 'name firstName lastName path'
                });
                if(!infoCar)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy thông tin xe' });

                return resolve({ error: false, data: infoCar });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	update({ carID, name, provinceID, districtID, wardID, provinceText, districtText, wardText, address, price, mortage, rules, brandID, description, avatar, gallery, status, listCharacteristicID }) {
        return new Promise(async resolve => {
            try {
                let dataUpdate = {};

                if(brandID && !ObjectID.isValid(brandID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ. Vui lòng kiểm tra thông tin thương hiệu' });

                if(name) {
                    let isExist = await CAR_COLL.findOne({
                        _id: { $ne: carID },
                        name
                    });
                    if(isExist)
                        return resolve({ error: true, message: 'Tên xe đã tồn tại' });

                    dataUpdate.name = name;
                }

                if(price) {
                    if(Number(price) <= 0)
                        return resolve({ error: true, message: 'Giá thuê xe không hợp lệ' });

                    price && (dataUpdate.price = price);
                }

                provinceID   && (dataUpdate.provinceID = provinceID);
                provinceText && (dataUpdate.provinceText = provinceText);
                districtID   && (dataUpdate.districtID = districtID);
                districtText && (dataUpdate.districtText = districtText);
                wardID       && (dataUpdate.wardID = wardID);
                wardText     && (dataUpdate.wardText = wardText);
                address      && (dataUpdate.address = address);
                mortage      && (dataUpdate.mortage = mortage);
                rules        && (dataUpdate.rules = rules);
                description  && (dataUpdate.description = description);

                if(status) {
                    if(![this.STATUS_ACTIVE, this.STATUS_INACTIVE].includes(+status))
                        return resolve({ error: true, message: 'Trạng thái không hợp lệ' });

                    dataUpdate.status = +status;
                }

                if(avatar) {
                    let { name, size, urlImgServer: path } = avatar;

                    let resultInsertImage = await IMAGE_MODEL.insert({ name, size, path });
                    if(resultInsertImage.error) return resolve(resultInsertImage);

                    dataUpdate.avatar = resultInsertImage.data._id;
                }

                if(gallery && gallery.lenght) {
                    let listPromise = gallery.map(galleryItem => IMAGE_MODEL.insert({
                        name: galleryItem.name,
                        size: galleryItem.size,
                        path: galleryItem.path
                    }));

                    let resultAfterPromiseAll = await Promise.all(listPromise);
                    let listImageGalleryID = resultAfterPromiseAll.map(resultImage => resultImage.data._id);

                    dataUpdate.gallery = listImageGalleryID;
                }

                let infoAfterUpdate = await CAR_COLL.findByIdAndUpdate(carID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình tạo xe' });

                listCharacteristicID = listCharacteristicID && listCharacteristicID.split(',');
                if(listCharacteristicID && listCharacteristicID.length) {
                    let resultRemoveCharacteristicCar = await CAR_CHARACTERISTIC_MODEL.removeAllCarCharacteristicToInactive({ carID });
                    if(resultRemoveCharacteristicCar.error) return resolve(resultRemoveCharacteristicCar);

                    let listPromise = await listCharacteristicID.map(characteristic => CAR_CHARACTERISTIC_MODEL.insert({ 
                        carID: infoAfterUpdate._id,
                        characteristicID: characteristic
                    }));

                    let resultAfterPromiseAll = await Promise.all(listPromise);
                }

                return resolve({ error: false, data: infoAfterUpdate })
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    updatePersonalUser({ carID, password, oldPassword, status, role }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(carID))
                    return resolve({ error: true, message: 'params_invalid' });

                let checkExists = await CAR_COLL.findById(carID);
                if(!checkExists)
                    return resolve({ error: true, message: 'user_is_not_exists' });

				if(oldPassword){
					let isMatchPass = await compare(oldPassword, checkExists.password);
					if (!isMatchPass) 
						return resolve({ error: true, message: 'old_password_wrong' });
				}

                let dataUpdateUser = {};
                password && (dataUpdateUser.password    = hashSync(password, 8));

                if([0,1,2].includes(+role)){
                    dataUpdateUser.role = role;
                }

				if([0,1].includes(+status)){
					dataUpdateUser.status = status;
				}

                await this.updateWhereClause({ _id: carID }, dataUpdateUser);
                password && delete dataUpdateUser.password;

                return resolve({ error: false, data: dataUpdateUser });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    remove({ carID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(carID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let isCarHaveBooking = await BOOKING_MODEL.isCarHaveBooking({ carID });
                if(isCarHaveBooking.error) return resolve(isCarHaveBooking);

                let dataUpdate = {
                    status: this.STATUS_DELETED
                };

				let infoAfterDelete = await CAR_COLL.findByIdAndUpdate(carID, dataUpdate, { new: true });
                if(!infoAfterDelete) 
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình xóa xe' });

                return resolve({ error: false, data: infoAfterDelete });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getList({ name, brand, page, limit }){
        return new Promise(async resolve => {
            try {
                page  = +page || 1;
                limit = +limit || 8;  

                let condition = {};

                if(name) {
                    let key = name.split(" ");
                    key = '.*' + key.join(".*") + '.*';
                    condition.name = new RegExp(key, 'i');
                }

                if(brand) 
                    if(ObjectID.isValid(brand)) 
                        condition.brandID = brand;

                condition.status = this.STATUS_ACTIVE

                let listCarNonPagination = await CAR_COLL.find(condition);

                let listCar = await CAR_COLL
                                    .find(condition)
                                    .skip((page - 1) * limit)
                                    .limit(limit)
                                    .populate({
                                        path: 'brandID userID avatar',
                                        select: 'name icon firstName lastName path size avatar phone',
                                        populate: {
                                            path: 'avatar',
                                            select: 'size path'
                                        }
                                    })
                                    .sort({ name: 1 });
                if(!listCar)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy danh sách xe' });

                let listCarRes = [];
                for await (let car of listCar) {
                    let listCharacteristicOfCar = await CAR_CHARACTERISTIC_MODEL.getListByCar({ carID: car._id });
                    listCarRes[listCarRes.length++] = {
                        infoCar: car,
                        details: listCharacteristicOfCar && listCharacteristicOfCar.data
                    }
                }

                return resolve({ 
                    error: false, 
                    data: listCarRes,
                    totalPages: listCarNonPagination.length > 0 ? Math.ceil(listCarNonPagination.length / limit) : 0,
                    totalCars: listCarNonPagination.length,
                    page,
                    limit,
                });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getListMyCar({ userID, name }){
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });
                
                let condition = {
                    status: this.STATUS_ACTIVE,
                    userID
                }

                if(name != 'undefined' && name) {
                    let key = name.split(" ");
                    key = '.*' + key.join(".*") + '.*';
                    condition.name = new RegExp(key, 'i');
                }

                let listCar = await CAR_COLL.find(condition).populate({
                    path: 'brandID userID avatar',
                    select: 'name icon firstName lastName size path avatar phone',
                    populate: {
                        path: 'avatar',
                        select: 'size path'
                    }
                }).sort({ name: 1 });
                if(!listCar)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy danh sách xe' });

                let listCarRes = [];
                for await (let car of listCar) {
                    let listCharacteristicOfCar = await CAR_CHARACTERISTIC_MODEL.getListByCar({ carID: car._id });
                    listCarRes[listCarRes.length++] = {
                        infoCar: car,
                        details: listCharacteristicOfCar && listCharacteristicOfCar.data
                    }
                }

                return resolve({ error: false, data: listCarRes });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    checkIsOwnerOfCar({ userID, carID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID) || !ObjectID.isValid(carID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' })

                let isOwnerOfCar = await CAR_COLL.findOne({ _id: carID, userID });
                if(isOwnerOfCar)
                    return resolve({
                        error: true,
                        message: 'Người dùng không thể tự thuê xe của chính mình' 
                    });

                return resolve({
                    error: false,
                    message: 'OK. Người dùng không phải là chủ của xe này' 
                });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

}

exports.MODEL = new Model;

var BOOKING_MODEL              = require('../../booking/models/booking').MODEL;