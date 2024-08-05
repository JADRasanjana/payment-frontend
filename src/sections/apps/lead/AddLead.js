import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

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
  FormControlLabel,
  FormLabel,
  Grid,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  InputAdornment,
  Dialog,
  Autocomplete
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import AlertLeadDelete from './AlertLeadDelete';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

import { ThemeMode } from 'config';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

// assets
import { CameraOutlined, CaretRightOutlined, DeleteFilled, RetweetOutlined } from '@ant-design/icons';
import { deleteLead, updateLead, uploadLeadImage } from 'store/reducers/leads';
import { createLead } from 'store/reducers/leads';
import ConvertToProject from './ConvertToProject';
import { createVehicle, updateVehivle } from 'store/reducers/vehicle';
import { useSelector } from 'store';
import { getContacts } from 'store/reducers/contact';

// ==============================|| CUSTOMER ADD / EDIT / DELETE ||============================== //

const AddLead = ({ lead, onCancel }) => {
  const [openAlert, setOpenAlert] = useState(false);

  // const { uploadedImageUrl } = useSelector((state) => state.leads);

  const [deletingLead, setDeletingLead] = useState({
    _id: null,
    name: ''
  });

  const {
    contacts: { contacts, total },
    action
  } = useSelector((state) => state.contacts);
  // console.log('contacts>>', contacts);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    onCancel();
  };

  const theme = useTheme();
  const isCreating = !lead;

  const [selectedImage, setSelectedImage] = useState(undefined);
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    dispatch(getContacts());
  }, []);

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  useEffect(() => {
    if (lead) {
      setAvatar(lead.imageUrl);
    }
  }, [lead]);

  const deleteHandler = async (lead) => {
    setDeletingLead({
      _id: lead._id,
      name: lead.name
    });
    setOpenAlert(true);
  };

  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    onCancel();
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const LeadSchema = Yup.object().shape({
    numberPlate: Yup.string().required('Number plate is required'),
    owner: Yup.string().required('Vehicle owner is required')
  });

  const defaultValues = useMemo(
    () => ({
      numberPlate: lead?.numberPlate || '',
      manufacturer: lead?.manufacturer || '',
      model: lead?.model || '',
      manufactureYear: lead?.manufactureYear || null,
      owner: lead?.owner || ''
    }),
    [lead]
  );

  const formik = useFormik({
    enableReinitialize: true,
    // initialValues: getInitialValues(lead),
    initialValues: defaultValues,
    validationSchema: LeadSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (lead) {
          if (selectedImage) {
            dispatch(uploadLeadImage(selectedImage)).then((fileUrl) => {
              setSelectedImage(undefined);
              if (fileUrl) {
                dispatch(
                  updateVehivle(lead._id, {
                    ...values,
                    imageUrl: fileUrl.payload
                  })
                );
              }
            });
          } else {
            dispatch(
              updateVehivle(lead._id, {
                ...values,
                imageUrl: lead.imageUrl
              })
            );
          }

          resetForm();
        } else {
          if (selectedImage) {
            dispatch(uploadLeadImage(selectedImage)).then((fileUrl) => {
              setSelectedImage(undefined);
              if (fileUrl) {
                dispatch(
                  createVehicle({
                    ...values,
                    imageUrl: fileUrl.payload
                  })
                );
              }
            });
          } else {
            console.log('create values ', values);
            dispatch(createVehicle(values));
          }

          resetForm();
        }

        setSubmitting(false);
        onCancel();
      } catch (error) {
        console.error(error);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, resetForm } = formik;

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <DialogTitle sx={{ fontSize: 32, p: 3.5 }}>{lead ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
              </Grid>
              <Grid item>
                {lead && (
                  <Button variant="contained" color="primary" size="small" sx={{ marginRight: '20px' }} onClick={handleOpenModal}>
                    Convert to Project{' '}
                  </Button>
                )}
              </Grid>
            </Grid>
            <Divider />
            <DialogContent sx={{ pt: 0.8 }}>
              <Grid container spacing={1}>
                <Grid item xs={12}></Grid>
                <DialogTitle sx={{ marginTop: '10px' }}>Vehicle Information</DialogTitle>
                <Grid item xs={12}>
                  <Grid container spacing={3}>
                    {/* Number Plate */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <TextField
                          id="numberPlate"
                          label="Number Plate"
                          {...getFieldProps('numberPlate')}
                          onChange={(event) => setFieldValue('numberPlate', event.target.value)}
                          error={Boolean(touched.numberPlate && errors.numberPlate)}
                          helperText={touched.numberPlate && errors.numberPlate}
                        />
                      </FormControl>
                    </Grid>

                    {/* Manufacturer */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <TextField
                          id="manufacturer"
                          label="Manufacturer"
                          {...getFieldProps('manufacturer')}
                          onChange={(event) => setFieldValue('manufacturer', event.target.value)}
                          error={Boolean(touched.manufacturer && errors.manufacturer)}
                          helperText={touched.manufacturer && errors.manufacturer}
                        />
                      </FormControl>
                    </Grid>

                    {/* Model */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <TextField
                          id="model"
                          label="Model"
                          {...getFieldProps('model')}
                          onChange={(event) => setFieldValue('model', event.target.value)}
                          error={Boolean(touched.model && errors.model)}
                          helperText={touched.model && errors.model}
                        />
                      </FormControl>
                    </Grid>

                    {/* Manufacture Year */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <TextField
                          id="manufactureYear"
                          label="Manufacture Year"
                          type="number"
                          {...getFieldProps('manufactureYear')}
                          onChange={(event) => setFieldValue('manufactureYear', event.target.value)}
                          error={Boolean(touched.manufactureYear && errors.manufactureYear)}
                          helperText={touched.manufactureYear && errors.manufactureYear}
                        />
                      </FormControl>
                    </Grid>

                    {/* Vehicle owner */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <Autocomplete
                          fullWidth
                          disablePortal
                          id="vehicle-owner"
                          options={contacts}
                          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                          renderInput={(params) => <TextField {...params} label="Vehicle Owner" />}
                          onChange={(event, value) => {
                            if (value) {
                              setFieldValue('owner', value._id);
                            } else {
                              setFieldValue('owner', '');
                            }
                          }}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Dialog open={openModal} onClose={handleCloseModal}>
                <ConvertToProject lead={lead} onCancel={handleCloseModal} />
              </Dialog>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  {!isCreating && (
                    <Tooltip title="Delete Vehicle" placement="top">
                      <IconButton onClick={() => deleteHandler(lead)} size="large" color="error">
                        <DeleteFilled />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button color="error" onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {lead ? 'Edit' : 'Add'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
      {!isCreating && (
        <AlertLeadDelete title={deletingLead.name} leadId={deletingLead._id} open={openAlert} handleClose={handleAlertClose} />
      )}
    </>
  );
};

AddLead.propTypes = {
  lead: PropTypes.any,
  onCancel: PropTypes.func
};

export default AddLead;
