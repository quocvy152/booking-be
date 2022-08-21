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
const { resetPassAccount }          = require('../../../mailer/module/mail_user');
const { BOOKING_URL }               = require('../../../config/cf_constants');

/**
 * BASES
 */
const BaseModel 					= require('../../../models/intalize/base_model');

/**
 * COLLECTIONS
 */
const USER_COLL  					= require('../databases/user-coll');

/**
 * MODELS
 */
const IMAGE_MODEL                = require('../../image/models/image').MODEL;
const TOKEN_MODEL                = require('../../token/models/token').MODEL;
class Model extends BaseModel {
    constructor() {
        super(USER_COLL);
        this.ADMIN_ROLE = 0;
        this.USER_ROLE  = 1;
        this.STATUS_ACTIVE = 1;
        this.STATUS_INACTIVE = 0;
        this.STATUS_DELETED = 2;
    }

	insert({ username, email, password, confirmPass, role, status = 1, firstName, lastName, address, phone, avatar }) {
        return new Promise(async resolve => {
            try {
                console.log({
                    username, 
                    email, 
                    password,
                    phone,
                    role
                })

                if(!username || !email || !phone || !password || !role)
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let emailValid 	  = email.toLowerCase().trim();
                let usernameValid = username.toLowerCase().trim();
                let phoneValid    = phone.toLowerCase().trim();

                let checkExists = await USER_COLL.findOne({
                    $or: [
                        { username: usernameValid },
                        { email: emailValid },
                        { phone: phoneValid },
                    ]
                });
                if(checkExists)
                    return resolve({ error: true, message: 'Tên người dùng hoặc email hoặc số điện thoại đã tồn tại' });

				if(![this.ADMIN_ROLE, this.USER_ROLE].includes(+role))
					return resolve({ error: true, message: 'Quyền không hợp lệ' });

				if(![this.STATUS_ACTIVE, this.STATUS_INACTIVE].includes(+status))
					return resolve({ error: true, message: 'Trạng thái không hợp lệ' });

                let dataInsert = {
                    username: usernameValid, 
                    email: emailValid,
                    phone: phoneValid,
					status,
					role
                }

                if(confirmPass !== password)
					return resolve({ error: true, message: 'Mật khẩu xác nhận không hợp lệ' });

                let hashPassword = await hash(password, 8);
				if (!hashPassword)
					return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình hash mật khẩu' });

				dataInsert.password = hashPassword;
				dataInsert.firstName = firstName;
				dataInsert.lastName = lastName;
				dataInsert.address = address;

                if(avatar) {
                    let resultInsertImage = await IMAGE_MODEL.insert(dataInsert);
                    if(resultInsertImage.error)
					    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình thêm ảnh đại diện' });
                    
				    dataInsert.avatar = resultInsertImage.data._id;
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình tạo người dùng' });

                return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    getInfo({ userID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let infoUser = await USER_COLL.findById(userID, { password: 0 });
                if(!infoUser)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy thông tin người dùng' });

                return resolve({ error: false, data: infoUser });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	update({ userID, username, email, currentPass, newPass, confirmPass, status, role, firstName, lastName, address, phone, avatar }) {
        return new Promise(async resolve => {
            try {
                console.log({
                    userID, username, email, currentPass, newPass, confirmPass, status, role, firstName, lastName, address, phone, avatar
                })
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let infoUser = await USER_COLL.findById(userID);
                if(!infoUser)
                    return resolve({ error: true, message: 'Mã ID người dùng không hợp lệ' });

                let emailValid 	  = email.toLowerCase().trim();
                let usernameValid = username.toLowerCase().trim();
                let phoneValid    = phone.toLowerCase().trim();

                let checkExists = await USER_COLL.findOne({
                    _id: { $ne: userID },
                    $or: [
                        { username: usernameValid },
                        { email: emailValid },
                        { phone: phoneValid },
                    ]
                });
                if(checkExists)
                    return resolve({ error: true, message: 'Tên người dùng hoặc email hoặc số điện thoại đã tồn tại' });

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
                if(confirmPass && currentPass && newPass) {
                    let isCorrectPass = await compare(currentPass, infoUser.password);
                    if(!isCorrectPass)
					    return resolve({ error: true, message: 'Mật khẩu không chính xác. Vui lòng thử lại' });
                    
                    if(confirmPass !== newPass)
					    return resolve({ error: true, message: 'Mật khẩu xác nhận không chính xác. Vui lòng thử lại' });

                    let hashPassword = await hash(newPass, 8);
                    if (!hashPassword)
                        return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình hash mật khẩu' });

                    dataUpdate.password = hashPassword;
                } else if(confirmPass || currentPass || newPass)
					return resolve({ error: true, message: 'Vui lòng nhập đẩy đủ các thông tin về mật khẩu để tiến hành thay đổi mật khẩu' });

				firstName && (dataUpdate.firstName = firstName);
				lastName  && (dataUpdate.lastName = lastName);
				address   && (dataUpdate.address = address);

                if(avatar) {
                    let dataImage = {
                        name: avatar.filename,
                        path: avatar.path,
                        size: avatar.size
                    }
                    let resultInsertImage = await IMAGE_MODEL.insert(dataImage);
                    if(resultInsertImage.error)
					    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình thêm ảnh đại diện' });
                    
				    dataUpdate.avatar = resultInsertImage.data._id;
                }

                let infoAfterUpdate = await USER_COLL.findByIdAndUpdate(userID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình cập nhật người dùng' });

                return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    updatePersonalUser({ userID, password, oldPassword, status, role }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: 'params_invalid' });

                let checkExists = await USER_COLL.findById(userID);
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

                await this.updateWhereClause({ _id: userID }, dataUpdateUser);
                password && delete dataUpdateUser.password;

                return resolve({ error: false, data: dataUpdateUser });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    remove({ userID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let dataUpdate = {
                    status: this.STATUS_DELETED
                };

				let infoAfterDelete = await USER_COLL.findByIdAndUpdate(userID, dataUpdate, { new: true });
                if(!infoAfterDelete) 
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình xóa người dùng' });

                return resolve({ error: false, data: infoAfterDelete });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getList(){
        return new Promise(async resolve => {
            try {
                let listUser = await USER_COLL.find({}).lean();
                if(!listUser)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy danh sách người dùng' });

                return resolve({ error: false, data: listUser });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    login({ username, email, password }) {
        return new Promise(async resolve => {
            try {
                let checkExists = await USER_COLL.findOne({ 
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
                    return resolve({ error: true, message: 'Người dùng đang bị khóa. Vui lòng liên hệ quản trị viên' });

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

                let isExistToken = await TOKEN_MODEL.getInfo({ userID: checkExists._id });
                let token;
                if(isExistToken.error) {
                    token = jwt.sign(infoUser, cfJWS.secret);

                    let resultInsertToken = await TOKEN_MODEL.insert({ userID: checkExists._id, token });
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

    resetPassword({ account }) {
        return new Promise(async resolve => {
            try {
                console.log({ account })
                if(!account)
                    return resolve({ error: true, message: 'Tham số không hợp lệ sssssss' });

                let infoUser = await USER_COLL.findOne({
                    $or: [
                        { email: account },
                        { username: account }
                    ]
                });
                if(!infoUser)
                    return resolve({ error: true, message: 'Tên tài khoản hoặc email không hợp lệ' });

                let BOOKING_SERVER = BOOKING_URL.BOOKING_SERVER;
                resetPassAccount(infoUser.email, infoUser.username, BOOKING_SERVER, 1);

                return resolve({
                    error: false,
                    data: infoUser
                });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

}

exports.MODEL = new Model;
