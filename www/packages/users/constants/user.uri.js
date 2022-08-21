const BASE_ROUTE = '/users';

const CF_ROUTINGS_USER = {
	USERS: `${BASE_ROUTE}`,
	RESET_PASSWORD: `${BASE_ROUTE}/password/reset`,
	USERS_INFO: `${BASE_ROUTE}/info/current`,
	USERS_USERID: `${BASE_ROUTE}/:userID`,
	LOGIN: `${BASE_ROUTE}/login`,
	UPDATE_AVATAR: `${BASE_ROUTE}/avatar/update`,

    ORIGIN_APP: BASE_ROUTE
}

exports.CF_ROUTINGS_USER = CF_ROUTINGS_USER;
