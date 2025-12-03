'use client';

import { useState } from 'react';
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
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
  Backup as BackupIcon,
  Code as CodeIcon,
  Cloud as CloudIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

// Тип для градиентов
type GradientColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  if (value !== index) {
    return null;
  }

  return <Box sx={{ py: 3 }}>{children}</Box>;
}

export default function SettingsPage() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  // Состояния для настроек
  const [settings, setSettings] = useState({
    // Общие настройки
    siteName: 'Админ Панель',
    siteDescription: 'Современная система управления',
    language: 'ru',
    timezone: 'Europe/Moscow',
    
    // Настройки безопасности
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    
    // Настройки уведомлений
    emailNotifications: true,
    pushNotifications: false,
    securityAlerts: true,
    
    // Внешний вид
    theme: 'light',
    primaryColor: '#6366f1',
    borderRadius: 8,
    
    // Системные настройки
    backupEnabled: true,
    backupFrequency: 'daily',
    logRetention: 90,
    
    // API настройки
    apiEnabled: true,
    rateLimit: 1000,
  });

  // Функция для получения градиента
  const getGradientBackground = (color: GradientColor): string => {
    const gradient = theme.palette.gradient as Record<GradientColor, string>;
    return gradient[color];
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // В реальном приложении здесь будет запрос к API
    console.log('Сохранение настроек:', settings);
    setHasChanges(false);
    alert('Настройки успешно сохранены!');
  };

  const handleReset = () => {
    // Сброс к значениям по умолчанию
    setSettings({
      siteName: 'Админ Панель',
      siteDescription: 'Современная система управления',
      language: 'ru',
      timezone: 'Europe/Moscow',
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      emailNotifications: true,
      pushNotifications: false,
      securityAlerts: true,
      theme: 'light',
      primaryColor: '#6366f1',
      borderRadius: 8,
      backupEnabled: true,
      backupFrequency: 'daily',
      logRetention: 90,
      apiEnabled: true,
      rateLimit: 1000,
    });
    setHasChanges(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок с градиентом */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h1" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: 2
          }}
        >
          <SettingsIcon sx={{ fontSize: '3rem' }} />
          Настройки системы
        </Typography>
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
          AI-ассистируемая конфигурация параметров системы и безопасности
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

      <Grid container spacing={4}>
        {/* Основной контент */}
        <Grid size={{ xs: 12, lg: 9 }}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {/* Табы */}
              <Paper
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab
                    icon={<SettingsIcon />}
                    iconPosition="start"
                    label="Общие"
                    sx={{ minHeight: 64 }}
                  />
                  <Tab
                    icon={<SecurityIcon />}
                    iconPosition="start"
                    label="Безопасность"
                    sx={{ minHeight: 64 }}
                  />
                  <Tab
                    icon={<NotificationsIcon />}
                    iconPosition="start"
                    label="Уведомления"
                    sx={{ minHeight: 64 }}
                  />
                  <Tab
                    icon={<PaletteIcon />}
                    iconPosition="start"
                    label="Внешний вид"
                    sx={{ minHeight: 64 }}
                  />
                  <Tab
                    icon={<StorageIcon />}
                    iconPosition="start"
                    label="Система"
                    sx={{ minHeight: 64 }}
                  />
                  <Tab
                    icon={<ApiIcon />}
                    iconPosition="start"
                    label="API"
                    sx={{ minHeight: 64 }}
                  />
                </Tabs>
              </Paper>

              {/* Содержимое табов */}
              <Box sx={{ p: 4 }}>
                {/* Общие настройки */}
                <TabPanel value={activeTab} index={0}>
                  <Typography variant="h5" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon color="primary" />
                    Общие настройки
                  </Typography>

                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Название сайта"
                        value={settings.siteName}
                        onChange={handleSettingChange('siteName')}
                        sx={{ mb: 3 }}
                      />

                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Описание сайта"
                        value={settings.siteDescription}
                        onChange={handleSettingChange('siteDescription')}
                        sx={{ mb: 3 }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        select
                        label="Язык"
                        value={settings.language}
                        onChange={handleSettingChange('language')}
                        sx={{ mb: 3 }}
                      >
                        <MenuItem value="ru">Русский</MenuItem>
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Español</MenuItem>
                      </TextField>

                      <TextField
                        fullWidth
                        select
                        label="Часовой пояс"
                        value={settings.timezone}
                        onChange={handleSettingChange('timezone')}
                      >
                        <MenuItem value="Europe/Moscow">Москва (UTC+3)</MenuItem>
                        <MenuItem value="Europe/London">Лондон (UTC+0)</MenuItem>
                        <MenuItem value="America/New_York">Нью-Йорк (UTC-5)</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* Настройки безопасности */}
                <TabPanel value={activeTab} index={1}>
                  <Typography variant="h5" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon color="primary" />
                    Безопасность
                  </Typography>

                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.twoFactorAuth}
                              onChange={handleSettingChange('twoFactorAuth')}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                Двухфакторная аутентификация
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Повышенная безопасность входа
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>

                      <TextField
                        fullWidth
                        select
                        label="Таймаут сессии (минуты)"
                        value={settings.sessionTimeout}
                        onChange={handleSettingChange('sessionTimeout')}
                        sx={{ mb: 3 }}
                      >
                        <MenuItem value={15}>15 минут</MenuItem>
                        <MenuItem value={30}>30 минут</MenuItem>
                        <MenuItem value={60}>1 час</MenuItem>
                        <MenuItem value={120}>2 часа</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        select
                        label="Политика паролей"
                        value={settings.passwordPolicy}
                        onChange={handleSettingChange('passwordPolicy')}
                      >
                        <MenuItem value="weak">Слабая</MenuItem>
                        <MenuItem value="medium">Средняя</MenuItem>
                        <MenuItem value="strong">Сильная</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* Уведомления */}
                <TabPanel value={activeTab} index={2}>
                  <Typography variant="h5" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsIcon color="primary" />
                    Уведомления
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.emailNotifications}
                              onChange={handleSettingChange('emailNotifications')}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                Email уведомления
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Получать уведомления на почту
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>

                      <Paper variant="outlined" sx={{ p: 3 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.securityAlerts}
                              onChange={handleSettingChange('securityAlerts')}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                Оповещения безопасности
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Критические уведомления о безопасности
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper variant="outlined" sx={{ p: 3 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.pushNotifications}
                              onChange={handleSettingChange('pushNotifications')}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                Push уведомления
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Уведомления в реальном времени
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* Внешний вид */}
                <TabPanel value={activeTab} index={3}>
                  <Typography variant="h5" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaletteIcon color="primary" />
                    Внешний вид
                  </Typography>

                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        select
                        label="Тема"
                        value={settings.theme}
                        onChange={handleSettingChange('theme')}
                        sx={{ mb: 3 }}
                      >
                        <MenuItem value="light">Светлая</MenuItem>
                        <MenuItem value="dark">Темная</MenuItem>
                        <MenuItem value="auto">Авто</MenuItem>
                      </TextField>

                      <TextField
                        fullWidth
                        select
                        label="Основной цвет"
                        value={settings.primaryColor}
                        onChange={handleSettingChange('primaryColor')}
                        sx={{ mb: 3 }}
                      >
                        <MenuItem value="#6366f1">Индиго</MenuItem>
                        <MenuItem value="#ec4899">Розовый</MenuItem>
                        <MenuItem value="#10b981">Зеленый</MenuItem>
                        <MenuItem value="#f59e0b">Желтый</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        select
                        label="Скругление углов"
                        value={settings.borderRadius}
                        onChange={handleSettingChange('borderRadius')}
                      >
                        <MenuItem value={4}>Минимальное</MenuItem>
                        <MenuItem value={8}>Среднее</MenuItem>
                        <MenuItem value={16}>Большое</MenuItem>
                        <MenuItem value={24}>Максимальное</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* Системные настройки */}
                <TabPanel value={activeTab} index={4}>
                  <Typography variant="h5" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StorageIcon color="primary" />
                    Системные настройки
                  </Typography>

                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.backupEnabled}
                              onChange={handleSettingChange('backupEnabled')}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                Автоматическое резервное копирование
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Регулярное создание бэкапов
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>

                      <TextField
                        fullWidth
                        select
                        label="Частота бэкапов"
                        value={settings.backupFrequency}
                        onChange={handleSettingChange('backupFrequency')}
                        disabled={!settings.backupEnabled}
                        sx={{ mb: 3 }}
                      >
                        <MenuItem value="hourly">Каждый час</MenuItem>
                        <MenuItem value="daily">Ежедневно</MenuItem>
                        <MenuItem value="weekly">Еженедельно</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        select
                        label="Хранение логов (дни)"
                        value={settings.logRetention}
                        onChange={handleSettingChange('logRetention')}
                      >
                        <MenuItem value={30}>30 дней</MenuItem>
                        <MenuItem value={90}>90 дней</MenuItem>
                        <MenuItem value={365}>1 год</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* API настройки */}
                <TabPanel value={activeTab} index={5}>
                  <Typography variant="h5" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ApiIcon color="primary" />
                    API настройки
                  </Typography>

                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.apiEnabled}
                              onChange={handleSettingChange('apiEnabled')}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                Включить API
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Доступ к REST API
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        select
                        label="Лимит запросов"
                        value={settings.rateLimit}
                        onChange={handleSettingChange('rateLimit')}
                        disabled={!settings.apiEnabled}
                      >
                        <MenuItem value={100}>100 запросов/час</MenuItem>
                        <MenuItem value={500}>500 запросов/час</MenuItem>
                        <MenuItem value={1000}>1000 запросов/час</MenuItem>
                        <MenuItem value={5000}>5000 запросов/час</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </TabPanel>
              </Box>

              {/* Кнопки действий */}
              <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    onClick={handleReset}
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    disabled={!hasChanges}
                    sx={{ borderRadius: 2 }}
                  >
                    Сбросить
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={!hasChanges}
                    sx={{
                      borderRadius: 2,
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
                    Сохранить настройки
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Боковая панель */}
        <Grid size={{ xs: 12, lg: 3 }}>
          {/* Статус системы */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🚀 Статус системы
              </Typography>
              <Box sx={{ space: 2 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Версия системы
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    v2.1.0
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Последнее обновление
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    2 дня назад
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Статус
                  </Typography>
                  <Chip
                    label="✅ Активна"
                    size="small"
                    sx={{
                      background: getGradientBackground('success'),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Paper>
              </Box>
            </CardContent>
          </Card>

          {/* Быстрые действия */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                ⚡ Быстрые действия
              </Typography>
              <List dense>
                <ListItem 
                  sx={{ 
                    borderRadius: 2, 
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <ListItemIcon>
                    <BackupIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Создать бэкап" />
                </ListItem>
                <ListItem 
                  sx={{ 
                    borderRadius: 2, 
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <ListItemIcon>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Проверить обновления" />
                </ListItem>
                <ListItem 
                  sx={{ 
                    borderRadius: 2, 
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <ListItemIcon>
                    <CloudIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Очистить кэш" />
                </ListItem>
                <ListItem 
                  sx={{ 
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <ListItemIcon>
                    <LockIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Проверить безопасность" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}