'use client';

import React, { useState } from 'react';
import PhoneInput from '@/components/ui/PhoneInput';
import { Box, Typography } from '@mui/material';

export default function TestPhonePage() {
  const [phone, setPhone] = useState<string>('79001234567');

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Test Phone Input
      </Typography>

      <PhoneInput
        fullWidth
        label="Телефон"
        value={phone}
        onChange={(normalized) => {
          console.log('Phone onChange:', normalized);
          setPhone(normalized || '');
        }}
        sx={{ mb: 3 }}
      />

      <Typography variant="body1">Current value (normalized): {phone || '(empty)'}</Typography>
    </Box>
  );
}
