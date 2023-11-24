import * as TYPES from '../constants';
import { connectRouter } from 'connected-react-router';
import history from 'utils/history';

export const router = connectRouter(history);

export function loader(state = false, action: any) {
	if (action.type === TYPES.SET_LOADER) {
		return action.value;
	}

	return state;
}

export function title(state = '', action: any) {
	if (action.type === TYPES.SET_TITLE) {
		return action.value;
	}

	return state;
}

export function user(state = null, action: any) {
	if (action.type === TYPES.SET_USER) {
		return action.value;
	} else if (action.type === TYPES.SET_LOGOUT) {
		return null;
	}

	return state;
}

export function token(state = '', action: any) {
	if (action.type === TYPES.SET_TOKEN) {
		return action.value;
	} else if (action.type === TYPES.SET_LOGOUT) {
		return '';
	}

	return state;
}

export function staffModal(state = null, action: any) {
	if (action.type === TYPES.SET_STAFF_DIALOG) {
		return action.value;
	} else if (action.type === TYPES.SET_LOGOUT) {
		return null;
	}

	return state;
}

export function breadcrumb(state: any = null, action: any) {
	if (action.type === TYPES.SET_BREADCRUMB) {
		return action.value;
	} else if (action.type === TYPES.SET_LOGOUT) {
		return null;
	}

	return state;
}

export function updateCrumb(state: any = null, action: any) {
	if (action.type === TYPES.SET_UPDATER) {
		return { updateCrumb: action.dispatch };
	}

	if (action.type === TYPES.UPDATE_CRUMB) {
		if (state?.updateCrumb) {
			state?.updateCrumb();
		}
	}

	return state;
}

export function logsFilters(state = null, action: any) {
	if (action.type === TYPES.SET_LOGS_FILTERS) {
		return action.value;
	}

	return state;
}

export function language(state = null, action: any) {
	if (action.type === TYPES.SET_LANGUAGE) {
		return action.value;
	}

	return state;
}
