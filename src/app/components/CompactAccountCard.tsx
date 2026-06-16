import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import AccountNumberDisplay from './AccountNumberDisplay';
import type { AccountResponse } from '../types/account.types';
import {
  formatCurrency,
  getAccountLabel,
  getAccountProductLabel,
  getAccountPurposeLabel,
  getStatusPresentation,
} from '../utils/formatters';

interface CompactAccountCardProps {
  account: AccountResponse;
  selected?: boolean;
  showBalance?: boolean;
  onSelect?: (account: AccountResponse) => void;
}

export default function CompactAccountCard({
  account,
  selected = false,
  showBalance = true,
  onSelect,
}: CompactAccountCardProps) {
  const status = getStatusPresentation(account.status);
  const product = getAccountProductLabel(account);
  const purpose = getAccountPurposeLabel(account);

  return (
    <Card
      sx={{
        flex: '0 0 clamp(270px, 29vw, 320px)',
        scrollSnapAlign: 'start',
        border: selected ? '2px solid #123f70' : '1px solid #e2e8f0',
        boxShadow: selected ? '0 10px 28px rgba(18,63,112,.14)' : '0 5px 16px rgba(18,63,112,.05)',
        transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 24px rgba(18,63,112,.11)',
        },
      }}
    >
      <CardActionArea onClick={() => onSelect?.(account)} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2.25 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'flex-start' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={850} noWrap title={getAccountLabel(account)}>
                {getAccountLabel(account)}
              </Typography>
              <AccountNumberDisplay value={account.accountNumber} fontWeight={600} />
            </Box>
            <Box sx={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 2, bgcolor: '#edf4fb', color: '#123f70', flexShrink: 0 }}>
              <AccountBalance fontSize="small" />
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, minHeight: 20 }} noWrap>
            {product || purpose || 'Cuenta bancaria'}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 750, textTransform: 'uppercase', letterSpacing: 0.45 }}>
              Saldo disponible
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#123f70', mt: 0.25 }}>
              {showBalance ? formatCurrency(account.availableBalance) : '$ ••••••'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 1.75, minHeight: 28 }}>
            <Chip label={status.label} size="small" sx={{ color: status.color, bgcolor: status.background, fontWeight: 750 }} />
            {purpose && <Chip label={purpose} size="small" variant="outlined" />}
            {account.favoritePaymentAccount && <Chip label="Favorita" size="small" color="warning" variant="outlined" />}
            {account.massPaymentMainAccount && <Chip label="Cuenta matriz" size="small" color="primary" variant="outlined" />}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
