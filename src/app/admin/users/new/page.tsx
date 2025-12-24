'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
  Comment as CommentIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { isValidPhone, normalizePhone } from '@/lib/validation/phone';
import PhoneInput from '@components/ui/PhoneInput';

// Тип для градиентов
type GradientColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

type UserRole = 'admin' | 'manager' | 'user';

interface FormData {
  login: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  comment: string;
}

export default function NewUserPage() {
  const theme = useTheme();
  const [formData, setFormData] = useState<FormData>({
    login: '',
    name: '',
    email: '',
    phone: '',
    role: 'user',
    comment: '',
  });
  const router = useRouter();

  // Функция для получения градиента
  const getGradientBackground = (color: GradientColor): string => {
    const gradient = theme.palette.gradient as Record<GradientColor, string>;
    return gradient[color];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Проверка телефона
    if (formData.phone && !isValidPhone(formData.phone)) {
      alert('Некорректный номер телефона');
      return;
    }

    // В реальном приложении здесь будет запрос к API
    console.log('Создание пользователя:', {
      ...formData,
      phone: formData.phone ? normalizePhone(formData.phone) : undefined,
    });
    router.push('/admin/users');
  };

  const handleChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: UserRole): GradientColor => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'manager':
        return 'Менеджер';
      default:
        return 'Пользователь';
    }
  };

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
            mb: 2,
          }}
        >
          <AddIcon sx={{ fontSize: '3rem' }} />
          Создание пользователя
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
          AI-ассистируемое создание нового пользовательского аккаунта
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {/* Preview карточка */}
              <Paper
                sx={{
                  p: 4,
                  background: getGradientBackground('primary'),
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
                    {formData.name ? getInitials(formData.name) : <PersonIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                      {formData.name || 'Новый пользователь'}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {formData.login || 'логин'} • {getRoleLabel(formData.role)}
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
                      <Typography
                        variant="h6"
                        sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
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
                        value={formData.name}
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
                      <Typography
                        variant="h6"
                        sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <EmailIcon color="primary" />
                        Контактная информация
                      </Typography>

                      <TextField
                        fullWidth
                        type="email"
                        label="Email"
                        value={formData.email}
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

                      <PhoneInput
                        fullWidth
                        label="Телефон"
                        value={formData.phone}
                        onChange={(normalized) =>
                          handleChange('phone')({
                            target: { value: normalized || '' },
                          } as React.ChangeEvent<HTMLInputElement>)
                        }
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
                        value={formData.comment}
                        onChange={handleChange('comment')}
                        placeholder="Введите комментарий"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment
                              position="start"
                              sx={{ alignSelf: 'flex-start', mt: 1 }}
                            >
                              <CommentIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Кнопки действий */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      justifyContent: 'flex-end',
                      mt: 6,
                      pt: 3,
                      borderTop: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Button
                      type="button"
                      onClick={() => router.back()}
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      sx={{ borderRadius: 2, px: 4 }}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<AddIcon />}
                      disabled={!formData.login}
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
                        },
                      }}
                    >
                      Создать пользователя
                    </Button>
                  </Box>
                </form>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Боковая панель с подсказками */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                💡 Подсказки
              </Typography>
              <Box sx={{ space: 2 }}>
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    Логин
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Уникальный идентификатор пользователя в системе
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} color="warning.main">
                    Роли пользователей
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Администратор - полный доступ
                    <br />
                    • Менеджер - ограниченные права
                    <br />• Пользователь - базовые возможности
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} color="info.main">
                    AI-рекомендация
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Система автоматически сгенерирует надежный пароль и отправит его на email
                    пользователя
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
