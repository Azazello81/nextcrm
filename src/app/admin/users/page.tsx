'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
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
  alpha,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { User } from '../../../types/admin';

// Mock данные пользователей
const mockUsers: User[] = [
  {
    id: '1',
    login: 'admin',
    name: 'Администратор Системы',
    email: 'admin@example.com',
    phone: '+79999999999',
    datereg: new Date('2024-01-01'),
    dateactiv: new Date('2024-01-17'),
    role: 'admin',
  },
  {
    id: '2',
    login: 'manager1',
    name: 'Петр Петров',
    email: 'petr@example.com',
    phone: '+79998887766',
    datereg: new Date('2024-01-05'),
    dateactiv: new Date('2024-01-16'),
    role: 'manager',
  },
  {
    id: '3',
    login: 'user123',
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    phone: '+79997776655',
    datereg: new Date('2024-01-10'),
    dateactiv: new Date('2024-01-17'),
    role: 'user',
  },
  {
    id: '4',
    login: 'maria_k',
    name: 'Мария Козлова',
    email: 'maria@example.com',
    phone: '+79996665544',
    datereg: new Date('2024-01-12'),
    dateactiv: new Date('2024-01-15'),
    role: 'user',
  },
  {
    id: '5',
    login: 'sergey_s',
    name: 'Сергей Смирнов',
    email: 'sergey@example.com',
    phone: '+79995554433',
    datereg: new Date('2024-01-14'),
    dateactiv: new Date('2024-01-17'),
    role: 'manager',
  },
];

// Тип для градиентов
type GradientColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

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

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function UsersPage() {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const router = useRouter();

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.login.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleEditUser = (userId: string) => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const handleAddUser = () => {
    router.push('/admin/users/new');
  };

  // Функция для получения градиента
  const getGradientBackground = (color: GradientColor): string => {
    const gradient = theme.palette.gradient as Record<GradientColor, string>;
    return gradient[color];
  };

  // Функция для рендеринга кнопки удаления с правильным Tooltip
  const renderDeleteButton = (user: User) => {
    const isDisabled = user.role === 'admin';
    const button = (
      <IconButton
        size="small"
        onClick={() => handleDeleteClick(user)}
        sx={{
          background: isDisabled 
            ? 'rgba(239, 68, 68, 0.1)' 
            : getGradientBackground('error'),
          color: 'white',
          '&:hover': {
            background: isDisabled 
              ? 'rgba(239, 68, 68, 0.1)' 
              : getGradientBackground('error'),
            transform: 'translateY(-1px)',
          },
          '&.Mui-disabled': {
            background: 'rgba(100, 116, 139, 0.1)',
            color: 'rgba(100, 116, 139, 0.5)',
          }
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
            mb: 2
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
                  }
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
              }
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
              <Typography variant="h4" fontWeight={800} sx={{ 
                background: getGradientBackground('primary'),
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
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
              <Typography variant="h4" fontWeight={800} sx={{ 
                background: getGradientBackground('error'),
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {users.filter(u => u.role === 'admin').length}
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
              <Typography variant="h4" fontWeight={800} sx={{ 
                background: getGradientBackground('warning'),
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {users.filter(u => u.role === 'manager').length}
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
              <Typography variant="h4" fontWeight={800} sx={{ 
                background: getGradientBackground('success'),
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {users.filter(u => u.role === 'user').length}
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
              <TableRow sx={{ 
                background: 'rgba(99, 102, 241, 0.02)',
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                }
              }}>
                <TableCell>Пользователь</TableCell>
                <TableCell>Контактная информация</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell>Последний вход</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user: User, index: number) => (
                <TableRow 
                  key={user.id} 
                  hover
                  sx={{ 
                    background: index % 2 === 0 ? 'rgba(99, 102, 241, 0.01)' : 'transparent',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.05)',
                      transform: 'translateX(4px)',
                    }
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
                        {getInitials(user.name || user.login)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          @{user.login}
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
                          {user.phone}
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
                        {user.datereg.toLocaleDateString('ru-RU')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="body2">
                        {user.dateactiv.toLocaleDateString('ru-RU')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Просмотр">
                        <IconButton
                          size="small"
                          onClick={() => handleViewUser(user.id)}
                          sx={{
                            background: getGradientBackground('info'),
                            color: 'white',
                            '&:hover': {
                              background: getGradientBackground('info'),
                              transform: 'translateY(-1px)',
                            }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user.id)}
                          sx={{
                            background: getGradientBackground('secondary'),
                            color: 'white',
                            '&:hover': {
                              background: getGradientBackground('secondary'),
                              transform: 'translateY(-1px)',
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {renderDeleteButton(user)}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
          }
        }}
      >
        <DialogTitle sx={{ 
          background: getGradientBackground('error'),
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
        }}>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить пользователя <strong>{selectedUser?.name}</strong>? 
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            sx={{
              borderRadius: 2,
              background: getGradientBackground('error'),
              '&:hover': {
                background: getGradientBackground('error'),
              }
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}