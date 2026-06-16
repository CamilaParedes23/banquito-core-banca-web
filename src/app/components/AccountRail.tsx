import { useRef } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import CompactAccountCard from './CompactAccountCard';
import type { AccountResponse } from '../types/account.types';

interface AccountRailProps {
  accounts: AccountResponse[];
  selectedAccountNumber?: string;
  showBalances?: boolean;
  onSelect?: (account: AccountResponse) => void;
}

export default function AccountRail({
  accounts,
  selectedAccountNumber,
  showBalances = true,
  onSelect,
}: AccountRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    railRef.current?.scrollBy({
      left: direction === 'left' ? -620 : 620,
      behavior: 'smooth',
    });
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {accounts.length > 1 && (
        <Tooltip title="Ver cuentas anteriores">
          <IconButton
            aria-label="Ver cuentas anteriores"
            onClick={() => scroll('left')}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              position: 'absolute',
              zIndex: 2,
              left: -17,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'white',
              border: '1px solid #dce3ea',
              boxShadow: '0 5px 18px rgba(18,63,112,.12)',
              '&:hover': { bgcolor: '#f8fafc' },
            }}
          >
            <ChevronLeft />
          </IconButton>
        </Tooltip>
      )}

      <Box
        ref={railRef}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          pb: 1.5,
          px: 0.25,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { height: 8 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 8 },
        }}
      >
        {accounts.map((account) => (
          <CompactAccountCard
            key={account.accountUuid || account.accountNumber}
            account={account}
            selected={account.accountNumber === selectedAccountNumber}
            showBalance={showBalances}
            onSelect={onSelect}
          />
        ))}
      </Box>

      {accounts.length > 1 && (
        <Tooltip title="Ver más cuentas">
          <IconButton
            aria-label="Ver más cuentas"
            onClick={() => scroll('right')}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              position: 'absolute',
              zIndex: 2,
              right: -17,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'white',
              border: '1px solid #dce3ea',
              boxShadow: '0 5px 18px rgba(18,63,112,.12)',
              '&:hover': { bgcolor: '#f8fafc' },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
