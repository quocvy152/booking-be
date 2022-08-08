"use strict";

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
const USER_COLL  					= require('../databases/user-coll');


class Model extends BaseModel {
    constructor() {
        super(USER_COLL);
    }

	insert({ username, email, password, role, status = 1 }) {
        return new Promise(async resolve => {
            try {
                if(!username || !email)
                    return resolve({ error: true, message: 'params_invalid' });

                let emailValid 	  = email.toLowerCase().trim();
                let usernameValid = username.toLowerCase().trim();

                let checkExists = await USER_COLL.findOne({
                    $or: [
                        { username: usernameValid },
                        { email: emailValid },
                    ]
                });
                if(checkExists)
                    return resolve({ error: true, message: "name_or_email_existed" });

				if(![0,1,2].includes(+role))
					return resolve({ error: true, message: "role_invalid" });

				if(![0,1].includes(+status))
					return resolve({ error: true, message: "status_invalid" });

                let dataInsert = {
                    username: usernameValid, 
                    email: emailValid,
					status,
					role
                }

                let hashPassword = await hash(password, 8);
				if (!hashPassword)
					return resolve({ error: true, message: 'cannot_hash_password' });

				dataInsert.password = hashPassword;
                let infoAfterInsert = await this.insertData(dataInsert);

                if(!infoAfterInsert)
                    return resolve({ error: true, message: 'create_user_failed' });

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
                    return resolve({ error: true, message: "params_invalid" });

                let infoUser = await USER_COLL.findById(userID);
                if(!infoUser)
                    return resolve({ error: true, message: "user_is_not_exists" });

                return resolve({ error: false, data: infoUser });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	update({ userID, username, password, status, role }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: "params_invalid" });

                let checkExists = await USER_COLL.findById(userID);
                if(!checkExists)
                    return resolve({ error: true, message: "user_is_not_exists" });

                let checkUsernameExists = await USER_COLL.findOne({ username, _id: { $nin: [userID] } });
                if(checkUsernameExists) {
                    return resolve({ error: true, message: 'username_is_exists' });
                }

                let dataUpdateUser = {};
                username && (dataUpdateUser.username    = username.trim());
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

    updatePersonalUser({ userID, password, oldPassword, status, role }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: "params_invalid" });

                let checkExists = await USER_COLL.findById(userID);
                if(!checkExists)
                    return resolve({ error: true, message: "user_is_not_exists" });

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

    delete({ userID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: "param_invalid" });

				let infoAfterDelete = await USER_COLL.findByIdAndRemove(userID);

                if(!infoAfterDelete) 
                    return resolve({ error: true, message: "cannot_delete_user" });

                return resolve({ error: false, data: infoAfterDelete });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getList(){
        return new Promise(async resolve => {
            try {
                let listUsers = await USER_COLL.find({}).lean();
                if(!listUsers)
                    return resolve({ error: true, message: "not_found_users_list" });

                return resolve({ error: false, data: listUsers });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    signIn({ email, password }) {
        return new Promise(async resolve => {
            try {
                let checkExists = await USER_COLL.findOne({ email: email.toLowerCase().trim() });
                if (!checkExists) 
                    return resolve({ error: true, message: 'email_not_exist' });

                let isMatchPass = await compare(password, checkExists.password);
                if (!isMatchPass) 
                    return resolve({ error: true, message: 'password_is_wrong' });

                if (checkExists.status == 0) 
                    return resolve({ error: true, message: 'user_blocked' });

                let infoUser = {
                    _id: checkExists._id,
                    username: checkExists.username,
                    email: checkExists.email,
                    status: checkExists.status,
                    role: checkExists.role,
                }
                let token = jwt.sign(infoUser, cfJWS.secret);

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
