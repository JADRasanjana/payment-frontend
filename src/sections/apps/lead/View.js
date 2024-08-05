// material-ui
import {
  Autocomplete,
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  Stack,
  TextField,
  Tooltip,
  Typography,
  createFilterOptions,
  styled,
  useMediaQuery
} from '@mui/material';

// third-party
import { PatternFormat } from 'react-number-format';
import * as yup from 'yup';
// project import
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import parse from 'html-react-parser';

// assets
import { AimOutlined, DeleteFilled, EnvironmentOutlined, MailOutlined, PhoneOutlined, PlusOutlined } from '@ant-design/icons';
import AutocompleteForms from 'sections/forms/validation/AutoCompleteForm';
import GoogleMapAutocomplete from 'sections/forms/validation/google-map-autocomplete';
import { useFormik } from 'formik';
import { Box } from '@mui/system';
import ChipSelect from 'sections/components-overview/select/ChipSelect';
import React, { useEffect, useState } from 'react';
import { PopupTransition } from 'components/@extended/Transitions';
import AddNote from './AddNote';
import { useParams } from 'react-router';
import { useSelector } from 'store';
import { dispatch } from 'store';
import { getLeads, uploadLeadImage, uploadUserDocuments } from 'store/reducers/leads';
import IconButton from 'components/@extended/IconButton';
import ConvertToProject from './ConvertToProject';
import AlertLeadDelete from './AlertLeadDelete';
import AlertDeletenote from './AlertDeleteNote';

const avatarImage = require.context('assets/images/users', true);

// ==============================|| ACCOUNT PROFILE - BASIC ||============================== //

