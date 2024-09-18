"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  ExitToApp as ExitToAppIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import Image from 'next/image'
import Central from '@/public/central.jpg'

const Header = () => {
  const { user, loading, signIn, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (!loading && !user && pathname !== "/") {
      router.push("/");
    }
  }, [loading, user, router, pathname]);

  const navItems = useMemo(
    () => [
      { name: "Home", href: "/", icon: <HomeIcon /> },
      ...(user
        ? [
            { name: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
            { name: "Analytics", href: "/analytics", icon: <AnalyticsIcon /> },
          ]
        : []),
    ],
    [user]
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = async () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut();
    handleMenuClose();
  };

  const handleSignIn = () => {
    signIn();
    handleMenuClose();
  };

  const isActive = (path: string) => pathname === path;

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Service Call Manager
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} passHref>
            <ListItem>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItem>
          </Link>
        ))}
        <Divider />
        {user ? (
          <ListItem onClick={handleSignOut}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItem>
        ) : (
          <ListItem onClick={handleSignIn}>
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary="Sign In with Google" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{backgroundColor:"black"}}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
            aria-label="open drawer"
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Link href="/" passHref>
           <Image src={Central} alt="Service Call Manager" width={200} height={40} />

  
          </Link>

          {/* Desktop Navigation Menu */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexGrow: 1,
              paddingLeft: "1rem",
            }}
          >
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} passHref>
                <Button
                  color="inherit"
                  startIcon={item.icon}
                  sx={{
                    fontWeight: isActive(item.href) ? "bold" : "normal",
                    borderBottom: isActive(item.href)
                      ? "2px solid white"
                      : "none",
                  }}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </Box>

          {user ? (
            <>
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                aria-label="user menu"
              >
                <Avatar
                  alt={user.displayName || "User"}
                  src={user.photoURL || ""}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                keepMounted
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem onClick={handleMenuClose}>
                  <Typography variant="subtitle1">
                    {user.displayName}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleSignOut}>
                  <ExitToAppIcon sx={{ mr: 1 }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={handleSignIn}>
              Sign In with Google
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Toolbar />
    </>
  );
};

export default Header;
