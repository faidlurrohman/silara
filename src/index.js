import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import "moment/locale/id";
import locale from "antd/lib/locale/id_ID";
import moment from "moment";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store";
import { ConfigProvider } from "antd";

import App from "./App";
import reportWebVitals from "./reportWebVitals";

moment.updateLocale("id", {
  // weekdaysMin : ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
  week: {
    dow: 1, // Monday is the first day of the week.
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider locale={locale}>
          <App />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
