import React from 'react';
import TuneIcon from '@mui/icons-material/Tune';
import Grid from '@mui/material/Unstable_Grid2';
import { Stack, TextField, Typography } from '@mui/material';
import useRayTracerStore from '../store';

function RenderSettingsEditor() {
  const width = useRayTracerStore((state) => state.width);
  const setWidth = useRayTracerStore((state) => state.setWidth);

  const height = useRayTracerStore((state) => state.height);
  const setHeight = useRayTracerStore((state) => state.setHeight);

  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(event.target.value);
    if (val >= 0) {
      setWidth(val);
    }
  };
  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(event.target.value);
    if (val >= 0) {
      setHeight(val);
    }
  };

  return (
    <Grid container spacing={1}>
      <Grid xs={12} mb={1}>
        <Typography variant="h6">
          <TuneIcon
            sx={{ verticalAlign: 'middle', paddingBottom: '3px', mr: 1 }}
          />
          Render Settings
        </Typography>{' '}
      </Grid>
      <Grid xs={6}>
        <TextField
          id="input-width"
          label="Width"
          size="small"
          value={width}
          onChange={handleWidthChange}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        />
      </Grid>
      <Grid xs={6}>
        <TextField
          id="input-height"
          label="Height"
          size="small"
          value={height}
          onChange={handleHeightChange}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        />
      </Grid>
    </Grid>
  );
}

export default RenderSettingsEditor;
