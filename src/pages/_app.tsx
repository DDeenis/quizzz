import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";
import CssBaseline from "@mui/material/CssBaseline";
import "@/styles/globals.css";
import Layout from "@/components/Layout";

import { api } from "@/utils/api";
import "@/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <CssBaseline />
      <main className={GeistSans.className}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </main>
    </>
  );
};

export default api.withTRPC(MyApp);
