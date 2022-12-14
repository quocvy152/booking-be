const BASE_ROUTE = '/bookings';
const BASE_ROUTE_BOOKING_RATING = '/bookings/booking-ratings';

const CF_ROUTINGS_BOOKING = {
	BOOKINGS: `${BASE_ROUTE}`,
	LIST_BOOKING_ADMIN: `${BASE_ROUTE}/list/admin`,
	LIST_BOOKING_OF_CAR: `${BASE_ROUTE}/list/booking-of-car`,
	LIST_BOOKING_FILTER: `${BASE_ROUTE}/list/booking-filter`,
	BOOKINGS_BOOKINGID: `${BASE_ROUTE}/:bookingID`,
	LIST_MY_BOOKINGS: `${BASE_ROUTE}/list/my-booking`,
	LIST_CUSTOMER_BOOKING_MY_CAR: `${BASE_ROUTE}/list/customer-booking-my-car`,
	LIST_CUSTOMER_RETURN_MY_CAR: `${BASE_ROUTE}/list/customer-return-my-car`,
	ACCEPT_BOOKINGS: `${BASE_ROUTE}/action/accept-booking`,
	ACCEPT_PAYING: `${BASE_ROUTE}/action/accept-paying`,
	CANCEL_BOOKINGS: `${BASE_ROUTE}/action/cancel-booking`,
	PAYED_BOOKINGS: `${BASE_ROUTE}/action/pay-booking`,
	GET_TURNOVER_AND_TOTAL_BOOKING_OF_USER: `${BASE_ROUTE}/info/turnover-and-total-booking`,

	// BOOKING RATING
	BOOKING_RATINGS: `${BASE_ROUTE_BOOKING_RATING}`,
	GET_INFO_BOOKING_RATINGS: `${BASE_ROUTE_BOOKING_RATING}/get-info`,

	ORIGIN_APP: BASE_ROUTE
}

exports.CF_ROUTINGS_BOOKING = CF_ROUTINGS_BOOKING;
