import React from 'react';
import { Container, Box, Typography, Grid, Paper } from '@mui/material';
import RateChart from '../components/RateChart';
import ErrorLogTable from '../components/ErrorLogTable';
import Controls from '../components/Controls';
import ConnectionStatus from '../components/ConnectionStatus';

export default function Dashboard() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Fast Loan Ingestion & Live Ops Dashboard</Typography>
        <ConnectionStatus />
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <RateChart />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Controls />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <ErrorLogTable />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 