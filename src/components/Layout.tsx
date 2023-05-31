import Box from "@mui/material/Box";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box display={"flex"} flexDirection={"column"} height={"100%"}>
      <Header />
      <Box p={4} flexGrow={1}>
        {children}
      </Box>
    </Box>
  );
}
