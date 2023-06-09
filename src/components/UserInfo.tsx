import { User } from "@/types/user";
import { stringAvatar } from "@/utils/user";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";

export const UserInfo = ({ user }: { user: User }) => {
  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      gap={1}
      alignSelf={{ xs: "flex-start", lg: "inherit" }}
      maxWidth={220}
      width={"100%"}
    >
      <Link href={`/user/${user.id}`}>
        <Avatar {...stringAvatar(user.fullName)} />
      </Link>
      <div>
        <Link href={`/user/${user.id}`}>
          <Typography variant="body1">{user.fullName}</Typography>
        </Link>
        <Typography variant="caption">{user.email}</Typography>
      </div>
    </Box>
  );
};
