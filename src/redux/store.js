import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { reduxBatch } from '@manaflair/redux-batch'
import { persistStore, persistReducer } from 'redux-persist'
import { rootReducer, rootSaga } from './rootReducer'
import storage from 'redux-persist/lib/storage'

const sagaMiddleware = createSagaMiddleware()
const middleware = [
	...getDefaultMiddleware({
		immutableCheck: false,
		serializableCheck: false,
		thunk: true
	}),
	sagaMiddleware
]

const persistConfig = {
	storage,
	key: 'root'
}

const store = configureStore({
	reducer: persistReducer(persistConfig, rootReducer),
	middleware,
	devTools: process.env.NODE_ENV !== 'production',
	enhancers: [reduxBatch]
})

/**
 * @see https://github.com/rt2zz/redux-persist#persiststorestore-config-callback
 * @see https://github.com/rt2zz/redux-persist#persistor-object
 */
export const persistor = persistStore(store)

sagaMiddleware.run(rootSaga)

export default store