const TabLead = () => {
  const { id } = useParams();
  const {
    leads: { leads, total },
    action
  } = useSelector((state) => state.leads);

  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    // onCancel();
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const selectedLead = leads.find((lead) => lead._id === id);

  useEffect(()=>{
    dispatch(getLeads());
  },[action]);

  console.log('selected lead', selectedLead);
  const matchDownMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const fileInput = React.useRef(null);
  const roles = ['User', 'Admin', 'Staff', 'Manager'];

  const skills = ['Java', 'HTML', 'Bootstrap', 'JavaScript', 'NodeJS', 'React', 'Angular', 'CI'];

  const filter = createFilterOptions();
  const filterSkills = createFilterOptions();

  const validationSchema = yup.object({
    role: yup
      .string()
      .trim()
      .required('Role selection is required')
      .matches(/^[a-z\d\-/#_\s]+$/i, 'Only alphanumerics are allowed')
      .max(50, 'Role must be at most 50 characters'),
    skills: yup
      .array()
      .of(
        yup
          .string()
          .trim()
          .required('Leading spaces found in your tag')
          .matches(/^[a-z\d\-/#.&_\s]+$/i, 'Only alphanumerics are allowed')
          .max(50, 'Skill tag field must be at most 50 characters')
      )
      .required('Skill selection is required')
      .min(3, 'Skill tags field must have at least 3 items')
      .max(15, 'Please select a maximum of 15 skills.')
  });

  const formik = useFormik({
    initialValues: {
      role: '',
      skills: []
    },
    validationSchema,
    onSubmit: () => {
      // dispatch(
      //   openSnackbar({
      //     open: true,
      //     message: 'Autocomplete - Submit Success',
      //     variant: 'alert',
      //     alert: {
      //       color: 'success'
      //     },
      //     close: false
      //   })
      // );
    }
  });

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1
  });

  const handleFileInputChange = (event) => {
    const file = event.target.files[0]; // Get the selected file
    console.log('file', file);
    if (file) {
      console.log('filr>>>', file);
      dispatch(uploadLeadImage({ leadId: selectedLead._id, file: file, schemaName:'lead' })); // Dispatch the uploadLeadImage thunk with the selected file
    }
  };

  const [addNote, setAddNote] = useState(false);
  const handleAddNote = () => {
    setAddNote(!addNote);
  };

  const [deletingNote, setDeletingNote] = useState({
    leadId: null,
    noteId: null
  });

  const [deletingFile, setDeletingFile] = useState({
    leadId: null,
    fileId: null
  })

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(!open);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={9}>
        {' '}
        <Typography variant="h2">
          {selectedLead?.contactInformation?.firstName}
          {` `}
          {selectedLead?.contactInformation?.lastName}
        </Typography>
      </Grid>{' '}
      {/* Empty space to push buttons to the right */}
      <Grid item xs={1} sx={{ textAlign: 'right', paddingRight: '2x' }}>
        <Button variant="contained" color="secondary" size="small">
          Message
        </Button>
      </Grid>
      <Grid item xs={2} sx={{ textAlign: 'left', paddingLeft: '2px' }}>
        <Button variant="contained" color="primary" size="small" onClick={handleOpenModal}>
          Convert to Project
        </Button>
      </Grid>
      <Grid item xs={12} sm={5} md={4} xl={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MainCard>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  {/* <Stack direction="row" justifyContent="flex-end">
                      <Chip label="Pro" size="small" color="primary" />
                    </Stack> */}
                  <Stack spacing={2.5} alignItems="center">
                    {/* <Avatar alt="Avatar 1" size="xl" src={avatarImage(`./default.png`)} /> */}
                    <Stack spacing={0.5} alignItems="flex-start">
                      <Typography variant="h5">
                        {selectedLead?.contactInformation?.firstName}
                        {` `}
                        {selectedLead?.contactInformation?.lastName}
                      </Typography>

                      <Typography color="secondary">{selectedLead?.contactInformation?.company}</Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <List component="nav" aria-label="main mailbox folders" sx={{ py: 0, '& .MuiListItem-root': { p: 0, py: 1 } }}>
                    <ListItem>
                      <ListItemIcon>
                        <MailOutlined />
                      </ListItemIcon>
                      <ListItemSecondaryAction>
                        <Typography align="right">{selectedLead?.contactInformation?.email}</Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneOutlined />
                      </ListItemIcon>
                      <ListItemSecondaryAction>
                        <Typography align="right">{selectedLead?.contactInformation?.phone1}</Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EnvironmentOutlined />
                      </ListItemIcon>
                      <ListItemSecondaryAction>
                        <Typography align="right">{selectedLead?.contactInformation?.address}</Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {/* <ListItem>
                      <ListItemIcon>
                        <EnvironmentOutlined />
                      </ListItemIcon>
                      <ListItemSecondaryAction>
                        <Link align="right" href="https://google.com" target="_blank">
                          https://anshan.dh.url
                        </Link>
                      </ListItemSecondaryAction>
                    </ListItem> */}
                  </List>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          {/* <Grid item xs={12}>
              <MainCard title="Skills">
                <Grid container spacing={1.25}>
                  <Grid item xs={6}>
                    <Typography color="secondary">Junior</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <LinearWithLabel value={30} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="secondary">UX Reseacher</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <LinearWithLabel value={80} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="secondary">Wordpress</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <LinearWithLabel value={90} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="secondary">HTML</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <LinearWithLabel value={30} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="secondary">Graphic Design</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <LinearWithLabel value={95} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="secondary">Code Style</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <LinearWithLabel value={75} />
                  </Grid>
                </Grid>
              </MainCard>
            </Grid> */}
        </Grid>
      </Grid>
      <Grid item xs={12} sm={7} md={8} xl={9}>
        <Grid container spacing={3}>
          {/* <Grid item xs={12}>
            <MainCard title="Task">
              <Typography color="secondary"></Typography>
            </MainCard>
          </Grid> */}

          <Grid item xs={12}>
            <MainCard title="Notes" sx={{ position: 'relative' }}>
              <Grid item xs={1}>
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  sx={{ position: 'absolute', right: '15px', top: '15px' }}
                  startIcon={<PlusOutlined />}
                  onClick={handleAddNote}
                >
                  {' '}
                  Add Note{' '}
                </Button>

                <Dialog
                  maxWidth="sm"
                  TransitionComponent={PopupTransition}
                  keepMounted
                  fullWidth
                  onClose={handleAddNote}
                  open={addNote}
                  sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
                  aria-describedby="alert-dialog-slide-description"
                >
                  <AddNote lead={selectedLead} onCancel={handleAddNote} />
                </Dialog>
              </Grid>
              {selectedLead?.leadNote?.map((note, index) => (
                // <Grid item xs={12} key={index} width="100%">
                <>
                  <Card
                    key={index}
                    sx={{
                      maxWidth: '100%',
                      width: '100%',
                      padding: '10px',
                      boxShadow: 'none',
                      borderBottom: 'solid 1px',
                      borderColor: '#dbdbdb',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography>
                      {parse(note.note)}
                      {/* {note.note} */}
                    </Typography>
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      // sx={{ position: 'absolute', right: '15px', top: '15px' }}
                      // startIcon={<PlusOutlined />}
                      onClick={() => {
                        setDeletingNote({
                          leadId: selectedLead?._id,
                          noteId: note._id
                        });
                        handleClose();
                      } }
                    >
                      Remove Note
                    </Button>
                  </Card>
                  {deletingNote.noteId && (
                    <AlertDeletenote title={deletingNote?.noteId?.createdBy} deletingNote={deletingNote} open={open}
                    handleClose={handleClose} type='notedelete'
                    />
                  )}
                  
                  </>
              ))}
            </MainCard>
          </Grid>

          <Grid item xs={12}>
            <MainCard title="Files" sx={{ position: 'relative' }}>
              <Grid item xs={1}>
                {/* <Button variant="text" color='primary'  size="small" sx={{position: 'absolute', right:'15px', top: '15px'}} startIcon={<PlusOutlined />} onClick={() => fileInput.current.click()}> Add File </Button> */}
                <Button
                  component="label"
                  role={undefined}
                  variant="text"
                  tabIndex={-1}
                  startIcon={<PlusOutlined />}
                  sx={{ position: 'absolute', right: '15px', top: '15px' }}
                >
                  Upload file
                  {/* <VisuallyHiddenInput type="file" /> */}
                  <input type="file" onChange={handleFileInputChange} style={{ display: 'none' }} ref={fileInput} />
                </Button>
              </Grid>
              {selectedLead?.leadFiles?.map((file, index) => (
                <><Card
                  key={index}
                  sx={{
                    maxWidth: '100%',
                    width: '100%',
                    padding: '10px',
                    boxShadow: 'none',
                    borderBottom: 'solid 1px',
                    borderColor: '#dbdbdb',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Link
                    href={file.fileUrl}
                    target="_blank"
                    sx={{
                      ':hover': {
                        textDecoration: 'underline',
                        color: 'black' // Set the color to black on hover
                      }
                    }}
                  >
                    <Typography>{file.fileName}</Typography>
                  </Link>
                  {/* <Typography>{file.fileName}</Typography> */}
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    onClick={() => {
                      setDeletingFile({
                        leadId: selectedLead?._id,
                        fileId: file._id
                      });
                      handleClose();
                    } }
                  >
                    Remove File
                  </Button>
                </Card>
                {deletingFile.fileId && (
                  <AlertDeletenote title={deletingFile?.fileId?.createdBy} deletingNote={deletingFile} open={open} type={'filedelete'} handleClose={handleClose}/>
                )}
                
                </>
              ))}
            </MainCard>
          </Grid>

          {/* <Grid item xs={12}>
            <MainCard title="Date and Location">
              <GoogleMapAutocomplete />
            </MainCard>
          </Grid> */}
          <Grid item xs={12}>
            { false && (
              <MainCard title="Tags">
              <Autocomplete
                id="skills"
                multiple
                fullWidth
                autoHighlight
                freeSolo
                disableCloseOnSelect
                options={skills}
                value={formik.values.skills}
                onBlur={formik.handleBlur}
                getOptionLabel={(option) => option}
                onChange={(event, newValue) => {
                  const jobExist = skills.includes(newValue[newValue.length - 1]);
                  if (!jobExist) {
                    formik.setFieldValue('skills', newValue);
                  } else {
                    formik.setFieldValue('skills', newValue);
                  }
                }}
                filterOptions={(options, params) => {
                  const filtered = filterSkills(options, params);
                  const { inputValue } = params;
                  const isExisting = options.some((option) => inputValue === option);
                  if (inputValue !== '' && !isExisting) {
                    filtered.push(inputValue);
                  }

                  return filtered;
                }}
                renderOption={(props, option) => {
                  return (
                    <Box component="li" {...props}>
                      {!skills.some((v) => option.includes(v)) ? `Add "${option}"` : option}
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="skills"
                    placeholder="Write your skills"
                    error={formik.touched.skills && Boolean(formik.errors.skills)}
                    // helperText={TagsError}
                  />
                )}
              />
              <Dialog open={openModal} onClose={handleCloseModal}>
                <ConvertToProject lead={selectedLead} onCancel={handleCloseModal} />
              </Dialog>
            </MainCard>
            )}
            
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TabLead;
