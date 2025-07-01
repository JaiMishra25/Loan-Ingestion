import React, { useState, useEffect } from 'react';
import { Chip } from '@mui/material';
import { getSocket } from '../utils/socket';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');

  useEffect(() => {
    const socket = getSocket();
    setStatus(socket.connected ? 'connected' : 'disconnected');
    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onReconnectAttempt = () => setStatus('reconnecting');
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect_attempt', onReconnectAttempt);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnect_attempt', onReconnectAttempt);
    };
  }, []);

  let label = 'Disconnected';
  let color: 'success' | 'error' | 'warning' = 'error';
  if (status === 'connected') {
    label = 'Connected';
    color = 'success';
  } else if (status === 'reconnecting') {
    label = 'Reconnecting...';
    color = 'warning';
  }

  return (
    <Chip
      label={label}
      color={color}
      variant="outlined"
      sx={{ fontWeight: 'bold' }}
    />
  );
} 