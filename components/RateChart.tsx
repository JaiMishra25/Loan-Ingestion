import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography } from '@mui/material';
import { getSocket } from '../utils/socket';

const INITIAL_LENGTH = 20;

interface Metrics {
  time: string;
  incoming: number;
  processed: number;
}

export default function RateChart() {
  const [data, setData] = useState<Metrics[]>(() => {
    const now = new Date();
    return Array.from({ length: INITIAL_LENGTH }, (_, i) => ({
      time: new Date(now.getTime() - (INITIAL_LENGTH - 1 - i) * 1000).toLocaleTimeString(),
      incoming: 0,
      processed: 0,
    }));
  });

  useEffect(() => {
    const socket = getSocket();
    const handler = (metrics: Metrics) => {
      setData((prev) => {
        const next = prev.slice(1);
        next.push(metrics);
        return next;
      });
    };
    socket.on('metrics', handler);
    return () => {
      socket.off('metrics', handler);
    };
  }, []);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Real-time Rate Chart (Incoming vs. Processed)
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" minTickGap={20} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="incoming" stroke="#8884d8" dot={false} />
          <Line type="monotone" dataKey="processed" stroke="#82ca9d" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
} 