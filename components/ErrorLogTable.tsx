import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, Select, InputLabel, FormControl, Box, Typography, Button, Tooltip } from '@mui/material';
import { getSocket } from '../utils/socket';

interface ErrorLog {
  id: number;
  applicant: string;
  error: string;
  type: string;
  time: string;
  flagged?: boolean;
}

export default function ErrorLogTable() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    // Listen for live logs
    const liveHandler = (log: ErrorLog) => {
      setLogs((prev) => [log, ...prev].slice(0, 100));
    };
    socket.on('errorLog', liveHandler);
    // Listen for search results
    const searchHandler = (results: ErrorLog[]) => {
      setLogs(results);
      setLoading(false);
    };
    socket.on('searchResults', searchHandler);
    return () => {
      socket.off('errorLog', liveHandler);
      socket.off('searchResults', searchHandler);
    };
  }, []);

  const handleSearch = (overrideType?: string) => {
    setLoading(true);
    const socket = getSocket();
    socket.emit('searchLogs', {
      applicant: search,
      type: overrideType !== undefined ? overrideType : type,
      from,
      to,
    });
  };

  // Trigger search when error type changes
  useEffect(() => {
    if (type !== '') {
      handleSearch(type);
    }
  }, [type]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Error Logs
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        <b>Note:</b> Use the <b>ID</b> field from the logs below for retry/flag actions.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search by Applicant"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Error Type</InputLabel>
          <Select
            value={type}
            label="Error Type"
            onChange={(e) => setType(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Validation">Validation</MenuItem>
            <MenuItem value="Processing">Processing</MenuItem>
            <MenuItem value="Enrichment">Enrichment</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="From (HH:MM:SS)"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          size="small"
          placeholder="e.g. 12:00:00"
        />
        <TextField
          label="To (HH:MM:SS)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          size="small"
          placeholder="e.g. 13:00:00"
        />
        <Button variant="contained" onClick={() => handleSearch()} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Applicant</TableCell>
              <TableCell>Error</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>
                <Tooltip title="Shows if this log was flagged using the controls below.">
                  <span>Flagged</span>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.id}</TableCell>
                <TableCell>{log.applicant}</TableCell>
                <TableCell>{log.error}</TableCell>
                <TableCell>{log.type}</TableCell>
                <TableCell>{log.time}</TableCell>
                <TableCell>{log.flagged ? 'Yes' : ''}</TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                {/* @ts-ignore */}
                <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                  No logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 