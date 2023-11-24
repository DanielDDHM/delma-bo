/**
 * Create the store with dynamic reducers
 */

import { createStore, applyMiddleware, compose } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { routerMiddleware } from 'connected-react-router';
import { persistStore } from 'redux-persist';
import history from 'utils/history';
import reducers from './reducers';

function configureStore(initialState = {}) {
	// Create the store with two middlewares
	// 1. sagaMiddleware: Makes redux-sagas work
	// 2. routerMiddleware: Syncs the location/URL path to the state
	const middlewares = [routerMiddleware(history)];

	const enhancers = [applyMiddleware(...middlewares)];

	// If Redux DevTools Extension is installed use it, otherwise use Redux compose
	/* eslint-disable no-underscore-dangle, indent */
	let composeEnhancers = compose;
	if (process.env.NODE_ENV !== 'production') composeEnhancers = composeWithDevTools({});
	// let composeEnhancers = compose;
	// if (process.env.NODE_ENV !== 'production' && typeof window === 'object') {
	//     if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
	//         composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({});
	//     }
	// }
	/* eslint-enable */

	// @ts-ignore
	const store = createStore(reducers, initialState, composeEnhancers(...enhancers));

	// Make reducers hot reloadable, see http://mxs.is/googmo
	/* istanbul ignore next */
	if (module.hot) {
		module.hot.accept('./reducers', () => {
			// store.replaceReducer(createReducer(store.injectedReducers));
			const nextRootReducer = require('./reducers');
			store.replaceReducer(nextRootReducer);
		});
	}

	return store;
}


export const store = configureStore();
export const persistor = persistStore(store);