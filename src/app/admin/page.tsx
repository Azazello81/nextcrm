'use client';

import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Paper,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  RocketLaunch as RocketIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { Stats, RecentUser, StatCardProps } from '../../types/admin';

// Mock данные для статистики
const mockStats: Stats = {
  totalUsers: 156,
  activeToday: 23,
  newThisMonth: 42,
  adminUsers: 3,
};

const mockRecentUsers: RecentUser[] = [
  { id: 1, name: 'Иван Иванов', email: 'ivan@example.com', role: 'user', date: new Date() },
  { id: 2, name: 'Петр Петров', email: 'petr@example.com', role: 'manager', date: new Date() },
  { id: 3, name: 'Мария Сидорова', email: 'maria@example.com', role: 'user', date: new Date() },
  { id: 4, name: 'Анна Козлова', email: 'anna@example.com', role: 'user', date: new Date() },
  { id: 5, name: 'Сергей Смирнов', email: 'sergey@example.com', role: 'manager', date: new Date() },
];

// Тип для градиентов
type GradientColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

const StatCard = ({ title, value, icon, color = 'primary' }: StatCardProps) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: (theme) => theme.palette.gradient[color as GradientColor],
      }}
    />
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1 }}>
          <Typography 
            color="textSecondary" 
            gutterBottom 
            variant="overline" 
            sx={{ 
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h3" 
            component="div" 
            sx={{ 
              fontWeight: 800,
              background: (theme) => theme.palette.gradient[color as GradientColor],
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            background: (theme) => theme.palette.gradient[color as GradientColor],
            color: 'white',
            ml: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function AdminPage() {
  const theme = useTheme();
  const [stats, setStats] = useState<Stats>(mockStats);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(mockStats);
      setRecentUsers(mockRecentUsers);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getRoleColor = (role: string): GradientColor => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      default: return 'primary';
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'manager': return 'Менеджер';
      default: return 'Пользователь';
    }
  };

  // Функция для получения градиента с правильным типом
  const getGradientBackground = (color: GradientColor): string => {
    const gradient = theme.palette.gradient as Record<GradientColor, string>;
    return gradient[color];
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Загрузка дашборда...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок с градиентом */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography 
          variant="h1" 
          gutterBottom
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2,
            mb: 2
          }}
        >
          <RocketIcon sx={{ fontSize: '3rem' }} />
          Панель управления
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ 
            maxWidth: '600px', 
            mx: 'auto',
            background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AI-ассистируемая аналитика в реальном времени
        </Typography>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Всего пользователей"
            value={stats.totalUsers}
            icon={<PeopleIcon sx={{ fontSize: 28 }} />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Активных сегодня"
            value={stats.activeToday}
            icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Новых за месяц"
            value={stats.newThisMonth}
            icon={<ScheduleIcon sx={{ fontSize: 28 }} />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Администраторов"
            value={stats.adminUsers}
            icon={<SecurityIcon sx={{ fontSize: 28 }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Последние пользователи */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    fontWeight: 600,
                  }}
                >
                  <AutoAwesomeIcon color="primary" />
                  Последние пользователи
                </Typography>
              </Box>
              <List sx={{ p: 2 }}>
                {recentUsers.map((user: RecentUser, index: number) => {
                  const roleColor = getRoleColor(user.role);
                  return (
                    <ListItem 
                      key={user.id} 
                      sx={{ 
                        borderRadius: 3,
                        mb: 1,
                        background: index % 2 === 0 ? 'rgba(99, 102, 241, 0.02)' : 'transparent',
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            background: getGradientBackground('primary'),
                            fontWeight: 600,
                          }}
                        >
                          {user.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={600}>
                            {user.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        }
                      />
                      <Chip
                        label={getRoleLabel(user.role)}
                        color={roleColor}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          background: getGradientBackground(roleColor),
                          color: 'white',
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Системная информация */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mb: 3,
                }}
              >
                <NotificationsIcon color="info" />
                Системная информация
              </Typography>
              <Box sx={{ space: 2 }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    mb: 2, 
                    borderRadius: 1,
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }} color="info.main">
                    <Box component="span" sx={{ animation: 'pulse 2s infinite' }}>🚀</Box>
                    <strong> Режим:</strong> AI-ассистируемый
                  </Typography>
                </Paper>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    mb: 2,
                    borderRadius: 1,
                    background: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    <strong>База данных:</strong> Mock данные
                  </Typography>
                </Paper>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3,
                    borderRadius: 1,
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }} color="success.main">
                    <strong>Статус:</strong> ✅ Система оптимизирована
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}