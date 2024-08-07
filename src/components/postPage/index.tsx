import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import SyncIcon from "@mui/icons-material/Sync";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "../../constants";
import useMessage from "../../hooks/useMessage";
import { deletePost, getPostPage } from "../../services/postsService";
import { formatErrorMessage } from "../../services/utils/transform-response";
import { formatDate } from "../../utils/time-util";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { NavIconButton } from "../common/NavIconButton";
import { BasePage, PageContext } from "../common/page/Page";
import { RouterBreadcurmbs } from "../RouterBreadcrumbs";
const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "标题",
    headerAlign: "center",
    minWidth: 200,
    align: "center",
  },
  {
    field: "content",
    headerName: "内容",
    headerAlign: "center",
    minWidth: 400,
    align: "center",
    valueFormatter: (content: string) => {
      return content.length > 20 ? content.slice(0, 20) + "..." : content;
    },
  },
  {
    field: "version",
    headerName: "版本",
    headerAlign: "center",
    minWidth: 100,
    align: "center",
  },
  {
    field: "createTime",
    headerName: "创建时间",
    headerAlign: "center",
    minWidth: 200,
    align: "center",
    valueFormatter: (params: Date) => {
      return formatDate(params);
    },
  },
  {
    field: "...",
    headerName: "...",
    headerAlign: "center",
    flex: 1,
    align: "center",
    disableColumnMenu: true,
    renderCell: (params) => (
      <OptionCell id={params.row.id} postId={params.row.postId} />
    ),
  },
];

const OptionCell = ({ id, postId }: { id: string; postId: string }) => {
  const [open, setOpen] = useState(false);
  const message = useMessage();
  const ctx = useContext(PageContext);

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <NavIconButton aria-label="edit" color="primary" path={`/posts/${id}`}>
        <EditIcon />
      </NavIconButton>
      <IconButton
        aria-label="delete"
        color="error"
        onClick={() => {
          setOpen(true);
        }}
      >
        <DeleteIcon />
      </IconButton>
      <ConfirmDialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onConfirm={() => {
          deletePost(id)
            .then(() => {
              message.info("删除成功");
              getPostPage({
                page: DEFAULT_PAGE,
                pageSize: DEFAULT_PAGE_SIZE,
                all: ctx?.attributes?.get("all"),
              })
                .then((data) => ctx?.setData(data))
                .catch((error) => {
                  message.error(formatErrorMessage(error));
                });
            })
            .catch((error) => {
              message.error(formatErrorMessage(error));
            })
            .finally(() => {
              setOpen(false);
            });
        }}
        title={"删除文章"}
        content={"确定要删除这篇文章吗?"}
      />
      <NavIconButton aria-label="sync" path={`/posts/sync/${postId}`}>
        <SyncIcon />
      </NavIconButton>
      <NavIconButton
        sx={{ color: "#6A5ACD" }}
        aria-label="history"
        path={`/posts/history/${postId}`}
      >
        <ManageHistoryIcon />
      </NavIconButton>
    </Box>
  );
};

export const PostPage = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: 300,
        height: "100%",
        width: "100%",
        flexGrow: 1,
        overflow: "hidden",
      }}
    >
      <RouterBreadcurmbs />
      <Box display={"flex"} justifyContent={"space-between"} mt={1} mb={2}>
        <Typography variant="h5">文章列表</Typography>
        <Box display={"flex"} justifyContent={"flex-end"} gap={1}>
          <Button
            type="button"
            variant="contained"
            onClick={() => navigate("/posts/new")}
          >
            创建新文章
          </Button>
        </Box>
      </Box>
      <BasePage
        colDef={columns}
        onPageChange={(page, pageSize) => {
          return getPostPage({
            page: page,
            pageSize: pageSize,
          });
        }}
      />
    </Box>
  );
};
