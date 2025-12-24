'use client';

import { useState, useEffect } from 'react';
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
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { User } from '../../../../../types/admin';
import { useToast } from '@components/ui/Toast';
import { useAuthStore } from '@/stores/auth-store';
import { isValidPhone, normalizePhone } from '@/lib/validation/phone';
import PhoneInput from '@components/ui/PhoneInput';

// Тип для градиентов
type GradientColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

export default function EditUserClient({ initialUser }: { initialUser: User }) {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [formData, setFormData] = useState<User | null>(initialUser ?? null);
  const [originalData, setOriginalData] = useState<User | null>(initialUser ?? null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData(initialUser);
    setOriginalData(initialUser);
  }, [initialUser]);

  const getGradientBackground = (color: GradientColor): string | undefined => {
    const gradient = (theme.palette as unknown as { gradient?: Record<GradientColor, string> })
      .gradient;
    return gradient ? gradient[color] : undefined;
  };

  useEffect(() => {
    if (formData && originalData) {
      const changes = JSON.stringify(formData) !== JSON.stringify(originalData);
      const timeoutId = setTimeout(() => setHasChanges(changes), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [formData, originalData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Валидация на клиенте
    if (!formData.firstName || !formData.lastName) {
      toast.showToast('Имя и фамилия обязательны', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Валидируем и нормализуем телефон перед отправкой
      if (formData.phone && !isValidPhone(formData.phone)) {
        toast.showToast('Некорректный номер телефона', 'error');
        setIsLoading(false);
        return;
      }

      const body: Record<string, unknown> = {
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        middleName: formData.middleName || undefined,
        email: formData.email,
        phone: formData.phone ? normalizePhone(formData.phone) : undefined,
      };

      // Отправляем роль только если она есть
      if (formData.role) body.role = formData.role?.toUpperCase?.() || formData.role;

      const res = await fetch(`/api/admin/users/${formData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: 'same-origin',
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.showToast(json?.message || 'Ошибка обновления', 'error');
        return;
      }

      toast.showToast('Пользователь успешно обновлён', 'success');
      setOriginalData(json.data);
      setHasChanges(false);
      // Навигация обратно к списку
      router.push('/admin/users');
    } catch (err) {
      console.error('Error updating user', err);
      toast.showToast('Ошибка при обновлении пользователя', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange =
    (field: keyof User) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!formData) return;
      let value: string = e.target.value;

      // Для роли преобразуем в верхний регистр
      if (field === 'role') {
        value = value.toUpperCase();
      }

      const newFormData = { ...formData, [field]: value } as User;
      setFormData(newFormData);
      if (originalData) {
        const changes = JSON.stringify(newFormData) !== JSON.stringify(originalData);
        setTimeout(() => setHasChanges(changes), 0);
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
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string): GradientColor => {
    switch (role) {
      case 'admin':
      case 'ADMIN':
        return 'error';
      case 'manager':
      case 'MANAGER':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'admin':
      case 'ADMIN':
        return 'Администратор';
      case 'manager':
      case 'MANAGER':
        return 'Менеджер';
      default:
        return 'Пользователь';
    }
  };

  if (!formData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" color="error">
          Пользователь не найден
        </Typography>
        <Button onClick={() => router.push('/admin/users')} variant="contained" sx={{ mt: 2 }}>
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
          <Typography variant="h1" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            background:
              'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
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
                      {[formData.firstName, formData.lastName].filter(Boolean).join(' ') ||
                        'Новый пользователь'}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {formData.email} • {getRoleLabel(formData.role)}
                    </Typography>
                    {formData.email && (
                      <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                        {formData.email}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>

              <Box sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant="h6"
                        sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <PersonIcon color="primary" /> Основная информация
                      </Typography>

                      <TextField
                        fullWidth
                        label="Фамилия"
                        value={formData.lastName || ''}
                        onChange={handleChange('lastName')}
                        placeholder="Введите фамилию"
                        sx={{ mb: 3 }}
                        required
                      />

                      <TextField
                        fullWidth
                        label="Имя"
                        value={formData.firstName || ''}
                        onChange={handleChange('firstName')}
                        placeholder="Введите имя"
                        sx={{ mb: 3 }}
                        required
                      />

                      <TextField
                        fullWidth
                        label="Отчество"
                        value={formData.middleName || ''}
                        onChange={handleChange('middleName')}
                        placeholder="Введите отчество"
                        sx={{ mb: 3 }}
                      />

                      <TextField
                        fullWidth
                        select
                        label="Роль"
                        value={formData.role.toLowerCase()}
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
                                background: 'primary.main',
                              }}
                            />{' '}
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
                                background: 'warning.main',
                              }}
                            />{' '}
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
                                background: 'error.main',
                              }}
                            />{' '}
                            Администратор
                          </Box>
                        </MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant="h6"
                        sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <EmailIcon color="primary" /> Контакты
                      </Typography>

                      <TextField
                        fullWidth
                        label="Email"
                        value={formData.email || ''}
                        onChange={handleChange('email')}
                        sx={{ mb: 3 }}
                      />

                      <PhoneInput
                        fullWidth
                        label="Телефон"
                        value={formData.phone || ''}
                        onChange={(normalized) =>
                          handleChange('phone')({
                            target: { value: normalized || '' },
                          } as React.ChangeEvent<HTMLInputElement>)
                        }
                        sx={{ mb: 3 }}
                      />

                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          onClick={handleReset}
                          variant="outlined"
                          startIcon={<RefreshIcon />}
                          disabled={!hasChanges}
                          sx={{ borderRadius: 2 }}
                        >
                          Сброс
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          sx={{ borderRadius: 2 }}
                          disabled={!hasChanges || isLoading}
                        >
                          Сохранить
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
