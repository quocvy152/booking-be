"use strict";

const jwt 			= require('jsonwebtoken');
const cfJwt 		= require('./cf_jws');
const { networkInterfaces } = require('os');

const { 
	ADMIN_ACCESS, 
	EDITER_ACCESS, 
	OWNER_ACCESS, 
	TYPE_RESPONSE
} = require('../utils/constant');

const { checkAndResponseForEachEnv, getParams, getData } = require('./helpers');
const BEHAVIOR_MODEL = require("../packages/users/models/behavior").MODEL;
/**
 * LẤY IP ADDRESS
 */
//  const nets = networkInterfaces();
//  const IPAddress = {}; // Or just '{}', an empty object
 
//  for (const name of Object.keys(nets)) {
// 	 for (const net of nets[name]) {
// 		 // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
// 		 if (net.family === 'IPv4' && !net.internal) {
// 			 if (!IPAddress[name]) {
// 				 IPAddress[name] = [];
// 			 }
// 			 IPAddress[name].push(net.address);
// 		 }
// 	 }
//  }

module.exports = {
    role: {
        all: {
            bin: 1,     
            auth: (req, res, next) => {
				let { envAccess, token } = getParams(req);
				
				if (!token) {
					req.customer	= {};
					req.envAccess   = envAccess;
					next()
				} else {
					jwt.verify(token, cfJwt.secret, async (error, decoded) => {
						if (error) {
							return checkAndResponseForEachEnv({ 
								res,
								envAccess,
								typeResponse: TYPE_RESPONSE.TOKEN_INVALID
							});
						}
	
						if (+decoded.status === 0) {
							return checkAndResponseForEachEnv({ 
								res, 
								envAccess, 
								typeResponse: TYPE_RESPONSE.PERMISSION_DENIED
							});
						}
						// let obj = getData(req);
						// let objData = {
						// 	...obj,
						// 	user:        decoded._id,
						// 	IPAddress,
						// 	envAccess,
						// 	role:        decoded.role
						// }
						// let infoAfterInsert = await BEHAVIOR_MODEL.insert({...objData});
						
						req.customer	= decoded;
						req.envAccess   = envAccess;
						next();
					});
				}
			} 
        },
        admin: {
            bin: 2,
            auth: (req, res, next) => {
				let { envAccess, token } = getParams(req);

				if(!token){
					return checkAndResponseForEachEnv({
						res,
						envAccess,
						typeResponse: TYPE_RESPONSE.NOT_PROVIDE_TOKEN
					})
				}

				jwt.verify(token, cfJwt.secret, async (error, decoded) => {
					if (error) {
						return checkAndResponseForEachEnv({ 
							res,
							envAccess,
							typeResponse: TYPE_RESPONSE.TOKEN_INVALID
						});
					}

					if (!ADMIN_ACCESS.includes(+decoded.role)) {
						return checkAndResponseForEachEnv({ 
							res, 
							envAccess, 
							typeResponse: TYPE_RESPONSE.PERMISSION_DENIED
						});
					}

					// let obj = getData(req);
					// let objData = {
					// 	...obj,
					// 	user:        decoded._id,
					// 	IPAddress,
					// 	envAccess,
					// 	role:        decoded.role
					// }
					// let infoAfterInsert = await BEHAVIOR_MODEL.insert({...objData});
					req.user 		= decoded;
					req.envAccess   = envAccess;
					next();
				});
            }
        },
		owner: {
            bin: 3,
            auth: (req, res, next) => {
				let { envAccess, token } = getParams(req);

				if(!token){
					return checkAndResponseForEachEnv({
						res,
						envAccess,
						typeResponse: TYPE_RESPONSE.NOT_PROVIDE_TOKEN
					})
				}

				jwt.verify(token, cfJwt.secret, async (error, decoded) => {
					if (error) {
						return checkAndResponseForEachEnv({ 
							res,
							envAccess,
							typeResponse: TYPE_RESPONSE.TOKEN_INVALID
						});
					}

					if (!OWNER_ACCESS.includes(+decoded.role)) {
						return checkAndResponseForEachEnv({ 
							res, 
							envAccess, 
							typeResponse: TYPE_RESPONSE.PERMISSION_DENIED
						});
					}

					// let obj = getData(req);
					// let objData = {
					// 	...obj,
					// 	user:        decoded._id,
					// 	IPAddress,
					// 	envAccess,
					// 	role:        decoded.role
					// }
					// let infoAfterInsert = await BEHAVIOR_MODEL.insert({...objData});

					req.user 		= decoded;
					req.envAccess   = envAccess;
					next();
				});
            }
        },
        editer: {
            bin: 4,
            auth: (req, res, next) => {
				let { envAccess, token } = getParams(req);

				if(!token){
					return checkAndResponseForEachEnv({
						res,
						envAccess,
						typeResponse: TYPE_RESPONSE.NOT_PROVIDE_TOKEN
					})
				}

				jwt.verify(token, cfJwt.secret, async (error, decoded) => {
					if (error) {
						return checkAndResponseForEachEnv({ 
							res,
							envAccess,
							typeResponse: TYPE_RESPONSE.TOKEN_INVALID
						});
					}

					if (!EDITER_ACCESS.includes(+decoded.role)) {
						return checkAndResponseForEachEnv({ 
							res, 
							envAccess, 
							typeResponse: TYPE_RESPONSE.PERMISSION_DENIED
						});
					}
					// let obj = getData(req);
					// let objData = {
					// 	...obj,
					// 	user:        decoded._id,
					// 	IPAddress,
					// 	envAccess,
					// 	role:        decoded.role
					// }
					// let infoAfterInsert = await BEHAVIOR_MODEL.insert({...objData});
					
					req.user 		= decoded;
					req.envAccess   = envAccess;
					next();
				});
            }
        },
		customer: {
            bin: 5,
            auth: (req, res, next) => {
				let { envAccess, token } = getParams(req);
				// console.log({ token });
				if(!token){
					return checkAndResponseForEachEnv({
						res,
						envAccess,
						typeResponse: TYPE_RESPONSE.NOT_PROVIDE_TOKEN
					})
				}

				jwt.verify(token, cfJwt.secret, async (error, decoded) => {
					if (error) {
						return checkAndResponseForEachEnv({ 
							res,
							envAccess,
							typeResponse: TYPE_RESPONSE.TOKEN_INVALID
						});
					}

					if (+decoded.status === 0) {
						return checkAndResponseForEachEnv({ 
							res, 
							envAccess, 
							typeResponse: TYPE_RESPONSE.PERMISSION_DENIED
						});
					}
					// let obj = getData(req);
					// let objData = {
					// 	...obj,
					// 	user:        decoded._id,
					// 	IPAddress,
					// 	envAccess,
					// 	role:        decoded.role
					// }
					// let infoAfterInsert = await BEHAVIOR_MODEL.insert({...objData});
					
					req.customer	= decoded;
					req.envAccess   = envAccess;
					next();
				});
            }
        }
    },

    authorization: function (req, res, next) {
        let hasRole = false;
        let currentRole = null;

        for (let itemRole in this.role) {
            if (!hasRole) {
                if (res.bindingRole.config.auth.includes(this.role[ itemRole ].bin)) {
                    hasRole = true;
                    currentRole = this.role[ itemRole ];
                }
            }
        }
		
        currentRole.auth(req, res, next);
    }
};