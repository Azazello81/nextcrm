'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  useTheme,
  Avatar,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
  Comment as CommentIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Message as MessageIcon,
  Lock as LockIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { User } from '../../../../types/admin';

// Mock данные для демонстрации
const mockUser: User = {
  id: '1',
  login: 'admin',
  name: 'Администратор Системы',
  email: 'admin@example.com',
  phone: '+79999999999',
  datereg: new Date('2024-01-01'),
  dateactiv: new Date('2024-01-17'),
  avatar: '',
  role: 'admin',
  comment: 'Системный администратор с полными правами доступа ко всем функциям платформы',
};

// Тип для градиентов
type GradientColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

export default function UserViewPage({ params }: { params: { id: string } }) {
  const theme = useTheme();
  const router = useRouter();
  const user = mockUser;

  // Функция для получения градиента
  const getGradientBackground = (color: GradientColor): string => {
    const gradient = theme.palette.gradient as Record<GradientColor, string>;
    return gradient[color];
  };

  const getRoleColor = (role: string): GradientColor => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'manager':
        return 'Менеджер';
      default:
        return 'Пользователь';
    }
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    router.push(`/admin/users/${user.id}/edit`);
  };

  const handleSendMessage = () => {
    // В реальном приложении здесь будет логика отправки сообщения
    console.log('Отправка сообщения пользователю:', user.email);
  };

  const handleBlockUser = () => {
    // В реальном приложении здесь будет логика блокировки
    console.log('Блокировка пользователя:', user.id);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок с градиентом */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography 
            variant="h1" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
            }}
          >
            <PersonIcon sx={{ fontSize: '3rem' }} />
            Просмотр пользователя
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Назад
          </Button>
        </Box>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ 
            maxWidth: '600px',
            background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Детальная информация о пользователе системы
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Основная информация */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {/* Хедер с основной информацией */}
              <Paper
                sx={{
                  p: 4,
                  background: getGradientBackground(getRoleColor(user.role)),
                  color: 'white',
                  borderRadius: '24px 24px 0 0',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      fontSize: '2.5rem',
                      fontWeight: 600,
                    }}
                  >
                    {getInitials(user.name)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
                      {user.name || 'Без имени'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={`@${user.login}`}
                        size="small"
                        sx={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontWeight: 600,
                          backdropFilter: 'blur(10px)',
                        }}
                      />
                      <Chip
                        label={getRoleLabel(user.role)}
                        size="small"
                        sx={{
                          background: 'rgba(255, 255, 255, 0.3)',
                          color: 'white',
                          fontWeight: 600,
                          backdropFilter: 'blur(10px)',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Детальная информация */}
              <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  {/* Контактная информация */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon color="primary" />
                      Контактная информация
                    </Typography>

                    <Box sx={{ space: 3 }}>
                      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <EmailIcon color="primary" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {user.email || 'Не указан'}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>

                      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <PhoneIcon color="primary" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Телефон
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {user.phone || 'Не указан'}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Box>
                  </Grid>

                  {/* Системная информация */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SecurityIcon color="primary" />
                      Системная информация
                    </Typography>

                    <Box sx={{ space: 3 }}>
                      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <CalendarIcon color="primary" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Дата регистрации
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formatDate(user.datereg)}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>

                      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <RefreshIcon color="primary" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Последний вход
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formatDate(user.dateactiv)}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Box>
                  </Grid>

                  {/* Комментарий */}
                  {user.comment && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CommentIcon color="primary" />
                        Комментарий
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="body1">
                          {user.comment}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Боковая панель с действиями */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🚀 Быстрые действия
                </Typography>
              </Box>

              <Box sx={{ p: 3, space: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{
                    borderRadius: 2,
                    background: getGradientBackground('primary'),
                    '&:hover': {
                      background: getGradientBackground('primary'),
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  Редактировать профиль
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  onClick={handleSendMessage}
                  sx={{ borderRadius: 2 }}
                >
                  Отправить сообщение
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LockIcon />}
                  onClick={handleBlockUser}
                  color="error"
                  sx={{ borderRadius: 2 }}
                >
                  Заблокировать
                </Button>
              </Box>

              <Divider />

              {/* Статус системы */}
              <Box sx={{ p: 3 }}>
                <Alert 
                  severity="success" 
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    ✅ Аккаунт активен
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Пользователь имеет доступ ко всем функциям
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>

          {/* Дополнительная информация */}
          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                📊 Статистика
              </Typography>
              <Box sx={{ space: 2 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Активность за месяц
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    24 дня
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Сессии
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    156
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