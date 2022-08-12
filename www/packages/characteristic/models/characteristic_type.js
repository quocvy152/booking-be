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
                console.log({ code });

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

    getInfo({ characteristicTypeID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(characteristicTypeID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let infoUser = await CHARACTERISTIC_TYPE_COLL.findById(characteristicTypeID);
                if(!infoUser)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy thông tin loại đặc điểm' });

                return resolve({ error: false, data: infoUser });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	update({ characteristicTypeID, username, email, currentPass, newPass, confirmPass, status, role, firstName, lastName, address, phone, avatar }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(characteristicTypeID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let infoUser = await CHARACTERISTIC_TYPE_COLL.findById(characteristicTypeID);
                if(!infoUser)
                    return resolve({ error: true, message: 'Mã ID loại đặc điểm không hợp lệ' });

                let emailValid 	  = email.toLowerCase().trim();
                let usernameValid = username.toLowerCase().trim();
                let phoneValid    = phone.toLowerCase().trim();

                let checkExists = await CHARACTERISTIC_TYPE_COLL.findOne({
                    _id: { $ne: characteristicTypeID },
                    $or: [
                        { username: usernameValid },
                        { email: emailValid },
                        { phone: phoneValid },
                    ]
                });
                if(checkExists)
                    return resolve({ error: true, message: 'Tên loại đặc điểm hoặc email hoặc số điện thoại đã tồn tại' });

				if(role && ![this.ADMIN_ROLE, this.USER_ROLE].includes(+role))
					return resolve({ error: true, message: 'Quyền không hợp lệ' });

				if(status && ![this.STATUS_ACTIVE, this.STATUS_INACTIVE].includes(+status))
					return resolve({ error: true, message: 'Trạng thái không hợp lệ' });

                let dataUpdate = {};

                username && (dataUpdate.username = username);
                email    && (dataUpdate.email = email);
                phone    && (dataUpdate.phone = phone);
                role     && (dataUpdate.role = +role);
                status   && (dataUpdate.status = +status);

                // Bước kiểm tra và đổi mật khẩu
                if(!confirmPass || !currentPass || !newPass)
					return resolve({ error: true, message: 'Vui lòng nhập đẩy đủ các thông tin về mật khẩu để tiến hành thay đổi mật khẩu' });
                else {
                    let isCorrectPass = await compare(currentPass, infoUser.password);
                    if(!isCorrectPass)
					    return resolve({ error: true, message: 'Mật khẩu không chính xác. Vui lòng thử lại' });
                    
                    if(confirmPass !== newPass)
					    return resolve({ error: true, message: 'Mật khẩu xác nhận không chính xác. Vui lòng thử lại' });

                    let hashPassword = await hash(newPass, 8);
                    if (!hashPassword)
                        return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình hash mật khẩu' });

                    dataUpdate.password = hashPassword;
                }

				firstName && (dataUpdate.firstName = firstName);
				lastName  && (dataUpdate.lastName = lastName);
				address   && (dataUpdate.address = address);

                if(avatar) {
                    let resultInsertImage = await IMAGE_MODEL.insert(dataUpdate);
                    if(resultInsertImage.error)
					    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình thêm ảnh đại diện' });
                    
				    dataUpdate.avatar = resultInsertImage.data._id;
                }

                let infoAfterUpdate = await CHARACTERISTIC_TYPE_COLL.findByIdAndUpdate(characteristicTypeID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình cập nhật loại đặc điểm' });

                return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    updatePersonalUser({ characteristicTypeID, password, oldPassword, status, role }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(characteristicTypeID))
                    return resolve({ error: true, message: 'params_invalid' });

                let checkExists = await CHARACTERISTIC_TYPE_COLL.findById(characteristicTypeID);
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

                await this.updateWhereClause({ _id: characteristicTypeID }, dataUpdateUser);
                password && delete dataUpdateUser.password;

                return resolve({ error: false, data: dataUpdateUser });
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
                let listCharacteristicType = await CHARACTERISTIC_TYPE_COLL.find({}).lean();
                if(!listCharacteristicType)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy danh sách loại đặc điểm' });

                return resolve({ error: false, data: listCharacteristicType });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    login({ username, email, password }) {
        return new Promise(async resolve => {
            try {
                let checkExists = await CHARACTERISTIC_TYPE_COLL.findOne({ 
                    $or: [
                        { username: username && username.toLowerCase().trim() },
                        { email: email && email.toLowerCase().trim() }
                    ]
                });
                if (!checkExists) 
                    return resolve({ error: true, message: 'Username hoặc Email không tồn tại' });

                let isMatchPass = await compare(password, checkExists.password);
                if (!isMatchPass) 
                    return resolve({ error: true, message: 'Mật khẩu không chính xác' });

                if (checkExists.status == this.STATUS_INACTIVE) 
                    return resolve({ error: true, message: 'loại đặc điểm đang bị khóa. Vui lòng liên hệ quản trị viên' });

                let infoUser = {
                    _id: checkExists._id,
                    username: checkExists.username,
                    firstName: checkExists.firstName,
                    lastName: checkExists.lastName,
                    email: checkExists.email,
                    phone: checkExists.phone,
                    address: checkExists.address,
                    status: checkExists.status,
                    role: checkExists.role,
                }

                let isExistToken = await TOKEN_MODEL.getInfo({ characteristicTypeID: checkExists._id });
                let token;
                if(isExistToken.error) {
                    token = jwt.sign(infoUser, cfJWS.secret);

                    let resultInsertToken = await TOKEN_MODEL.insert({ characteristicTypeID: checkExists._id, token });
                    if(resultInsertToken.error) 
                        return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình cấp TOKEN' });
                } else token = isExistToken.data.token;

                return resolve({
                    error: false,
                    data: { user: infoUser, token }
                });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

}

exports.MODEL = new Model;
