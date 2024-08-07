// third-party
import { createSlice } from '@reduxjs/toolkit';

// project imports
import axios from 'utils/axios';
import { dispatch } from '../index';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  chats: [],
  payment: {},
  payments: []
};

const chat = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // HAS ERROR
    hasError(state, action) {
      state.error = action.payload;
    },

    // GET PAYMENT
    getPaymentSuccess(state, action) {
      state.payment = action.payload;
    },

    // GET PAYMENT CHATS
    getPaymentChatsSuccess(state, action) {
      state.chats = action.payload;
    },

    // GET PAYMENTS
    getPaymentsSuccess(state, action) {
      state.payments = action.payload;
    }
  }
});

// Reducer
export default chat.reducer;

// ----------------------------------------------------------------------

export function getPayment(id) {
  return async () => {
    try {
      const response = await axios.post('/api/chat/payments/id', { id });
      dispatch(chat.actions.getPaymentSuccess(response.data));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function getPaymentChats(payment) {
  return async () => {
    try {
      const response = await axios.post('/api/chat/filter', { payment });
      dispatch(chat.actions.getPaymentChatsSuccess(response.data));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function insertChat(chat) {
  return async () => {
    try {
      await axios.post('/api/chat/insert', chat);
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function getPayments() {
  return async () => {
    try {
      const response = await axios.get('/api/chat/payments');
      dispatch(chat.actions.getPaymentsSuccess(response.data.payments));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}
