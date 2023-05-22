import { createStore, applyMiddleware } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import thunk from "redux-thunk";
import storage from "redux-persist/lib/storage";
import reducers from "./reducers";

const config = {
  key: `silarakab`,
  storage,
};

const persistReducers = persistReducer(config, reducers);
const store = createStore(persistReducers, applyMiddleware(thunk));
const persistor = persistStore(store);

export { persistor, store };
