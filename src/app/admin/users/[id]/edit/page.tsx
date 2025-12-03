'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper,
  useTheme,
  InputAdornment,
  Avatar,
  Chip,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Comment as CommentIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { User } from '../../../../../types/admin';

// Тип для градиентов
type GradientColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

type UserRole = 'admin' | 'manager' | 'user';

// Mock данные для демонстрации
const mockUsers: User[] = [
  {
    id: '1',
    login: 'admin',
    name: 'Администратор Системы',
    email: 'admin@example.com',
    phone: '+79999999999',
    datereg: new Date('2024-01-01'),
    dateactiv: new Date('2024-01-17'),
    avatar: '',
    role: 'admin',
    comment: 'Системный администратор с полными правами доступа',
  },
  {
    id: '2',
    login: 'manager1',
    name: 'Петр Петров',
    email: 'petr@example.com',
    phone: '+79998887766',
    datereg: new Date('2024-01-05'),
    dateactiv: new Date('2024-01-16'),
    avatar: '',
    role: 'manager',
    comment: 'Менеджер отдела продаж',
  },
];

export default function EditUserPage() {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [formData, setFormData] = useState<User | null>(null);
  const [originalData, setOriginalData] = useState<User | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Функция для получения градиента
  const getGradientBackground = (color: GradientColor): string => {
    const gradient = theme.palette.gradient as Record<GradientColor, string>;
    return gradient[color];
  };

  useEffect(() => {
    // Имитация загрузки данных пользователя
    const timer = setTimeout(() => {
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        setFormData(user);
        setOriginalData(user);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [userId]);

  // Отслеживание изменений с использованием useMemo или отдельного эффекта
  useEffect(() => {
    if (formData && originalData) {
      const changes = JSON.stringify(formData) !== JSON.stringify(originalData);
      // Используем setTimeout для асинхронного обновления состояния
      const timeoutId = setTimeout(() => {
        setHasChanges(changes);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData, originalData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // В реальном приложении здесь будет запрос к API
    console.log('Обновление пользователя:', formData);
    
    // Показываем уведомление об успехе
    alert('Пользователь успешно обновлен!');
    
    // Обновляем оригинальные данные
    setOriginalData(formData);
    setHasChanges(false);
    
    // Возвращаемся к списку пользователей
    router.push('/admin/users');
  };

  const handleChange = (field: keyof User) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!formData) return;
      
      const newFormData = {
        ...formData,
        [field]: e.target.value,
      };
      
      setFormData(newFormData);
      
      // Сразу проверяем изменения после обновления формы
      if (originalData) {
        const changes = JSON.stringify(newFormData) !== JSON.stringify(originalData);
        // Используем setTimeout для избежания синхронного обновления
        setTimeout(() => {
          setHasChanges(changes);
        }, 0);
      }
    };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setHasChanges(false);
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

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4">Загрузка...</Typography>
      </Box>
    );
  }

  if (!formData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" color="error">Пользователь не найден</Typography>
        <Button 
          onClick={() => router.push('/admin/users')}
          variant="contained"
          sx={{ mt: 2 }}
        >
          Вернуться к списку
        </Button>
      </Box>
    );
  }

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
            Редактирование пользователя
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/admin/users')}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Назад к списку
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
          Изменение данных пользователя {formData.name}
        </Typography>
      </Box>

      {hasChanges && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
          }}
        >
          У вас есть несохраненные изменения
        </Alert>
      )}

      <Grid container spacing={4} justifyContent="center">
        <Grid size={{ xs: 12, lg: 10 }}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {/* Preview карточка */}
              <Paper
                sx={{
                  p: 4,
                  background: getGradientBackground(getRoleColor(formData.role)),
                  color: 'white',
                  borderRadius: '24px 24px 0 0',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      fontSize: '2rem',
                      fontWeight: 600,
                    }}
                  >
                    {getInitials(formData.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                      {formData.name || 'Новый пользователь'}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {formData.login} • {getRoleLabel(formData.role)}
                    </Typography>
                    {formData.email && (
                      <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                        {formData.email}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>

              {/* Форма */}
              <Box sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={4}>
                    {/* Основная информация */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="primary" />
                        Основная информация
                      </Typography>
                      
                      <TextField
                        fullWidth
                        required
                        label="Логин"
                        value={formData.login}
                        onChange={handleChange('login')}
                        placeholder="Введите логин"
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Полное имя"
                        value={formData.name || ''}
                        onChange={handleChange('name')}
                        placeholder="Введите полное имя"
                        sx={{ mb: 3 }}
                      />

                      <TextField
                        fullWidth
                        select
                        label="Роль"
                        value={formData.role}
                        onChange={handleChange('role')}
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SecurityIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      >
                        <MenuItem value="user">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: getGradientBackground('primary'),
                              }}
                            />
                            Пользователь
                          </Box>
                        </MenuItem>
                        <MenuItem value="manager">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: getGradientBackground('warning'),
                              }}
                            />
                            Менеджер
                          </Box>
                        </MenuItem>
                        <MenuItem value="admin">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: getGradientBackground('error'),
                              }}
                            />
                            Администратор
                          </Box>
                        </MenuItem>
                      </TextField>
                    </Grid>

                    {/* Контактная информация */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon color="primary" />
                        Контактная информация
                      </Typography>

                      <TextField
                        fullWidth
                        type="email"
                        label="Email"
                        value={formData.email || ''}
                        onChange={handleChange('email')}
                        placeholder="Введите email"
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        type="tel"
                        label="Телефон"
                        value={formData.phone || ''}
                        onChange={handleChange('phone')}
                        placeholder="Введите телефон"
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Комментарий"
                        value={formData.comment || ''}
                        onChange={handleChange('comment')}
                        placeholder="Введите комментарий"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                              <CommentIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Кнопки действий */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 6, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                    <Button
                      type="button"
                      onClick={handleReset}
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      disabled={!hasChanges}
                      sx={{ borderRadius: 2 }}
                    >
                      Сбросить
                    </Button>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        type="button"
                        onClick={() => router.push('/admin/users')}
                        variant="outlined"
                        sx={{ borderRadius: 2, px: 4 }}
                      >
                        Отмена
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={!hasChanges}
                        sx={{
                          borderRadius: 2,
                          px: 4,
                          background: getGradientBackground('primary'),
                          '&:hover': {
                            background: getGradientBackground('primary'),
                            transform: 'translateY(-2px)',
                          },
                          '&.Mui-disabled': {
                            background: 'rgba(100, 116, 139, 0.1)',
                            color: 'rgba(100, 116, 139, 0.5)',
                          }
                        }}
                      >
                        Сохранить изменения
                      </Button>
                    </Box>
                  </Box>
                </form>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}