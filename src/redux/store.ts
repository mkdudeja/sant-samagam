import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { persistReducer, persistStore } from "redux-persist"
import storage from "redux-persist/lib/storage"
import { firestoreApi } from "./services/phonebook.service"
import phonebookReducer from "./state/phonebook/phonebook.slice"

const rootReducer = combineReducers({
  [firestoreApi.reducerPath]: firestoreApi.reducer,
  phonebook: phonebookReducer,
})

const persistedReducer = persistReducer(
  {
    key: "samagam",
    storage,
    blacklist: ["api"],
  },
  rootReducer,
)

export const store = configureStore({
  reducer: persistedReducer,
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(firestoreApi.middleware),
})

export const persistor = persistStore(store)

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch)
