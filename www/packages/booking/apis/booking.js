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
                        const { name, brand } = req.query;
                        const resultListBooking = await BOOKING_MODEL.getList({ name, brand });
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
                        const { type, name } = req.query;
                        const resultListBooking = await BOOKING_MODEL.getListMyBooking({ user: userID, type, name });
                        res.json(resultListBooking);
                    }],
                },
            },

            /**
             * Function: 
             *      + List another user booking my car
             * Date: 25/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BOOKING.LIST_CUSTOMER_BOOKING_MY_CAR]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const { _id: userID } = req.user;
                        const { type, name } = req.query;
                        const resultListBooking = await BOOKING_MODEL.getListCustomerBookingMyCar({ user: userID, type, name });
                        res.json(resultListBooking);
                    }],
                },
            },

            /**
             * Function: 
             *      + List accept booking
             * Date: 26/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BOOKING.ACCEPT_BOOKINGS]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    put: [ async (req, res) => {
                        const { bookingID } = req.query;
                        const resultAcceptBooking = await BOOKING_MODEL.acceptBooking({ bookingID });
                        res.json(resultAcceptBooking);
                    }],
                },
            },

            /**
             * Function: 
             *      + List accept booking
             * Date: 26/08/2022
             * Dev: VyPQ
             */
             [CF_ROUTINGS_BOOKING.ACCEPT_PAYING]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    put: [ async (req, res) => {
                        const { bookingID } = req.query;
                        const resultAcceptPaying = await BOOKING_MODEL.acceptPaying({ bookingID });
                        res.json(resultAcceptPaying);
                    }],
                },
            },

            /**
             * Function: 
             *      + List cancel booking
             * Date: 26/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BOOKING.CANCEL_BOOKINGS]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    put: [ async (req, res) => {
                        const { bookingID } = req.query;
                        const resultCancelBooking = await BOOKING_MODEL.cancelBooking({ bookingID });
                        res.json(resultCancelBooking);
                    }],
                },
            },

            /**
             * Function: 
             *      + List accept booking
             * Date: 26/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BOOKING.PAYED_BOOKINGS]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    put: [ async (req, res) => {
                        const { bookingID } = req.query;
                        const resultPayBooking = await BOOKING_MODEL.payBooking({ bookingID });
                        res.json(resultPayBooking);
                    }],
                },
            },

            /**
             * Function: 
             *      + Add booking (API)
             *      + List booking (API)
             * Date: 19/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BOOKING.LIST_BOOKING_ADMIN]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const { status } = req.query;
                        const resultListBooking = await BOOKING_MODEL.getListAdmin({ status });
                        res.json(resultListBooking);
                    }],
                },
            },

            /**
             * Function: 
             *      + Add booking (API)
             *      + List booking (API)
             * Date: 19/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BOOKING.LIST_BOOKING_OF_CAR]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const { car, type } = req.query;
                        const resultListBookingOfCar = await BOOKING_MODEL.getListBookingOfCar({ carID: car, type });
                        res.json(resultListBookingOfCar);
                    }],
                },
            },

            /**
             * Function: 
             *      + Add booking (API)
             *      + List booking (API)
             * Date: 19/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BOOKING.LIST_BOOKING_FILTER]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const { car, type } = req.query;
                        const resultListBookingFilter = await BOOKING_MODEL.getListBooking({ carID: car, type });
                        res.json(resultListBookingFilter);
                    }],
                },
            },

            /**
             * Function: 
             *      + Add booking (API)
             *      + List booking (API)
             * Date: 19/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BOOKING.GET_TURNOVER_AND_TOTAL_BOOKING_OF_USER]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const resultTurnoverAndBooking = await BOOKING_MODEL.getTurnoverAndTotalBooking();
                        res.json(resultTurnoverAndBooking);
                    }],
                },
            },
        }
    }
};
