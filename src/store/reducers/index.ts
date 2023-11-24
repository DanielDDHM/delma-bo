/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { connectRouter } from 'connected-react-router';
import { ReducersMapObject } from 'redux';
import { persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import * as Reducers from './mix';

import history from 'utils/history';

const config = {
	key: window.location.hostname,
	storage,
	// blacklist: ['loader', 'header'],
	blacklist: ['loader', 'title', 'staffModal', 'breadcrumb', 'updateCrumb'],
};

// @ts-ignore
const persistReducers = persistCombineReducers(config, Reducers as ReducersMapObject<any>);

const rootReducer = (state: any, action: any) => persistReducers(state, action);
// @ts-ignore
export default connectRouter(history)(rootReducer);
