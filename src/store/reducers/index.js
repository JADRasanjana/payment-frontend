// third-party
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// project import
import chat from './chat';
import payments from './payment';
import menu from './menu';
import snackbar from './snackbar';
import cartReducer from './cart';
// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({
  chat,
  payments,
  menu,
  snackbar,
  cart: persistReducer(
    {
      key: 'cart',
      storage,
      keyPrefix: 'mantis-js-'
    },
    cartReducer
  )
  
});

export default reducers;
