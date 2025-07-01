import * as React from 'react';
import { AppProps } from 'next/app';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
} 