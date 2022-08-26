const BASE_ROUTE = '/bookings';

const CF_ROUTINGS_BOOKING = {
	BOOKINGS: `${BASE_ROUTE}`,
	BOOKINGS_BOOKINGID: `${BASE_ROUTE}/:bookingID`,
	LIST_MY_BOOKINGS: `${BASE_ROUTE}/list/my-booking`,
	LIST_CUSTOMER_BOOKING_MY_CAR: `${BASE_ROUTE}/list/customer-booking-my-car`,
	ACCEPT_BOOKINGS: `${BASE_ROUTE}/action/accept-booking`,
	CANCEL_BOOKINGS: `${BASE_ROUTE}/action/cancel-booking`,

	ORIGIN_APP: BASE_ROUTE
}

exports.CF_ROUTINGS_BOOKING = CF_ROUTINGS_BOOKING;
