import Box from "@mui/material/Box";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Box p={4}>{children}</Box>
    </>
  );
}
