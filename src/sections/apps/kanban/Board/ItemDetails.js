import { useEffect, useState } from 'react';

// material-ui
import { Box, Divider, Drawer, Grid, Stack, Tooltip, Typography } from '@mui/material';

// project imports
import ItemComment from './ItemComment';
import EditItem from './EditItem';
import AddItemComment from './AddItemComment';
import AlertItemDelete from './AlertItemDelete';
import SimpleBar from 'components/third-party/SimpleBar';

import { useDispatch, useSelector } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { selectItem, deleteItem } from 'store/reducers/kanban';

// assets
import { CloseOutlined, DeleteFilled } from '@ant-design/icons';

import IconButton from 'components/@extended/IconButton';
import AlertTaskItemDelete from "./AlertTaskItemDelete";
import {clearSubTasksOrder, deleteTask, setSelectedTask} from "../../../../store/reducers/tasks";
import EditTaskItem from "./EditTaskItem";

// ==============================|| KANBAN BOARD - ITEM DETAILS ||============================== //

const ItemDetails = () => {
  let selectedData;
  let commentList = <></>;

  const dispatch = useDispatch();
  const kanban = useSelector((state) => state.kanban);
  const { columns, comments, profiles, items, selectedItem, userStory } = kanban;

    const { task } = useSelector((state) => state.tasks);

  // drawer
  const [open, setOpen] = useState(!!task);
  const handleDrawerOpen = () => {
    setOpen((prevState) => !prevState);
    dispatch(setSelectedTask(null));
    dispatch(clearSubTasksOrder());
  };

  useEffect(() => {
      setOpen(!!task);
  }, [task]);

  if (task !== false) {
    // selectedData = items.filter((item) => item.id === selectedItem)[0];
    // if (selectedData?.commentIds) {
    //   commentList = [...selectedData.commentIds].reverse().map((commentId, index) => {
    //     const commentData = comments.filter((comment) => comment.id === commentId)[0];
    //     const profile = profiles.filter((item) => item.id === commentData.profileId)[0];
    //     return <ItemComment key={index} comment={commentData} profile={profile} />;
    //   });
    // }
  }

  const [openModal, setOpenModal] = useState(false);

  const handleModalClose = (status) => {
    setOpenModal(false);
    if (status) {
      handleDrawerOpen();
      dispatch(deleteTask(task.project, task.board, task._id));
    }
  };

  return (
    <Drawer
      sx={{
        ml: open ? 3 : 0,
        flexShrink: 0,
        zIndex: 1200,
        overflowX: 'hidden',
        width: { xs: 320, md: 450 },
        '& .MuiDrawer-paper': {
          width: { xs: 320, md: 450 },
          border: 'none',
          borderRadius: '0px'
        }
      }}
      variant="temporary"
      anchor="right"
      open={open}
      ModalProps={{ keepMounted: true }}
      onClose={handleDrawerOpen}
    >
      {open && (
        <SimpleBar
          sx={{
            overflowX: 'hidden',
            height: '100vh'
          }}
        >
          {task && (
            <>
              <Box sx={{ p: 3 }}>
                <Grid container alignItems="center" spacing={0.5} justifyContent="space-between">
                  <Grid item sx={{ width: 'calc(100% - 64px)' }}>
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="space-between">
                      <Typography
                        variant="h4"
                        sx={{
                          display: 'inline-block',
                          width: 'calc(100% - 34px)',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          verticalAlign: 'middle'
                        }}
                      >
                        {task.title}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item>
                    <Stack direction="row" alignItems="center">
                      <Tooltip title="Delete Task">
                        <IconButton color="error" onClick={() => setOpenModal(true)} size="small" sx={{ fontSize: '0.875rem' }}>
                          <DeleteFilled />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Close">
                        <IconButton color="secondary" onClick={handleDrawerOpen} size="small" sx={{ fontSize: '0.875rem' }}>
                          <CloseOutlined />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <AlertTaskItemDelete title={task.title} open={openModal} handleClose={handleModalClose} />
                  </Grid>
                </Grid>
              </Box>
              <Divider />
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <EditTaskItem
                      item={task}
                      profiles={profiles}
                      columns={columns}
                      handleDrawerOpen={handleDrawerOpen}
                    />
                  </Grid>
                  {/*<Grid item xs={12}>*/}
                  {/*  {commentList}*/}
                  {/*</Grid>*/}
                  {/*<Grid item xs={12}>*/}
                  {/*  <AddItemComment itemId={selectedItem} />*/}
                  {/*</Grid>*/}
                </Grid>
              </Box>
            </>
          )}
          {!task && (
            <Stack justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
              <Typography variant="h5" color="error">
                No item found
              </Typography>
            </Stack>
          )}
        </SimpleBar>
      )}
    </Drawer>
  );
};

export default ItemDetails;
