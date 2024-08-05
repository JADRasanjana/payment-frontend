import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  InputLabel,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import AlertUserDelete from './payment-delete-alert';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

// icons
import { CameraOutlined } from '@ant-design/icons';

// Store actions
import { createPayment, updatePayment, uploadPaymentImage } from 'store/reducers/payment';

const AddPayment = ({ payment, onCancel }) => {
  const dispatch = useDispatch();
  const [openAlert, setOpenAlert] = useState(false);
  const theme = useTheme();
  const isCreating = !payment;

  const [selectedImage, setSelectedImage] = useState(null);
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  useEffect(() => {
    if (payment) {
      setAvatar(payment.photo);
    }
  }, [payment]);

  const UserSchema = Yup.object().shape({
    name: Yup.string().max(255).required('Name is required'),
    email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
    phone: Yup.string()
      .matches(/^[0-9]+$/, 'Invalid phone number')
      .required('Phone number is required'),
    amount: Yup.number().required('Amount is required'),
    note: Yup.string().required('Note is required'),
    startDate: Yup.date().required('Date is required')
  });

  const defaultValues = {
    name: payment ? payment.name : '',
    email: payment ? payment.email : '',
    phone: payment ? payment.phone : '',
    amount: payment ? payment.amount : '',
    note: payment ? payment.note : '',
    startDate: payment ? new Date(payment.startDate) : new Date(),
  };

  const formik = useFormik({
    initialValues: defaultValues,
    validationSchema: UserSchema,
    onSubmit: (values, { setSubmitting, resetForm }) => {
      const { name, email, phone, amount, note, startDate } = values;
      const submitFunction = payment ? updatePayment : createPayment;
      dispatch(submitFunction({ name, email, phone, amount, note, startDate }));
      setSubmitting(false);
      resetForm();
      onCancel();
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogTitle>{isCreating ? 'New Payment' : 'Edit Payment'}</DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container spacing={3}>
              {/* Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  label="Name"
                  {...getFieldProps('name')}
                  error={Boolean(touched.name && errors.name)}
                  helperText={touched.name && errors.name}
                />
              </Grid>
              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  label="Email"
                  {...getFieldProps('email')}
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                />
              </Grid>
              {/* Phone */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  {...getFieldProps('phone')}
                  error={Boolean(touched.phone && errors.phone)}
                  helperText={touched.phone && errors.phone}
                />
              </Grid>
              {/* Amount */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="amount"
                  label="Amount"
                  type="number"
                  {...getFieldProps('amount')}
                  error={Boolean(touched.amount && errors.amount)}
                  helperText={touched.amount && errors.amount}
                />
              </Grid>
              {/* Note */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="note"
                  label="Note"
                  multiline
                  rows={4}
                  {...getFieldProps('note')}
                  error={Boolean(touched.note && errors.note)}
                  helperText={touched.note && errors.note}
                />
              </Grid>
              {/* Start Date */}
              <Grid item xs={12}>
                <DatePicker
                  label="Start Date"
                  {...getFieldProps('startDate')}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isCreating ? 'Add' : 'Update'}
            </Button>
          </DialogActions>
        </Form>
      </LocalizationProvider>
    </FormikProvider>
  );
};

AddPayment.propTypes = {
  payment: PropTypes.object,
  onCancel: PropTypes.func.isRequired
};

export default AddPayment;
