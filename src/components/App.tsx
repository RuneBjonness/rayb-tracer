import React, { useState } from 'react';
import RtCanvas from './Canvas';
import {
  Box,
  Button,
  createTheme,
  CssBaseline,
  Drawer,
  LinearProgress,
  Stack,
  ThemeProvider,
  Typography,
} from '@mui/material';
import RenderSettingsEditor from './RenderSettingsEditor';
import useRayTracerStore from '../store';
import { getRenderConfiguration } from '../renderer/configuration';

function App() {
  const width = useRayTracerStore((state) => state.width);
  const height = useRayTracerStore((state) => state.height);
  const quality = useRayTracerStore((state) => state.quality);
  const renderProgress = useRayTracerStore((state) => state.renderProgress);

  const [renderConfig, setRenderConfig] = useState(
    getRenderConfiguration(width, height, quality)
  );

  const theme = createTheme({
    palette: {
      primary: {
        main: '#1e4745',
        contrastText: '#dbefef',
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
        active: '#b9d3cf',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Drawer
          sx={{
            width: 360,
            flexShrink: 0,
            p: 2,
            '& .MuiDrawer-paper': {
              width: 360,
              boxSizing: 'border-box',
              p: 2,
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Stack spacing={2}>
            <Typography
              variant="h3"
              noWrap
              fontStyle={'italic'}
              color={theme.palette.secondary.contrastText}
              mb={1}
            >
              RayB Tracer
            </Typography>
            <RenderSettingsEditor />
            <Button
              variant="contained"
              onClick={() =>
                setRenderConfig(getRenderConfiguration(width, height, quality))
              }
            >
              Render
            </Button>
            <LinearProgress
              variant="determinate"
              color="success"
              value={(renderProgress * 100) / (width * height)}
            />
            <Typography variant="caption" textAlign={'center'}>
              [{renderProgress} / {width * height} pixels]
            </Typography>
          </Stack>
        </Drawer>
        <Box sx={{ flexGrow: 1, p: 2 }}>
          <RtCanvas cfg={renderConfig} />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
