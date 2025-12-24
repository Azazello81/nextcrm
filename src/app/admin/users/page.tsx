'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Card,
  CardContent,
  Grid,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { User } from '../../../types/admin';
import { isValidPhone, normalizePhone, formatPhone } from '@/lib/validation/phone';
import { useToast } from '@components/ui/Toast';
import { useAuthStore } from '@/stores/auth-store';
import PhoneInput from '@components/ui/PhoneInput';

// Тип для градиентов
type GradientColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

const getRoleColor = (role: string): GradientColor => {
  const r = role.toString().toUpperCase();
  switch (r) {
    case 'ADMIN':
      return 'error';
    case 'MANAGER':
      return 'warning';
    default:
      return 'primary';
  }
};

const getRoleLabel = (role: string): string => {
  const r = role.toString().toUpperCase();
  switch (r) {
    case 'ADMIN':
      return 'Администратор';
    case 'MANAGER':
      return 'Менеджер';
    default:
      return 'Пользователь';
  }
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function UsersPage() {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [hardDelete, setHardDelete] = useState<boolean>(false);
  const router = useRouter();

  // Auth token
  // Access token для авторизации API-запросов
  const accessToken = useAuthStore((s) => s.accessToken);
  // Доступ на редактирование — только администраторы
  const canEdit = useAuthStore((s) => s.isAdmin());
  const toast = useToast();

  // Map user received from API to локальную User структуру
  type ApiUser = {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    registeredAt?: string | null;
    createdAt?: string;
    lastLoginAt?: string | null;
    role?: string;
    avatar?: string;
    comment?: string;
    isActive?: boolean;
  };

  const mapApiUserToView = useCallback((u: ApiUser): User => {
    const roleRaw = (u.role || 'USER').toString().toUpperCase();
    const role = roleRaw === 'ADMIN' ? 'ADMIN' : roleRaw === 'MANAGER' ? 'MANAGER' : 'USER';

    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      middleName: u.middleName,
      email: u.email || '',
      phone: u.phone || '',
      avatar: u.avatar,
      comment: u.comment,
      role,
      registeredAt: u.registeredAt ? new Date(u.registeredAt) : undefined,
      createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
      lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt) : undefined,
      isActive: u.isActive !== false,
    } as User;
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/users', {
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          credentials: 'same-origin',
        });
        const json = await res.json();
        if (res.status === 401 || res.status === 403) {
          toast.showToast(json?.message || 'Требуется авторизация', 'error');
          // Перенаправим на логин
          router.push('/login');
          return;
        }

        if (json?.success && Array.isArray(json.data)) {
          setUsers(json.data.map(mapApiUserToView));
        } else {
          const msg = json?.message || 'Не удалось загрузить пользователей';
          toast.showToast(msg, 'error');
          console.error('Failed to load users', json);
        }
      } catch (err) {
        console.error('Error fetching users', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [mapApiUserToView, accessToken, router, toast]);

  const filteredUsers = users.filter((user) => {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      // Отправляем запрос на деактивацию (DELETE). Для hard delete добавляем ?hard=true
      const url = `/api/admin/users/${selectedUser.id}${hardDelete ? '?hard=true' : ''}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: 'same-origin',
      });
      const json = await res.json();

      if (json?.success) {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        toast.showToast(
          hardDelete ? 'Пользователь удалён навсегда' : 'Пользователь деактивирован',
          'success',
        );
      } else {
        const msg = json?.message || 'Ошибка при удалении';
        toast.showToast(msg, 'error');
        console.error('Failed to delete user', json);
      }
    } catch (err) {
      toast.showToast('Ошибка при удалении', 'error');
      console.error('Error deleting user', err);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      setHardDelete(false);
    }
  };

  const [formDialogOpen, setFormDialogOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  type FormType = {
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    role: 'admin' | 'manager' | 'user';
    password?: string;
  };
  const [form, setForm] = useState<FormType>({
    email: '',
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    role: 'user',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormType, string>>>({});

  const handleAddUser = () => {
    setEditingUserId(null);
    setForm({
      email: '',
      firstName: '',
      lastName: '',
      middleName: '',
      phone: '',
      role: 'user',
      password: '',
    });
    setFormDialogOpen(true);
  };

  const handleFormChange = <K extends keyof FormType>(k: K, v: FormType[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }) as FormType);

  const validateForm = (values: FormType) => {
    const errors: Partial<Record<keyof FormType, string>> = {};
    if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Введите корректный email';
    }
    if (!values.firstName || values.firstName.trim().length === 0) {
      errors.firstName = 'Имя обязательно';
    }
    if (!values.lastName || values.lastName.trim().length === 0) {
      errors.lastName = 'Фамилия обязательна';
    }
    if (!editingUserId && (!values.password || values.password.length < 6)) {
      errors.password = 'Пароль обязателен и должен содержать минимум 6 символов';
    }
    return errors;
  };

  const handleFormSubmit = async () => {
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.showToast('Проверьте форму — есть ошибки', 'error');
      return;
    }

    try {
      if (editingUserId) {
        // PATCH
        if (form.phone && !isValidPhone(form.phone)) {
          toast.showToast('Некорректный номер телефона', 'error');
          return;
        }

        const res = await fetch(`/api/admin/users/${editingUserId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            middleName: form.middleName,
            phone: form.phone ? normalizePhone(form.phone) : undefined,
            role: form.role.toUpperCase(),
          }),
        });
        const json = await res.json();
        if (res.status === 401 || res.status === 403) {
          toast.showToast(json?.message || 'Требуется авторизация', 'error');
          router.push('/login');
          return;
        }
        if (json?.success) {
          // Обновляем локально
          setUsers((prev) =>
            prev.map((u) => (u.id === editingUserId ? mapApiUserToView(json.data) : u)),
          );
          toast.showToast('Пользователь обновлён', 'success');
        } else {
          const msg = json?.message || 'Ошибка обновления';
          toast.showToast(msg, 'error');
          console.error('Failed to update user', json);
        }
      } else {
        // CREATE - проверка телефона
        if (form.phone && !isValidPhone(form.phone)) {
          toast.showToast('Некорректный номер телефона', 'error');
          return;
        }

        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            middleName: form.middleName,
            phone: form.phone ? normalizePhone(form.phone) : undefined,
            role: form.role.toUpperCase(),
            password: form.password,
          }),
        });
        const json = await res.json();
        if (res.status === 401 || res.status === 403) {
          toast.showToast(json?.message || 'Требуется авторизация', 'error');
          router.push('/login');
          return;
        }
        if (json?.success) {
          setUsers((prev) => [mapApiUserToView(json.data), ...prev]);
          toast.showToast('Пользователь создан', 'success');
        } else {
          const msg = json?.message || 'Ошибка создания';
          toast.showToast(msg, 'error');
          console.error('Failed to create user', json);
        }
      }
    } catch (err) {
      toast.showToast('Ошибка при отправке запроса', 'error');
      console.error('Error submitting form', err);
    } finally {
      setFormDialogOpen(false);
      setEditingUserId(null);
      setFormErrors({});
    }
  };

  // Функция для получения градиента
  const getGradientBackground = (color: GradientColor): string => {
    const gradient = theme.palette.gradient as Record<GradientColor, string>;
    return gradient[color];
  };

  // Функция для рендеринга кнопки удаления с правильным Tooltip
  const renderDeleteButton = (user: User) => {
    const isDisabled = user.role === 'ADMIN';
    const button = (
      <IconButton
        size="small"
        onClick={() => handleDeleteClick(user)}
        sx={{
          background: isDisabled ? 'rgba(239, 68, 68, 0.1)' : getGradientBackground('error'),
          color: 'white',
          '&:hover': {
            background: isDisabled ? 'rgba(239, 68, 68, 0.1)' : getGradientBackground('error'),
            transform: 'translateY(-1px)',
          },
          '&.Mui-disabled': {
            background: 'rgba(100, 116, 139, 0.1)',
            color: 'rgba(100, 116, 139, 0.5)',
          },
        }}
        disabled={isDisabled}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    );

    if (isDisabled) {
      return (
        <Tooltip title="Нельзя удалить администратора">
          <span>{button}</span>
        </Tooltip>
      );
    }

    return <Tooltip title="Удалить">{button}</Tooltip>;
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
          <PersonIcon sx={{ fontSize: '3rem' }} />
          Управление пользователями
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
          AI-ассистируемое управление пользовательскими аккаунтами
        </Typography>
      </Box>

      {/* Панель управления */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Поиск пользователей по имени, email или логину..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
            sx={{
              height: '56px',
              borderRadius: 3,
              background: getGradientBackground('primary'),
              '&:hover': {
                background: getGradientBackground('primary'),
                transform: 'translateY(-2px)',
              },
            }}
          >
            Добавить пользователя
          </Button>
        </Grid>
      </Grid>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: getGradientBackground('primary'),
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {users.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего пользователей
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: getGradientBackground('error'),
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {users.filter((u) => u.role === 'ADMIN').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Администраторов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: getGradientBackground('warning'),
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {users.filter((u) => u.role === 'MANAGER').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Менеджеров
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: getGradientBackground('success'),
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {users.filter((u) => u.role === 'USER').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Пользователей
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Таблица пользователей */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: 'rgba(99, 102, 241, 0.02)',
                  '& .MuiTableCell-head': {
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'text.primary',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                  },
                }}
              >
                <TableCell>Пользователь</TableCell>
                <TableCell>Контактная информация</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell>Последний вход</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    Загрузка пользователей...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    Пользователи не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: User, index: number) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      background: index % 2 === 0 ? 'rgba(99, 102, 241, 0.01)' : 'transparent',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        background: 'rgba(99, 102, 241, 0.05)',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            background: getGradientBackground('primary'),
                            fontWeight: 600,
                            width: 40,
                            height: 40,
                          }}
                        >
                          {getInitials(
                            [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                              user.email ||
                              '',
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {[user.firstName, user.lastName].filter(Boolean).join(' ') ||
                              user.email}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2">{user.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" color="textSecondary">
                            {formatPhone(user.phone) || 'Не указан'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          background: getGradientBackground(getRoleColor(user.role)),
                          color: 'white',
                          borderRadius: 2,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="body2">
                          {user.registeredAt?.toLocaleDateString('ru-RU') || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="body2">
                          {user.lastLoginAt?.toLocaleDateString('ru-RU') || 'Никогда'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {canEdit && (
                          <Tooltip title="Редактировать">
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                              sx={{
                                background: getGradientBackground('secondary'),
                                color: 'white',
                                '&:hover': {
                                  background: getGradientBackground('secondary'),
                                  transform: 'translateY(-1px)',
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {renderDeleteButton(user)}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Create / Edit dialog */}
        <Dialog open={formDialogOpen} onClose={() => setFormDialogOpen(false)}>
          <DialogTitle>
            {editingUserId ? 'Редактировать пользователя' : 'Добавить пользователя'}
          </DialogTitle>
          <DialogContent sx={{ minWidth: 420, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              value={form.email}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Имя"
                value={form.firstName}
                error={Boolean(formErrors.firstName)}
                helperText={formErrors.firstName}
                onChange={(e) => handleFormChange('firstName', e.target.value)}
                fullWidth
              />
              <TextField
                label="Фамилия"
                value={form.lastName}
                error={Boolean(formErrors.lastName)}
                helperText={formErrors.lastName}
                onChange={(e) => handleFormChange('lastName', e.target.value)}
                fullWidth
              />
              <TextField
                label="Отчество"
                value={form.middleName || ''}
                onChange={(e) => handleFormChange('middleName', e.target.value)}
                fullWidth
              />
            </Box>
            <PhoneInput
              label="Телефон"
              value={form.phone}
              onChange={(normalized) => handleFormChange('phone', normalized || '')}
              fullWidth
            />
            <TextField
              label="Роль"
              value={form.role}
              onChange={(e) => handleFormChange('role', e.target.value as FormType['role'])}
              select
              SelectProps={{ native: true }}
            >
              <option value="user">Пользователь</option>
              <option value="manager">Менеджер</option>
              <option value="admin">Администратор</option>
            </TextField>
            {!editingUserId && (
              <TextField
                label="Пароль"
                type="password"
                value={form.password}
                error={Boolean(formErrors.password)}
                helperText={formErrors.password}
                onChange={(e) => handleFormChange('password', e.target.value)}
                fullWidth
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormDialogOpen(false)}>Отмена</Button>
            <Button variant="contained" onClick={handleFormSubmit}>
              {editingUserId ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: getGradientBackground('error'),
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
          }}
        >
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <Typography>
            {hardDelete ? (
              <>
                Вы уверены, что хотите <strong>удалить навсегда</strong> пользователя{' '}
                <strong>{selectedUser?.name}</strong>? Это действие нельзя отменить.
              </>
            ) : (
              <>
                Вы уверены, что хотите деактивировать пользователя{' '}
                <strong>{selectedUser?.name}</strong>? Пользователь станет неактивным.
              </>
            )}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <input
              id="hard-delete"
              type="checkbox"
              checked={hardDelete}
              onChange={(e) => setHardDelete(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <label htmlFor="hard-delete">Удалить навсегда (hard delete)</label>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setHardDelete(false);
            }}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color={hardDelete ? 'error' : 'primary'}
            sx={{
              borderRadius: 2,
              background: getGradientBackground('error'),
              '&:hover': {
                background: getGradientBackground('error'),
              },
            }}
          >
            {hardDelete ? 'Удалить навсегда' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
