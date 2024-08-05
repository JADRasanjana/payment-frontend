import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

// material-ui
import {
  Autocomplete,
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
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
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
import { useTheme } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import { FieldArray, Form, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { v4 as UIDV4 } from 'uuid';

// project imports
import IconButton from 'components/@extended/IconButton';

import { dispatch } from 'store';

// assets
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import UploadSingleFile from 'components/third-party/dropzone/SingleFile';
import UploadAvatar from 'components/third-party/dropzone/Avatar';
import { ProjectStatuses } from '../../../config';
import { createProject, getProjectAttachment, updateProject, uploadProjectAttachment } from 'store/reducers/projects';
import AlertProjectDelete from './AlertProjectDelete';
import { createService, updateService } from 'store/reducers/service';
import { useSelector } from 'store';
import { getVehicles } from 'store/reducers/vehicle';
import { getInventories } from 'store/reducers/inventory';
import InvoiceItem from './InvoiceItem';

// ==============================|| CUSTOMER ADD / EDIT / DELETE ||============================== //

const AddProject = ({ project, onCancel }) => {
  const theme = useTheme();
  console.log('projects', project);
  const [openAlert, setOpenAlert] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [total, setTotal] = useState(0);

  const [deletingProject, setDeletingProject] = useState({
    _id: null,
    name: ''
  });

  const {
    vehicles: { vehicles },
    action
  } = useSelector((state) => state.vehicles);

  const { inventories:{inventory} } = useSelector((state) => state.inventories);

  useEffect(() => {
    dispatch(getVehicles());
    dispatch(getInventories());
  }, [action]);

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
      .required('End date is required'),
    vehicle: Yup.string().required('Vehicle number is required'),
    invoice_detail: Yup.array()
      .required('Invoice details is required')
      .of(
        Yup.object().shape({
          name: Yup.string().required('Product name is required')
        })
      )
      .min(1, 'Invoice must have at least 1 items')
  });

  const defaultValues = useMemo(
    () => ({
      vehicle: project ? project.vehicle : '',
      serviceCharge: project ? project.serviceCharge : 0,
      totalPrice: project ? project.totalPrice : 0,
      status: project ? project.status : '',
      description: project ? project.description : '',
      serviceDate: project ? new Date(project.serviceDate) : new Date(),
      nextServiceDate: project ? new Date(project.nextServiceDate) : null,
      note: project ? project.note : '',
      itemList: {
        itemName: project ? project.itemList?.itemName : '',
        qty: project ? project.itemList?.qty : null,
        price: project ? project.itemList?.price : ''
      },
      services: project ? project.services : '',
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
      // note: project ? project.note : ''
    }),
    [project]
  );

  // console.log('note>>>', project?.note);

  const formik = useFormik({
    enableReinitialize: true,
    // initialValues: getInitialValues(customer),
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
            console.log('service creation values', values);
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

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue, resetForm, values, handleChange, handleBlur } = formik;
  // const subtotal = values?.invoice_detail.reduce((prev, curr) => {
  //   if (curr.name.trim().length > 0) return prev + Number(curr.price * Math.floor(curr.qty));
  //   else return prev;
  // }, 0);
  // const taxRate = (values.tax * subtotal) / 100;
  // const discountRate = (values.discount * subtotal) / 100;
  // const total = subtotal - discountRate + taxRate;

  useEffect(() => {
    const calculatedSubtotal = values?.invoice_detail.reduce((prev, curr) => {
      if (curr.name.trim().length > 0) return prev + Number(curr.price * Math.floor(curr.qty));
      else return prev;
    }, 0);

    setSubtotal(calculatedSubtotal);
    const calculatedTaxRate = (values.tax * calculatedSubtotal) / 100;
    setTaxRate(calculatedTaxRate);
    const calculatedDiscountRate = (values.discount * calculatedSubtotal) / 100;
    setDiscountRate(calculatedDiscountRate);
    const calculatedTotal = calculatedSubtotal - calculatedDiscountRate + calculatedTaxRate;
    setTotal(calculatedTotal);
    const totalPrice = calculatedTotal + Number(values.serviceCharge);

    setFieldValue('totalPrice', totalPrice.toFixed(2));
  }, [values.invoice_detail, values.tax, values.discount, values.serviceCharge, setFieldValue]);

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{project ? 'Edit Service' : 'Create Service'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Grid container spacing={3}>
                    {/* vehicle number */}
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="vehicle-number">Vehicle Number</InputLabel>
                        <FormControl sx={{ width: '100%' }} error={Boolean(touched.vehicle && errors.vehicle)}>
                          <Autocomplete
                            fullWidth
                            disablePortal
                            id="vehicle-number"
                            options={vehicles}
                            getOptionLabel={(option) => option.numberPlate}
                            renderInput={(params) => <TextField {...params} label="Vehicle Number" />}
                            {...getFieldProps('vehicle')}
                            onChange={(event, value) => {
                              if (value) {
                                setFieldValue('vehicle', value._id);
                              } else {
                                setFieldValue('vehicle', '');
                              }
                            }}
                          />
                        </FormControl>
                      </Stack>
                    </Grid>
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
                        />
                      </Stack>
                    </Grid>
                    {/* Item List */}
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="item-list">Item List</InputLabel>
                        {/* <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              id="item-name"
                              placeholder="Item Name"
                              {...getFieldProps('itemList.itemName')}
                              error={Boolean(touched.itemList?.itemName && errors.itemList?.itemName)}
                              helperText={touched.itemList?.itemName && errors.itemList?.itemName}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              id="item-qty"
                              placeholder="Quantity"
                              {...getFieldProps('itemList.qty')}
                              error={Boolean(touched.itemList?.qty && errors.itemList?.qty)}
                              helperText={touched.itemList?.qty && errors.itemList?.qty}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              id="item-price"
                              placeholder="Price"
                              {...getFieldProps('itemList.price')}
                              error={Boolean(touched.itemList?.price && errors.itemList?.price)}
                              helperText={touched.itemList?.price && errors.itemList?.price}
                            />
                          </Grid>
                        </Grid> */}
                        <Grid item xs={12}>
                          <FieldArray
                            name="invoice_detail"
                            render={({ remove, push }) => {
                              return (
                                <>
                                  <TableContainer>
                                    <Table sx={{ minWidth: 650 }}>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>#</TableCell>
                                          <TableCell>Name</TableCell>
                                          {/* <TableCell>Description</TableCell> */}
                                          <TableCell>Qty</TableCell>
                                          <TableCell>Price</TableCell>
                                          <TableCell align="right">Amount</TableCell>
                                          <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {values.invoice_detail?.map((item, index) => (
                                          <TableRow key={item.id}>
                                            <TableCell>{values.invoice_detail.indexOf(item) + 1}</TableCell>
                                            <InvoiceItem
                                              inventory={inventory}
                                              key={item.id}
                                              id={item.id}
                                              index={index}
                                              name={item.name}
                                              description={item.description}
                                              qty={item.qty}
                                              price={item.price}
                                              onDeleteItem={(index) => remove(index)}
                                              onEditItem={handleChange}
                                              Blur={handleBlur}
                                              errors={errors}
                                              touched={touched}
                                              getFieldProps={getFieldProps}
                                              setFieldValue={setFieldValue}
                                            />
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                  <Divider />
                                  {touched.invoice_detail && errors.invoice_detail && !Array.isArray(errors?.invoice_detail) && (
                                    <Stack direction="row" justifyContent="center" sx={{ p: 1.5 }}>
                                      <FormHelperText error={true}>{errors.invoice_detail}</FormHelperText>
                                    </Stack>
                                  )}
                                  <Grid container justifyContent="space-between">
                                    <Grid item xs={12} md={8}>
                                      <Box sx={{ pt: 2.5, pr: 2.5, pb: 2.5, pl: 0 }}>
                                        <Button
                                          color="primary"
                                          startIcon={<PlusOutlined />}
                                          onClick={() =>
                                            push({
                                              id: UIDV4(),
                                              name: '',
                                              description: '',
                                              qty: 1,
                                              price: '1.00'
                                            })
                                          }
                                          variant="dashed"
                                          sx={{ bgcolor: 'transparent !important' }}
                                        >
                                          Add Item
                                        </Button>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                      <Grid container justifyContent="space-between" spacing={2} sx={{ pt: 2.5, pb: 2.5 }}>
                                        <Grid item xs={6}>
                                          <Stack spacing={1}>
                                            <InputLabel>Discount(%)</InputLabel>
                                            <TextField
                                              type="number"
                                              fullWidth
                                              name="discount"
                                              id="discount"
                                              placeholder="0.0"
                                              value={values.discount}
                                              onChange={handleChange}
                                              inputProps={{
                                                min: 0
                                              }}
                                            />
                                          </Stack>
                                        </Grid>
                                        <Grid item xs={6}>
                                          <Stack spacing={1}>
                                            <InputLabel>Tax(%)</InputLabel>
                                            <TextField
                                              type="number"
                                              fullWidth
                                              name="tax"
                                              id="tax"
                                              placeholder="0.0"
                                              value={values.tax}
                                              onChange={handleChange}
                                              inputProps={{
                                                min: 0
                                              }}
                                            />
                                          </Stack>
                                        </Grid>
                                      </Grid>
                                      <Grid item xs={12}>
                                        <Stack spacing={2}>
                                          <Stack direction="row" justifyContent="space-between">
                                            <Typography color={theme.palette.grey[500]}>Sub Total:</Typography>
                                            {/* <Typography>{country?.prefix + '' + subtotal.toFixed(2)}</Typography> */}
                                            {'Rs.' + '' + subtotal.toFixed(2)}
                                          </Stack>
                                          <Stack direction="row" justifyContent="space-between">
                                            <Typography color={theme.palette.grey[500]}>Discount:</Typography>
                                            <Typography variant="h6" color={theme.palette.success.main}>
                                              {/* {country?.prefix + '' + discountRate.toFixed(2)} */}
                                              {'Rs.' + '' + discountRate.toFixed(2)}
                                            </Typography>
                                          </Stack>
                                          <Stack direction="row" justifyContent="space-between">
                                            <Typography color={theme.palette.grey[500]}>Tax:</Typography>
                                            <Typography>
                                              {/* {country?.prefix + '' + taxRate.toFixed(2)} */}
                                              {'Rs.' + '' + taxRate.toFixed(2)}
                                            </Typography>
                                          </Stack>
                                          <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="subtitle1">Grand Total:</Typography>
                                            <Typography variant="subtitle1">
                                              {/* {total % 1 === 0 ? country?.prefix + '' + total : country?.prefix + '' + total.toFixed(2)} */}
                                              {total % 1 === 0 ? 'Rs.' + '' + total : 'Rs.' + '' + total.toFixed(2)}
                                            </Typography>
                                          </Stack>
                                        </Stack>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </>
                              );
                            }}
                          />
                        </Grid>
                      </Stack>
                    </Grid>
                    {/* Total Price */}
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="total-price">Total Price</InputLabel>
                        <TextField
                          fullWidth
                          id="total-price"
                          value={values.totalPrice}
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
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {project ? 'Edit' : 'Add'}
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

AddProject.propTypes = {
  project: PropTypes.any,
  onCancel: PropTypes.func
};

export default AddProject;
