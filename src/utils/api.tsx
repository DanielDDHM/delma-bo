/* eslint-disable no-restricted-globals */
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import EndpointsList from './endpoints';
import { store } from 'store';
import { push } from 'connected-react-router';
import Strings from 'utils/strings';
import { setLogout } from 'store/actions';

export const DEFAULT_HEADERS = {
	Accept: 'application/json',
	'Content-Type': 'application/json;charset=UTF-8',
	'Cache-Control': 'no-cache',
	Source: 'bo',
};

export const DEFAULT_CONFIG = {
	timeout: 30000,
	responseType: 'json',
	validateStatus: function (status: number) {
		return status >= 200 && status < 400; // default
	},
};

export const NONE = null;
export const CLIENT_ERROR = 'CLIENT_ERROR';
export const SERVER_ERROR = 'SERVER_ERROR';
export const TIMEOUT_ERROR = 'TIMEOUT_ERROR';
export const CONNECTION_ERROR = 'CONNECTION_ERROR';
export const NETWORK_ERROR = 'NETWORK_ERROR';
export const UNKNOWN_ERROR = 'UNKNOWN_ERROR';
export const CANCEL_ERROR = 'CANCEL_ERROR';
export const DUPLICATE_REQUEST = 'DUPLICATE_REQUEST';

export const TIMEOUT_ERROR_CODES = ['ECONNABORTED'];
export const NODEJS_CONNECTION_ERROR_CODES = ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET'];

// util functions for further validations
const isBetween = (v: number, a: number, b: number) => v >= a && v <= b;

const in200s = (value: number) => isBetween(value, 200, 299);
const in400s = (value: number) => isBetween(value, 400, 499);
const in500s = (value: number) => isBetween(value, 500, 599);
const statusNil = (response: any) => (response == null ? null : response.status);

/**
 * Given a HTTP status code, return back the appropriate problem enum.
 */
export const getProblemFromStatus = (status: number | null) => {
	if (status == null) return UNKNOWN_ERROR;
	if (in200s(status)) return NONE;
	if (in400s(status)) return CLIENT_ERROR;
	if (in500s(status)) return SERVER_ERROR;

	return UNKNOWN_ERROR;
};

/**
 * What's the problem for this axios response?
 */
export const getProblemFromError = (error: any) => {
	// first check if the error message is Network Error (set by axios at 0.12) on platforms other than NodeJS.
	if (error.message === 'Network Error') return NETWORK_ERROR;
	if (error.message === DUPLICATE_REQUEST) return DUPLICATE_REQUEST;
	if (axios.isCancel(error)) return CANCEL_ERROR;

	// verifying error code
	if (error.code == null) return getProblemFromStatus(statusNil(error.response));
	if (TIMEOUT_ERROR_CODES.includes(error.code)) return TIMEOUT_ERROR;
	if (NODEJS_CONNECTION_ERROR_CODES.includes(error.code)) return CONNECTION_ERROR;
	return UNKNOWN_ERROR;
};


export default class ApiSauce {
	static Endpoints = EndpointsList;

	stack: Array<String>;
	headers: Object;
	instance: AxiosInstance;

	constructor(config: any = {}) {
		const { headers, ...axiosConfig } = config || {};

		this.headers = Object.assign({}, DEFAULT_HEADERS, headers);
		this.instance = axios.create(Object.assign({}, DEFAULT_CONFIG, axiosConfig))
		this.stack = [];
	}


	defaultHeaders = () => {
		const { token } = store.getState() as any;
		const lang = Strings.getLanguage();
		const headers: { [k: string]: any } = {
			'Accept-Language': lang,
		};

		if (token) headers.Authorization = `Bearer ${token}`;

		return headers;
	};


	addToStack = (url: string) => {
		this.stack.push(url);
	};

	removeFromStack = (url: string) => {
		const index = this.stack.indexOf(url);
		if (index !== -1) this.stack.splice(index, 1);
		return index !== -1;
	};


	/**
	 * Make the request for GET, HEAD, DELETE
	 */
	requestWithoutBody = ({ method = '', url = '', params = {}, axiosConfig = {}, ...args }) => {
		return this.request(Object.assign({ url, params, method }, args, axiosConfig));
	};

	/**
	 * Make the request for POST, PUT, PATCH
	 */
	requestWithBody = ({ method = '', url = '', data = null, params = {}, axiosConfig = {}, ...args }) => {
		return this.request(Object.assign({ url, method, data, params }, args, axiosConfig));
	};

	/**
	 * Generic request for any method
	 * @param {*} axiosConfig
	 */
	request = (axiosConfig: any) => {
		const { ...config } = axiosConfig;

		config.headers = {
			...this.headers,
			...this.defaultHeaders(),
			...config.headers,
		};

		// console.log('#DEBUG-API', config.method, config.url);

		// console.log('Headers : ', config.headers);

		if (this.stack.find((r) => r === config.url)) {
			return Promise.reject();
			// return Promise.reject(new Error(DUPLICATE_REQUEST)); // Already processing this uri, ignores duplicated
		}

		this.addToStack(config.url); // Add to requests stack

		const startDate = new Date().valueOf();
		const chain = this.chain(startDate, axiosConfig, config.headers);

		return this.instance.request(config).then(chain).catch(chain);
	};

