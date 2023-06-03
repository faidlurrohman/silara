import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store";
import { App, ConfigProvider } from "antd";

import dayjs from "dayjs";
import "dayjs/locale/id";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import locale from "antd/lib/locale/id_ID";

import MyApp from "./App";
import reportWebVitals from "./reportWebVitals";
import { COLORS } from "./helpers/constants";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.locale("id");

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<ConfigProvider
					theme={{
						token: {
							fontFamily: "Noto Sans HK Regular",
							colorPrimary: COLORS.secondary,
							fontSize: 12,
						},
						components: {
							Layout: {
								colorBgContainer: COLORS.main,
							},
						},
					}}
					locale={locale}
				>
					<App>
						<MyApp />
					</App>
				</ConfigProvider>
			</PersistGate>
		</Provider>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
