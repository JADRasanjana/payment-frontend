import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import PaymentTable from './components/payment-table';
import ScrollX from 'components/ScrollX';
import AlertPaymentDelete from './components/payment-delete-alert';
import { Chip, Dialog, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import AddPayment from './components/add-payment';
import { useMemo, useState } from 'react';
import { PopupTransition } from 'components/@extended/Transitions';
import { IndeterminateCheckbox } from 'components/third-party/ReactTable';
import Avatar from 'components/@extended/Avatar';
import { PatternFormat } from 'react-number-format';
import { CloseOutlined, EditTwoTone, EyeTwoTone } from '@ant-design/icons';

// ==============================|| PAYMNET- LIST ||============================== //

// Section Cell and Header
const SelectionCell = ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />;
const SelectionHeader = ({ getToggleAllPageRowsSelectedProps }) => (
  <IndeterminateCheckbox indeterminate {...getToggleAllPageRowsSelectedProps()} />
);

const IndexCell = ({ row, state }) => {
  return <Typography variant="subtitle1">{Number(row.id) + 1 + state.pageIndex * state.pageSize}</Typography>;
};

const CustomCell = ({ row }) => {
  const { values } = row;

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Avatar alt="Avatar 1" size="sm" src={values.photo} />
      <Stack spacing={0}>
        <Typography variant="subtitle1">{values.name}</Typography>
        <Typography variant="caption" color="textSecondary">
          {values.email}
        </Typography>
      </Stack>
    </Stack>
  );
};

const NumberFormatCell = ({ value }) => <PatternFormat displayType="text" format="+1 (###) ###-####" mask="_" defaultValue={value} />;

const StatusCell = ({ value }) => {
  switch (value) {
    case 0:
      return <Chip color="error" label="Inactive" size="small" variant="light" />;
    case 1:
      return <Chip color="success" label="Active" size="small" variant="light" />;
    case 'Pending':
    default:
      return <Chip color="info" label="Pending" size="small" variant="light" />;
  }
};

const ActionCell = (row, setPayment, setCustomerDeleteId, handleAdd, handleClose, theme) => {
  const collapseIcon = row.isExpanded ? (
    <CloseOutlined style={{ color: theme.palette.error.main }} />
  ) : (
    <EyeTwoTone twoToneColor={theme.palette.secondary.main} />
  );
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
      <Tooltip title="View">
        <IconButton
          color="secondary"
          onClick={(e) => {
            e.stopPropagation();
            row.toggleRowExpanded();
          }}
        >
          {collapseIcon}
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            setPayment(row.values);
            handleAdd();
          }}
        >
          <EditTwoTone twoToneColor={theme.palette.primary.main} />
        </IconButton>
      </Tooltip>
      {/* <Tooltip title="Delete">
        <IconButton
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
            setCustomerDeleteId({
              _id: row.values._id,
              name: row.values.name
            });
          }}
        >
          <DeleteTwoTone twoToneColor={theme.palette.error.main} />
        </IconButton>
      </Tooltip> */}
    </Stack>
  );
};

StatusCell.propTypes = {
  value: PropTypes.number
};

NumberFormatCell.propTypes = {
  value: PropTypes.string
};

CustomCell.propTypes = {
  row: PropTypes.object
};

SelectionCell.propTypes = {
  row: PropTypes.object
};

SelectionHeader.propTypes = {
  getToggleAllPageRowsSelectedProps: PropTypes.func
};

const PaymentListPage = () => {
  const theme = useTheme();

  const [add, setAdd] = useState(false);
  const [open, setOpen] = useState(false);
  const [paymnet, setPaymnet] = useState();
  const [deletingPaymnet, setDeletingPaymnet] = useState({
    _id: null,
    name: ''
  });

  const handleAdd = () => {
    setAdd(!add);
    if (paymnet && !add) setPaymnet(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: SelectionHeader,
        accessor: 'selection',
        Cell: SelectionCell,
        disableSortBy: true
      },
      {
        Header: '#',
        accessor: '_id',
        className: 'cell-center',
        Cell: IndexCell
      },
      {
        Header: 'Name',
        accessor: 'name',
        Cell: CustomCell
      },
      {
        Header: 'Address',
        accessor: 'address',
        disableSortBy: true
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Contact',
        accessor: 'phone',
        Cell: NumberFormatCell
      },
      {
        Header: 'Image',
        accessor: 'photo'
      },
      // {
      //   Header: 'Role',
      //   accessor: 'role._id'
      // },
      {
        Header: 'Paymnet Date',
        accessor: 'startDate'
      },
      // {
      //   Header: 'Date of Birth',
      //   accessor: 'dateOfBirth'
      // },
      {
        Header: 'Note',
        accessor: 'note'
      },
      // {
      //   Header: 'Status',
      //   accessor: 'accountStatus',
      //   Cell: StatusCell
      // },
      {
        Header: 'Actions',
        className: 'cell-center',
        disableSortBy: true,
        Cell: ({ row }) => ActionCell(row, setPaymnet, setDeletingPaymnet, handleAdd, handleClose, theme)
      }
    ],
    //
    [theme]
  );

  return (
    <MainCard content={false}>
      <ScrollX>
        <PaymentTable columns={columns} handleAdd={handleAdd} getHeaderProps={(column) => column.getSortByToggleProps()} />
      </ScrollX>
      <AlertPaymentDelete title={deletingPaymnet.name} paymnetId={deletingPaymnet._id} open={open} handleClose={handleClose} />
      {/* add Paymnet dialog */}
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={handleAdd}
        open={add}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <AddPayment payment={paymnet} onCancel={handleAdd} />
      </Dialog>
    </MainCard>
  );
};

export default PaymentListPage;