	chain = (startDate: number, axiosConfig: any, headers: any) => {
		const { handleError = false, ...config } = axiosConfig;
		return async (axiosResult: AxiosResponse | AxiosError) => {
			const response = await this.convertResponse(startDate, axiosResult);
			response.sentHeaders = headers;

			this.removeFromStack(config.url); // Remove from stack
			if (response.originalError && !handleError) {
				// management of error
				this.handleError(response);
			}

			/*
			 * Sentry.addBreadcrumb({
			 * 	category: 'API Call',
			 * 	data: response,
			 * 	message: config.url,
			 * 	level: Sentry.Severity.Info,
			 * });
			 */

			// Custom Error Handling
			if (response.data && response.data.error) {
				// something here
			}
			return response;
		};
	};

	convertResponse = async (startedAt: number, axiosResult: AxiosResponse | AxiosError) => {
		// console.log('----- axiosResult ------');
		// console.log(JSON.stringify(axiosResult));

		const end = new Date().valueOf();
		const duration = end - startedAt;
		const isError = axiosResult instanceof Error || axios.isCancel(axiosResult);
		const axiosResponse = axiosResult as AxiosResponse;
		const axiosError = axiosResult as AxiosError;
		const response = isError ? axiosError.response : axiosResponse;
		const status = (response && response.status) || 0;
		const problem = isError ? getProblemFromError(axiosResult) : getProblemFromStatus(status);
		const originalError = isError ? axiosError : null;
		const ok = in200s(status);
		const config = axiosResult.config || null;
		const headers = (response && response.headers) || null;
		const data = (response && response.data) || null;

		const transformedResponse = {
			duration,
			problem,
			originalError,
			ok,
			headers,
			config,
			data,
			status,
			sentHeaders: null,
		};

		if (ok && data && data.error) {
			transformedResponse.ok = false;
		}

		// apisauce by infinitered has more code in this step

		return transformedResponse;
	};

	handleError = (response: any) => {
		try {
			const { status, problem } = response;
			switch (problem) {
				case CLIENT_ERROR: {
					// BAD REQUEST
					if (status === 400) {

					}

					// UNAUTHORIZED
					if (status === 401) {
						store.dispatch(setLogout());
						store.dispatch(push('/'));
					}

					// FORBIDDEN
					if (status === 403) {
					}

					// NOT FOUND
					if (status === 404) {
					}

					// METHOD NOT ALLOWED
					if (status === 405) {
					}

					// NOT ACCEPTABLE
					if (status === 406) {
					}

					// MISDIRECTED REQUEST
					if (status === 421) {
					}

					// DropDown.alert({
					// 	type: 'error',
					// 	title: getString(['generic', 'attention']),
					// 	message: response.originalError.message,
					// 	interval: 2500,
					// });
					break;
				}
				case SERVER_ERROR: {
					// INTERNAL SERVER ERROR
					if (status === 500) {
						store.dispatch(push('/500', { lastPage: location.href }));
					}

					// BAD GATEWAY
					if (status === 502) {
						store.dispatch(push('/500', { lastPage: location.href }));
					}

					// SERVICE UNAVAILABLE
					if (status === 503) {
						store.dispatch(push('/500', { lastPage: location.href }));
					}

					// GATEWAY TIMEOUT
					if (status === 504) {
						store.dispatch(push('/500', { lastPage: location.href }));
					}

					// DropDown.alert({
					// 	type: 'error',
					// 	title: getString(['generic', 'attention']),
					// 	message: response.originalError.message,
					// 	interval: 2500,
					// });
					break;
				}
				case TIMEOUT_ERROR: {
					/*
					 * DropDown.alert({
					 * 	type: 'error',
					 * 	title: getString(['generic', 'attention']),
					 * 	message: getString(['networkMsg', 'timeout']),
					 * 	interval: 2500,
					 * });
					 */
					break;
				}
				case NETWORK_ERROR: {
					// Store.dispatch(setLoader(false));
					/*
					 * DropDown.alert({
					 * 	type: 'error',
					 * 	title: getString(['generic', 'attention']),
					 * 	message: getString(['networkMsg', 'network']),
					 * 	interval: 2500,
					 * });
					 */
					break;
				}
				case CONNECTION_ERROR: {
					/*
					 * DropDown.alert({
					 * 	type: 'error',
					 * 	title: getString(['generic', 'attention']),
					 * 	message: getString(['networkMsg', 'connection']),
					 * 	interval: 2500,
					 * });
					 */
					break;
				}
				case UNKNOWN_ERROR: {
					/*
					 * DropDown.alert({
					 * 	type: 'error',
					 * 	title: getString(['generic', 'attention']),
					 * 	message: getString(['networkMsg', 'generic']),
					 * 	interval: 2500,
					 * });
					 */
					break;
				}
				default:
					break;
			}
		} catch (err) { }
	};

	get = (args = {}) => {
		return this.requestWithoutBody({ method: 'get', ...args });
	};

	post = (args = {}) => {
		return this.requestWithBody({ method: 'post', ...args });
	};

	put = (args = {}) => {
		return this.requestWithBody({ method: 'put', ...args });
	};

	patch = (args = {}) => {
		return this.requestWithBody({ method: 'patch', ...args });
	};

	delete = (args = {}) => {
		return this.requestWithoutBody({ method: 'delete', ...args });
	};

	head = (args = {}) => {
		return this.requestWithoutBody({ method: 'head', ...args });
	};
}

export const { isCancel, CancelToken } = axios;

export const Endpoints = EndpointsList;

export const API = new ApiSauce();

export const GET = API.get;
export const POST = API.post;
export const PUT = API.put;
export const PATCH = API.patch;
export const DELETE = API.delete;
export const HEAD = API.head;