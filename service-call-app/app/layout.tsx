import Header from "@/components/NavBar";
import "./globals.css";
import * as React from "react";
import { AuthProvider } from "@/components/AuthContext";
import { AppProvider } from "@toolpad/core/nextjs";
import { Home } from "@mui/icons-material";
import DashboardIcon from "@mui/icons-material/Dashboard";

import BarChartIcon from "@mui/icons-material/BarChart";

import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import type { Router, Navigation } from "@toolpad/core";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const NAVIGATION: Navigation = [
    {
      kind: "header",
      title: "Main items",
    },
    {
      segment: "",
      title: "Home",
      icon: <Home />,
    },
    {
      segment: "dashboard",
      title: "Dashboard",
      icon: <DashboardIcon />,
    },
    {
      segment: "analytics",
      title: "Analytics",
      icon: <BarChartIcon />,
    },
  ];

  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/png"
          sizes="32x32"
        />
      </head>

      <body>
        <AuthProvider>
          <AppProvider
            navigation={NAVIGATION}
            branding={{
              logo: <img src="/central.jpg" alt="logo" />,
              title: "Central Distributing",
            }}
          >
            <DashboardLayout>{children}</DashboardLayout>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
