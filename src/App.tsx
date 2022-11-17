import React, { useState } from 'react'
import TuneIcon from '@mui/icons-material/Tune';
import RtCanvas from './Canvas'
import { AppBar, Box, Container, createTheme, CssBaseline, Drawer, IconButton, ThemeProvider, Toolbar, Tooltip, Typography } from '@mui/material';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleSettingsDrawer = (newOpen: boolean) => () => {
    setSettingsOpen(newOpen);
  };

  const theme = createTheme({
  palette: {
    primary: {
      main: '#1e4745',
      contrastText: '#dbefef'
    },
    secondary: {
      main: '#435061',
    },
    background: {
      default: '#02211f',
      paper: '#113533',
    },
    text: {
      primary: '#b9d3cf',
      secondary: '#e1efff',
    },
    action: {
      active: '#b9d3cf'
    }
  },
});

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: 'flex',
                flexGrow: 1,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              RayB Tracer
            </Typography>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Settings">
                <IconButton size="large" onClick={toggleSettingsDrawer(true)} sx={{ p: 0 }}>
                  <TuneIcon fontSize="inherit" />
                </IconButton>      
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
        <Drawer
          anchor={'right'}
          open={settingsOpen}
          onClose={toggleSettingsDrawer(false)}
        >
          Render Settings
        </Drawer>
      </AppBar>
      <Box sx={{padding: 2}}>
        <RtCanvas/>
      </Box>  
    </ThemeProvider>
  )
}

export default App
