import { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { fullAccountNumber, maskAccountNumber } from '../utils/formatters';

interface AccountNumberDisplayProps {
  value: string;
  defaultVisible?: boolean;
  compact?: boolean;
  fontWeight?: number;
}

export default function AccountNumberDisplay({
  value,
  defaultVisible = false,
  compact = true,
  fontWeight = 400,
}: AccountNumberDisplayProps) {
  const [visible, setVisible] = useState(defaultVisible);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, minWidth: 0 }}>
      <Typography
        variant={compact ? 'body2' : 'body1'}
        color="text.secondary"
        fontWeight={fontWeight}
        sx={{ overflowWrap: 'anywhere' }}
      >
        {visible ? fullAccountNumber(value) : maskAccountNumber(value)}
      </Typography>
      <Tooltip title={visible ? 'Ocultar número de cuenta' : 'Mostrar número completo'}>
        <IconButton
          size="small"
          aria-label={visible ? 'Ocultar número de cuenta' : 'Mostrar número completo'}
          onClick={(event) => {
            event.stopPropagation();
            setVisible((current) => !current);
          }}
        >
          {visible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
