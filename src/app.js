import React from "react";
import ReactDOM from "react-dom";
import App from "screens/App";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ConnectedRouter } from "connected-react-router";
import history from "utils/history";
import { store, persistor } from "./store";
// @ts-ignore
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <ConnectedRouter history={history}>
                {/* <React.StrictMode> */}
                <App />
                {/* </React.StrictMode> */}
            </ConnectedRouter>
        </PersistGate>
    </Provider>,
    document.getElementById("app")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
