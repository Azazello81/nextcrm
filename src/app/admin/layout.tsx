'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';

import theme from '../../lib/theme';
import { useUserProfile, handleLogout as storeLogout, useAuthStore } from '@/stores/auth-store';

const drawerWidth = 240;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user: storeUser, isAdmin } = useUserProfile();
  const isLoading = useAuthStore((s) => s.isLoading);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!storeUser || !isAdmin) {
        router.push('/auth/signin');
      }
    }
  }, [isLoading, storeUser, isAdmin, router]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const handleDrawerClose = () => {
    if (isMobile) {
      setMobileOpen(false);
    } else {
      setDesktopOpen(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    storeLogout();
    handleMenuClose();
    router.push('/');
  };

  const handleDrawerTransitionEnd = () => {
    if (!mobileOpen && drawerRef.current && isMobile) {
      const menuButton = document.querySelector('[aria-label="open drawer"]') as HTMLElement;
      if (menuButton) {
        menuButton.focus();
      }
    }
  };

  const menuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Пользователи', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Настройки', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: 'background.default',
          }}
        >
          <Typography>Загрузка панели администратора...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (!storeUser) {
    return null;
  }

  const drawerContent = (
    <div ref={drawerRef}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          minHeight: '64px !important',
        }}
      >
        <Typography variant="h6" noWrap component="div">
          NextCRM
        </Typography>
        <IconButton onClick={handleDrawerClose} aria-label="close drawer" size="small">
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                router.push(item.path);
                if (isMobile) {
                  handleDrawerClose();
                }
              }}
              sx={{
                minHeight: 48,
                px: 3,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 3,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            width: { md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
            ml: { md: desktopOpen ? `${drawerWidth}px` : 0 },
            zIndex: (theme) => theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Панель администратора
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {storeUser?.name}
              </Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {storeUser?.name?.charAt(0) || 'A'}
                </Avatar>
              </IconButton>
            </Box>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Профиль</MenuItem>
              <MenuItem onClick={handleMenuClose}>Настройки</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Выйти
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Drawer для мобильных */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerClose}
            onTransitionEnd={handleDrawerTransitionEnd}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* Drawer для десктопа */}
        {!isMobile && (
          <Drawer
            variant="persistent"
            open={desktopOpen}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* Основной контент */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: '100%',
            minHeight: '100vh',
            backgroundColor: 'background.default',
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: isMobile ? 0 : desktopOpen ? `${drawerWidth}px` : 0,
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
