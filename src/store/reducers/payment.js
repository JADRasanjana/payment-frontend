import { dispatch } from "store";
import axios from "utils/axios";
import { openSnackbar } from "./snackbar";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit")

const initialState = {
    action: false,
    error: null,
    payment: {},
    payments: {
        payments: [],
        page: null,
        total: null,
        limit: null,
    },
    deletedPayment: {},
    uploadedImageUrl: null,
}

const payments = createSlice({
    name: 'payments',
    initialState,
    reducers: {
        // HAS ERROR
        hasError(state, action) {
            state.error = action.payload;
        },

        // GET CUSTOMERS
        getPaymentsSuccess(state, action) {
            state.payments = action.payload;
        },

        deletePaymnetSuccess(state, action) {
            state.deletedPayment = action.payload;
        },

        setAction(state) {
            state.action = !state.action;
        },

        setUploadedImageSuccess(state, action) {
            state.uploadedImageUrl = action.payload;
        }
    }
});

export default payments.reducer;

export function setActionPayment() {
    dispatch(payments.actions.setAction());
}

export function getPayments(pageIndex = 0, pageSize = 10, query) {
    return async () => {
        try {

            let requestUrl = `/api/v1/payment?page=${pageIndex + 1}&limit=${pageSize}`;

            if (query) {
                requestUrl = `${requestUrl}&query=${query}`
            }

            const response = await axios.get(requestUrl);

            if (response.status === 200) {
                dispatch(payments.actions.getPaymentsSuccess(response.data.data));
            }

        } catch (error) {
            dispatch(payments.actions.hasError(error));
        }
    };
}

export function createPayment(values) {
    return async () => {
        try {
            const response = await axios.post('/api/v1/payment', {
                ...values,
                start_date: values.startdate,
                role_id: values.role,
                job_role: values.jobrole,
                photo: values.imageUrl,
                document: values.imageUrl, // TODO: replace document
            });

            if (response.status === 200) {

                setActionPayment();

                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Payment crated successfully.',
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: false
                    })
                );
            }


        } catch (err) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: 'Payment could not create.',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: false
                })
            );
            dispatch(payments.actions.hasError(err));
        }
    }
}

export function updatePayment(paymentId, values) {
    return async () => {
        try {
            const response = await axios.put(`/api/v1/payment/${paymentId}/update`, {
                ...values,
                start_date: values.startdate,
                // role_id: values.role,
                // job_role: values.jobrole,
                photo: values.imageUrl,
                document: values.imageUrl, // TODO: replace document
            });

            if (response.status === 200) {

                setActionPayment();

                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Payments updated successfully.',
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: false
                    })
                );
            }


        } catch (err) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: 'Payments could not update.',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: false
                })
            );
            dispatch(payments.actions.hasError(err));
        }
    }
}

export function deletePayment(paymentId) {
    return async () => {
        try {
            const response = await axios.delete(`/api/v1/payment/${paymentId}/delete`);

            if (response.status === 200) {

                dispatch(payments.actions.deletePaymentSuccess(response.data));

                setActionPayment();

                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Payment deleted successfully.',
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: false
                    })
                );
            }

        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: 'Payment deleted failed.',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: false
                })
            );
            dispatch(payments.actions.hasError(error));
        }
    };
}

export const uploadpaymentImage = createAsyncThunk('', async (image) => {
    try {

        dispatch(
            openSnackbar({
                open: true,
                message: 'Uploading image...',
                variant: 'alert',
                alert: {
                    color: 'info'
                },
                close: false
            })
        );

        let formData = new FormData();
        formData.append("file", image);

        const response = await axios.post(`/api/v1/media/file-upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.status === 200) {

            dispatch(
                openSnackbar({
                    open: true,
                    message: 'Image uploaded successfully',
                    variant: 'alert',
                    alert: {
                        color: 'success'
                    },
                    close: false
                })
            );

            dispatch(payments.actions.setUploadedImageSuccess(response.data.data.file_url));

            return response.data.data.file_url;
        }

    } catch (err) {
        dispatch(
            openSnackbar({
                open: true,
                message: 'Customer could not update.',
                variant: 'alert',
                alert: {
                    color: 'error'
                },
                close: false
            })
        );
        dispatch(payments.actions.hasError(error));
    }
});