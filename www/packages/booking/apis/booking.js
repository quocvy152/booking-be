"use strict";

/**
 * EXTERNAL PACKAGE
 */
const path = require('path');

/**
 * INTERNAL PACKAGE
 */
const ChildRouter                           = require('../../../routing/child_routing');
const roles                                 = require('../../../config/cf_role');
const { CF_ROUTINGS_BOOKING } 				= require('../constants/booking.uri');

/**
 * MODELS
 */
const BOOKING_MODEL 	= require('../models/booking').MODEL;

/**
 * COLLECTION
 */
const BOOKING_COLL 	= require('../databases/booking-coll');

module.exports = class Auth extends ChildRouter {
    constructor() {
        super('/');
    }

    registerRouting() {
        return {
            /**
             * ========================== ****************** ================================
             * ========================== QUẢN LÝ THƯƠNG HIỆU  ==============================
             * ========================== ****************** ================================
             */

			/**
             * Function: 
             *      + Add booking (API)
             *      + List booking (API)
             * Date: 19/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BOOKING.BOOKINGS]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const resultListBooking = await BOOKING_MODEL.getList();
                        res.json(resultListBooking);
                    }],
                    post: [ async (req, res) => {
                        const { userID, carID, startTime, endTime, pickUpPlace, dropOffPlace, price, status } = req.body;
                        const resultAddBooking = await BOOKING_MODEL.insert({ 
                            userID, carID, startTime, endTime, pickUpPlace, dropOffPlace, price, status
                        });
                        res.json(resultAddBooking);
                    }]
                },
            },

            /**
             * Function: 
             *      + Info booking (API)
             *      + Update booking (API)
             *      + Remove booking (API)
             * Date: 10/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BOOKING.BOOKINGS_BOOKINGID]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const { bookingID } = req.params;
                        const resultInfoBooking = await BOOKING_MODEL.getInfo({ bookingID });
                        res.json(resultInfoBooking);
                    }],
                    put: [ async (req, res) => {
                        const { bookingID } = req.params;
                        const { name, icon, status } = req.body;
                        const resultAddBooking = await BOOKING_MODEL.update({ 
                            bookingID, name, status, icon
                        });
                        res.json(resultAddBooking);
                    }],
                    delete: [ async (req, res) => {
                        const { bookingID } = req.params;
                        const resultRemoveBooking = await BOOKING_MODEL.remove({ bookingID });
                        res.json(resultRemoveBooking);
                    }]
                },
            },

            /**
             * Function: 
             *      + List booking of user
             * Date: 25/08/2022
             * Dev: VyPQ
             */
             [CF_ROUTINGS_BOOKING.LIST_MY_BOOKINGS]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const { _id: userID } = req.user;
                        const { type } = req.query;
                        const resultListBooking = await BOOKING_MODEL.getListMyBooking({ user: userID, type });
                        res.json(resultListBooking);
                    }],
                },
            },
        }
    }
};
