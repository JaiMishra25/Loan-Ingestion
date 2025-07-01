import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormHelperText } from '@mui/material';
import { getSocket } from '../utils/socket';

export default function Controls() {
  const [paused, setPaused] = useState(false);
  const [dialog, setDialog] = useState<'retry' | 'flag' | null>(null);
  const [logId, setLogId] = useState('');

  useEffect(() => {
    const socket = getSocket();
    const onPaused = (val: boolean) => setPaused(val);
    socket.on('paused', onPaused);
    return () => {
      socket.off('paused', onPaused);
    };
  }, []);

  const handlePause = () => {
    const socket = getSocket();
    if (!paused) {
      socket.emit('pause');
    } else {
      socket.emit('resume');
    }
  };

  const handleDialogOpen = (type: 'retry' | 'flag') => {
    setDialog(type);
    setLogId('');
  };

  const handleDialogClose = () => {
    setDialog(null);
    setLogId('');
  };

  const handleSend = () => {
    const socket = getSocket();
    if (dialog === 'retry') {
      socket.emit('retry', logId);
    } else if (dialog === 'flag') {
      socket.emit('flag', logId);
    }
    handleDialogClose();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Interactive Controls
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" color={paused ? 'success' : 'warning'} onClick={handlePause}>
          {paused ? 'Resume' : 'Pause'}
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleDialogOpen('retry')}>
          Retry
        </Button>
        <Button variant="contained" color="error" onClick={() => handleDialogOpen('flag')}>
          Flag
        </Button>
      </Stack>
      <Dialog open={!!dialog} onClose={handleDialogClose}>
        <DialogTitle>{dialog === 'retry' ? 'Retry Record' : 'Flag Record'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            variant="outlined"
            label="Log ID"
            type="text"
            fullWidth
            value={logId}
            onChange={(e) => setLogId(e.target.value)}
            sx={{ mt: 1, mb: 1 }}
          />
          <FormHelperText>Enter the <b>ID</b> from the Error Logs table to retry or flag a record.</FormHelperText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSend} disabled={!logId}>Send</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 