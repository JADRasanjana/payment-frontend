import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { Autocomplete, Box, Button, Stack, TableCell, TextField, Tooltip, Typography } from '@mui/material';

// third-party
import { getIn } from 'formik';

// project import
import { dispatch, useSelector } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

// assets
import { DeleteOutlined } from '@ant-design/icons';
import AlertProductDelete from '../invoice/AlertProductDelete';

// ==============================|| INVOICE - ITEMS ||============================== //

const InvoiceItem = ({ id, name, description, qty, price, onDeleteItem, onEditItem, index, Blur, errors, touched, inventory, setFieldValue, getFieldProps }) => {
  const { country } = useSelector((state) => state.invoice);
  console.log("name???????", name);

  const [open, setOpen] = useState(false);
  const handleModalClose = (status) => {
    setOpen(false);
    if (status) {
      onDeleteItem(index);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Product Deleted successfully',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: false
        })
      );
    }
  };

  const Name = `invoice_detail[${index}].name`;
  const touchedName = getIn(touched, Name);
  const errorName = getIn(errors, Name);

  const textFieldItem = [
    {
      placeholder: 'Item name',
      label: 'Item Name',
      name: `invoice_detail.${index}.name`,
      type: 'text',
      id: id,
      value: name,
      errors: errorName,
      touched: touchedName
    },
    // {
    //   placeholder: 'Description',
    //   label: 'Description',
    //   name: `invoice_detail.${index}.description`,
    //   type: 'text',
    //   id: id,
    //   value: description
    // },
    { placeholder: '', label: 'Qty', type: 'number', name: `invoice_detail.${index}.qty`, id: id, value: qty },
    { placeholder: '', label: 'price', type: 'number', name: `invoice_detail.${index}.price`, id: id, value: price }
  ];

  return (
    <>
      {/* {textFieldItem.map((item) => {
        return (
          <InvoiceField
            onEditItem={(event) => onEditItem(event)}
            onBlur={(event) => Blur(event)}
            cell={{
              placeholder: item.placeholder,
              name: item.name,
              type: item.type,
              id: item.id,
              value: item.value,
              errors: item.errors,
              touched: item.touched
            }}
            key={item.label}
          />
        );
      })} */}
      <TableCell sx={{ '& .MuiFormHelperText-root': { position: 'absolute', bottom: -24, ml: 0 } }}>
        <Autocomplete
          name={`invoice_detail.${index}.name`}
          // fullWidth
          disablePortal
          id="item-name"
          options={inventory}
          getOptionLabel={(option) => `${option.materialName}`}
          renderInput={(params) => <TextField {...params} />}
          value={inventory.find(item => item.materialName === name) || null}
          onChange={(event, option) => {
            if (option) {
              setFieldValue(`invoice_detail.${index}.name`, option.materialName);
              setFieldValue(`invoice_detail.${index}.price`, option.purchasedPrice); // Assuming 'price' is a field in your inventory items
              onEditItem({ target: { name: `invoice_detail.${index}.name`, value: option.materialName } });
              onEditItem({ target: { name: `invoice_detail.${index}.price`, value: option.purchasedPrice } });
            }
          }}
        />
      </TableCell>
      <TableCell sx={{ '& .MuiFormHelperText-root': { position: 'absolute', bottom: -24, ml: 0 } }}>
        <TextField
          type="number"
          placeholder=""
          name={`invoice_detail.${index}.qty`}
          id={id}
          value={qty}
          onChange={onEditItem}
          // label="Qty"
          inputProps={{
            ...{ min: 0 }
          }}
        />
      </TableCell>
      <TableCell sx={{ '& .MuiFormHelperText-root': { position: 'absolute', bottom: -24, ml: 0 } }}>
        <TextField
          type="number"
          placeholder=""
          name={`invoice_detail.${index}.price`}
          id={id}
          value={price}
          onChange={onEditItem}
          // label="price"
          inputProps={{
            ...{ min: 0 }
          }}
        />
      </TableCell>
      <TableCell>
        <Stack direction="column" justifyContent="flex-end" alignItems="flex-end" spacing={2}>
          <Box sx={{ pr: 2, pl: 2 }}>
            {/* <Typography>{country?.prefix + '' + (price * qty).toFixed(2)}</Typography> */}
            <Typography>{'Rs.' + '' + (price * qty).toFixed(2)}</Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Tooltip title="Remove Item">
          <Button color="error" onClick={() => setOpen(true)}>
            <DeleteOutlined />
          </Button>
        </Tooltip>
      </TableCell>
      <AlertProductDelete title={name} open={open} handleClose={handleModalClose} />
    </>
  );
};

InvoiceItem.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  qty: PropTypes.number,
  price: PropTypes.string,
  onDeleteItem: PropTypes.func,
  onEditItem: PropTypes.func,
  index: PropTypes.number,
  Blur: PropTypes.func,
  errors: PropTypes.object,
  touched: PropTypes.object
};

export default InvoiceItem;
