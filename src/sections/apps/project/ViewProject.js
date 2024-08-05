import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

// material-ui
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import { Form, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { v4 as UIDV4 } from 'uuid';

// project imports
import IconButton from 'components/@extended/IconButton';

import { dispatch } from 'store';

// assets
import { DeleteFilled } from '@ant-design/icons';
import { uploadProjectAttachment } from 'store/reducers/projects';
import AlertProjectDelete from './AlertProjectDelete';
import { createService, updateService } from 'store/reducers/service';

// ==============================|| CUSTOMER ADD / EDIT / DELETE ||============================== //

const ViewService = ({ project, onCancel }) => {
  console.log('projects', project);
  const [openAlert, setOpenAlert] = useState(false);

  const [deletingProject, setDeletingProject] = useState({
    _id: null,
    name: ''
  });

  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    onCancel();
  };

  const isCreating = !project;

  const deleteHandler = async (project) => {
    setDeletingProject({
      _id: project._id,
      name: project.projectName
    });
    setOpenAlert(true);
  };

  const ProjectSchema = Yup.object().shape({
    serviceDate: Yup.date().required('Start date is required'),
    nextServiceDate: Yup.date()
      .when('serviceDate', (date, schema) => date && schema.min(date, "End date can't be before start date"))
      .nullable()
      .required('End date is required')
  });

  const defaultValues = useMemo(
    () => ({
      serviceCharge: project ? project.serviceCharge : ' ',
      totalPrice: project ? project.totalPrice : '',
      status: project ? project.status : '',
      description: project ? project.description : '',
      serviceDate: project ? new Date(project.serviceDate) : new Date(),
      nextServiceDate: project ? new Date(project.nextServiceDate) : null,
      services: project ? project.services : '',
      note: project ? project.note : '',
      itemList: {
        itemName: project ? project.itemList?.itemName : '',
        qty: project ? project.itemList?.qty : null,
        price: project ? project.itemList?.price : ''
      },
      invoice_detail: project
        ? project.invoice_detail
        : [
            {
              id: UIDV4(),
              name: '',
              description: '',
              qty: 1,
              price: '1.00'
            }
          ],
      discount: project ? project.discount : 0,
      tax: project ? project.tax : 0
    }),
    [project]
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: defaultValues,
    validationSchema: ProjectSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (project) {
          if (values.files) {
            dispatch(uploadProjectAttachment(values.files[0])).then((fileUrl) => {
              if (fileUrl) {
                dispatch(
                  updateService(project._id, {
                    ...values,
                    imageUrl: fileUrl.payload
                  })
                );
              }
            });
          } else {
            dispatch(
              updateService(project._id, {
                ...values,
                imageUrl: project.imageUrl
              })
            );
          }

          resetForm();
        } else {
          if (values.files) {
            dispatch(uploadProjectAttachment(values.files[0])).then((fileUrl) => {
              if (fileUrl) {
                dispatch(
                  createService({
                    ...values,
                    imageUrl: fileUrl.payload
                  })
                );
              }
            });
          } else {
            dispatch(createService(values));
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

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, resetForm, values } = formik;

  useEffect(() => {
    const calculatedSubtotal = values?.invoice_detail.reduce((prev, curr) => {
      if (curr.name.trim().length > 0) return prev + Number(curr.price * Math.floor(curr.qty));
      else return prev;
    }, 0);
    setSubtotal(calculatedSubtotal);

    const calculatedTaxRate = (values.tax * calculatedSubtotal) / 100;
    const calculatedDiscountRate = (values.discount * calculatedSubtotal) / 100;
    const calculatedTotal = calculatedSubtotal - calculatedDiscountRate + calculatedTaxRate;
    setTotal(calculatedTotal);

  }, [project, values.invoice_detail, values.tax, values.discount])

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{project ? 'View Service' : 'Create Service'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Grid container spacing={3}>
                    {/* Service Date */}
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="service-date">Service Date</InputLabel>
                        <FormControl sx={{ width: '100%' }} error={Boolean(touched.serviceDate && errors.serviceDate)}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              format="dd/MM/yyyy"
                              value={values.serviceDate}
                              onChange={(newValue) => setFieldValue('serviceDate', newValue)}
                              disabled
                            />
                          </LocalizationProvider>
                        </FormControl>
                        {touched.serviceDate && errors.serviceDate && <FormHelperText error={true}>{errors.serviceDate}</FormHelperText>}
                      </Stack>
                    </Grid>
                    {/* Next Service Date */}
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="next-service-date">Next Service Date</InputLabel>
                        <FormControl sx={{ width: '100%' }} error={Boolean(touched.nextServiceDate && errors.nextServiceDate)}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              format="dd/MM/yyyy"
                              value={values.nextServiceDate}
                              onChange={(newValue) => setFieldValue('nextServiceDate', newValue)}
                              disabled
                            />
                          </LocalizationProvider>
                        </FormControl>
                        {touched.nextServiceDate && errors.nextServiceDate && (
                          <FormHelperText error={true}>{errors.nextServiceDate}</FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                    {/* Note */}
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="note">Note</InputLabel>
                        <TextField
                          fullWidth
                          id="note"
                          multiline
                          rows={2}
                          placeholder="Enter Note"
                          {...getFieldProps('note')}
                          error={Boolean(touched.note && errors.note)}
                          helperText={touched.note && errors.note}
                          disabled
                        />
                      </Stack>
                    </Grid>
                    {/* Services */}
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="services">Services</InputLabel>
                        <TextField
                          fullWidth
                          id="services"
                          placeholder="Enter Services (Comma separated)"
                          {...getFieldProps('services')}
                          error={Boolean(touched.services && errors.services)}
                          helperText={touched.services && errors.services}
                          disabled
                        />
                      </Stack>
                    </Grid>
                    {/* Service Charge */}
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="service-charge">Service Charge</InputLabel>
                        <TextField
                          fullWidth
                          id="service-charge"
                          placeholder="Enter Service Charge"
                          {...getFieldProps('serviceCharge')}
                          error={Boolean(touched.serviceCharge && errors.serviceCharge)}
                          helperText={touched.serviceCharge && errors.serviceCharge}
                          disabled
                        />
                      </Stack>
                    </Grid>
                    {/* Item List */}
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="item-list">Item List</InputLabel>
                        <Grid item xs={12}>
                          <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                              <TableHead>
                                <TableRow>
                                  <TableCell>#</TableCell>
                                  <TableCell>Name</TableCell>
                                  <TableCell>Qty</TableCell>
                                  <TableCell>Price</TableCell>
                                  <TableCell align="right">Amount</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {values.invoice_detail?.map((item, index) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{values.invoice_detail.indexOf(item) + 1}</TableCell>
                                    <TableCell sx={{ '& .MuiFormHelperText-root': { position: 'absolute', bottom: -24, ml: 0 } }}>
                                      <TextField fullWidth id="item-name" placeholder="Item Name" value={item.name} disabled />
                                    </TableCell>
                                    <TableCell sx={{ '& .MuiFormHelperText-root': { position: 'absolute', bottom: -24, ml: 0 } }}>
                                      <TextField fullWidth id="item-qty" placeholder="Quantity" value={item.qty} disabled />
                                    </TableCell>
                                    <TableCell sx={{ '& .MuiFormHelperText-root': { position: 'absolute', bottom: -24, ml: 0 } }}>
                                      <TextField fullWidth id="item-price" placeholder="Price" value={item.price} disabled />
                                    </TableCell>
                                    <TableCell>
                                      <Stack direction="column" justifyContent="flex-end" alignItems="flex-end" spacing={2}>
                                        <Box sx={{ pr: 2, pl: 2 }}>
                                          <Typography>{'Rs.' + '' + (item.price * item.qty).toFixed(2)}</Typography>
                                        </Box>
                                      </Stack>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          <Divider />
                        </Grid>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container justifyContent="space-between" spacing={2} sx={{ pt: 2.5, pb: 2.5 }}>
                      <Grid item xs={3}>
                          <Stack spacing={1}>
                            <InputLabel>Sub Total (Items)</InputLabel>
                            <TextField
                              type="number"
                              fullWidth
                              name="subTotal"
                              id="subTotal"
                              placeholder="0.0"
                              value={subtotal.toFixed(2)}
                              disabled
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={3}>
                          <Stack spacing={1}>
                            <InputLabel>Discount(%)</InputLabel>
                            <TextField
                              type="number"
                              fullWidth
                              name="discount"
                              id="discount"
                              placeholder="0.0"
                              value={values.discount}
                              inputProps={{
                                min: 0
                              }}
                              disabled
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={3}>
                          <Stack spacing={1}>
                            <InputLabel>Tax(%)</InputLabel>
                            <TextField
                              type="number"
                              fullWidth
                              name="tax"
                              id="tax"
                              placeholder="0.0"
                              value={values.tax}
                              inputProps={{
                                min: 0
                              }}
                              disabled
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={3}>
                          <Stack spacing={1}>
                            <InputLabel>Grand Total (Items)</InputLabel>
                            <TextField
                              type="number"
                              fullWidth
                              name="grandTotal"
                              id="grandTotal"
                              placeholder="0.0"
                              value={total.toFixed(2)}
                              disabled
                            />
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>
                    {/* Total Price */}
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="total-price">Total Price</InputLabel>
                        <TextField
                          fullWidth
                          id="total-price"
                          placeholder="Enter Total Price"
                          {...getFieldProps('totalPrice')}
                          error={Boolean(touched.totalPrice && errors.totalPrice)}
                          helperText={touched.totalPrice && errors.totalPrice}
                          disabled
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  {!isCreating && (
                    <Tooltip title="Delete Project" placement="top">
                      <IconButton onClick={() => deleteHandler(project)} size="large" color="error">
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
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
      {!isCreating && (
        <AlertProjectDelete title={deletingProject.name} projectId={deletingProject._id} open={openAlert} handleClose={handleAlertClose} />
      )}
    </>
  );
};

ViewService.propTypes = {
  project: PropTypes.any,
  onCancel: PropTypes.func
};

export default ViewService;
