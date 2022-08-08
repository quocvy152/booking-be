const BASE_ROUTE = '/customer';

const CF_ROUTINGS_CUSTOMER = {
	REGISTER_CUSTOMER: `${BASE_ROUTE}/register-customer`,
	LOGIN_CUSTOMER: `${BASE_ROUTE}/login`,
	LOGIN_AUTH: `${BASE_ROUTE}/auth`,

	INFO_CUSTOMER: `${BASE_ROUTE}/info-customer`,
    UPDATE_CUSTOMER: `${BASE_ROUTE}/update-customer`,
    SEND_OTP_CHANGE_EMAIL: `${BASE_ROUTE}/send-otp-change-email`,
    CHECK_CODE_CHANGE_EMAIL: `${BASE_ROUTE}/check-code-change-email`,
    UPDATE_PASSWORD: `${BASE_ROUTE}/update-password`,
    UPDATE_PASSWORD_AFTER_FORGET: `${BASE_ROUTE}/update-password-after-forget`,
    DELETE_CUSTOMER: `${BASE_ROUTE}/delete-customer`,
    LIST_CUSTOMER: `${BASE_ROUTE}/list-customer`,
    LIST_CUSTOMER_PAGINATION: `${BASE_ROUTE}/list-customer-pagination`,

	ADD_USER_DEVICE: `${BASE_ROUTE}/add-user-device`,
	UPDATE_CUSTOMER_FOR_USER_DEVICE: `${BASE_ROUTE}/update-customer-user-device`,
	LIST_USER_DEVICE: `${BASE_ROUTE}/list-user-device`,
	INFO_USER_DEVICE: `${BASE_ROUTE}/info-user-device`,
	INFO_USER_DEVICE_BY_DEVICE_ID: `${BASE_ROUTE}/info-user-device-by-device-id`,
	DELETE_USER_DEVICE: `${BASE_ROUTE}/delete-user-device`,

	LIST_CUSTOMER_SORT_SEGMENT_API: `/api${BASE_ROUTE}/list-customer-sort`,
	INFO_CUSTOMER_ROLE_ADMIN: `/api/info-customer-role-admin/:customerID`,
	UPDATE_POINT_CUSTOMER: `/api/update-point/:customerID`,

	// API MOBILE
	INFO_CUSTOMER_API: `/api${BASE_ROUTE}/info-customer`,
	INFO_CUSTOMER_BY_PHONE: `/api/info-customer/:phone`,
	LIST_CUSTOMER_API: `/api${BASE_ROUTE}/list-customer`,
	/**
	 * ================================OTP=================================
	 */
	SEND_PHONE_OTP_REGISTER:    `/api${BASE_ROUTE}/register-send-otp/:phone`,
	VERIFY_OTP_PHONE_REGISTER:  `/api${BASE_ROUTE}/verify-otp-register/:code`,
	SEND_PHONE_OTP_FORGET:      `/api${BASE_ROUTE}/send-otp-forget/:phone`,
	VERIFY_OTP_PHONE_FORGET:    `/api${BASE_ROUTE}/verify-otp-forget/:code`,

	ORIGIN_APP: BASE_ROUTE
}

exports.CF_ROUTINGS_CUSTOMER = CF_ROUTINGS_CUSTOMER;
