import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { UserInfo } from "./UserInfo";
import Divider from "@mui/material/Divider";
import { formatDate } from "@/utils/questions";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import React from "react";
import { api } from "@/utils/api";
import { type User } from "@/types/user";

export const AdminUsersTab = () => {
  const users = api.admin.getAllUsers.useQuery(undefined, {
    enabled: false,
    staleTime: Infinity,
  });
  const deleteUser = api.admin.deleteUser.useMutation();
  const restoreUser = api.admin.restoreUser.useMutation();

  const onDelete = (userId: string) => {
    void deleteUser.mutateAsync({ userId }).then((isDeleted) => {
      if (isDeleted) {
        void users.refetch();
      }
    });
  };
  const onRestore = (userId: string) => {
    void restoreUser.mutateAsync({ userId }).then((isRestored) => {
      if (isRestored) {
        void users.refetch();
      }
    });
  };

  React.useEffect(() => {
    if (!users.isSuccess) {
      void users.refetch();
    }
  }, [users]);

  return (
    <>
      {users.data && users.data.length === 0 && (
        <Typography variant="subtitle2" textAlign={"center"}>
          No data to display
        </Typography>
      )}
      {users.isLoading && (
        <Typography variant="subtitle2" textAlign={"center"}>
          Loading...
        </Typography>
      )}
      <Box display={"flex"} flexDirection={"column"} gap={2}>
        {users.data?.map((u) => (
          <UserCard
            user={u}
            onDelete={onDelete}
            onRestore={onRestore}
            key={u.id}
          />
        ))}
      </Box>
    </>
  );
};

const UserCard = ({
  user,
  onDelete,
  onRestore,
}: {
  user: User;
  onDelete: (userId: string) => void;
  onRestore: (userId: string) => void;
}) => {
  const isDeleted = !!user.deletedAt;

  const handleDelete = () => {
    if (!user.isAdmin) {
      onDelete(user.id);
    }
  };
  const handleRestore = () => {
    if (!user.isAdmin) {
      onRestore(user.id);
    }
  };

  return (
    <Box
      border={"1px solid"}
      borderColor={"lightgray"}
      borderRadius={2}
      px={2}
      py={1}
      display={"flex"}
      flexDirection={{ xs: "column", lg: "row" }}
      alignItems={"center"}
      gap={2}
      bgcolor={isDeleted ? "lightgray" : "transparent"}
    >
      <UserInfo user={user} />
      <Divider orientation="vertical" flexItem />
      <Box ml={{ lg: 1 }}>
        <Typography variant="body2">
          Registered at {formatDate(user.createdAt)}
        </Typography>
        <Typography variant="body2">
          Role: {user.isAdmin ? "Admin" : "Student"}
        </Typography>
      </Box>
      {isDeleted && (
        <Typography ml={{ lg: "auto" }}>
          Deleted at {formatDate(user.deletedAt!)}
        </Typography>
      )}
      <Divider
        orientation="vertical"
        flexItem
        sx={{ ml: isDeleted ? 0 : "auto" }}
      />
      {isDeleted ? (
        <Button color="info" disabled={user.isAdmin} onClick={handleRestore}>
          <RestoreIcon sx={{ mr: 1 }} />
          Restore
        </Button>
      ) : (
        <Button color="error" disabled={user.isAdmin} onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </Button>
      )}
    </Box>
  );
};
