import React from 'react';
import TuneIcon from '@mui/icons-material/Tune';
import Grid from '@mui/material/Unstable_Grid2';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import useRayTracerStore from '../store';
import { RenderQuality } from '../renderer/configuration';

function RenderSettingsEditor() {
  const width = useRayTracerStore((state) => state.width);
  const setWidth = useRayTracerStore((state) => state.setWidth);

  const height = useRayTracerStore((state) => state.height);
  const setHeight = useRayTracerStore((state) => state.setHeight);

  const numberOfWorkers = useRayTracerStore((state) => state.numberOfWorkers);
  const setNumberOfWorkers = useRayTracerStore(
    (state) => state.setNumberOfWorkers
  );

  const quality = useRayTracerStore((state) => state.quality);
  const setQuality = useRayTracerStore((state) => state.setQuality);

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

  const handleNumberOfWorkersChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = Number(event.target.value);
    if (val >= 0) {
      setNumberOfWorkers(val);
    }
  };

  const handleQualityChange = (event: SelectChangeEvent) => {
    const val = event.target.value as RenderQuality;
    if (val in RenderQuality) {
      setQuality(val as RenderQuality);
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
      <Grid xs={4}>
        <TextField
          id="input-width"
          label="Width"
          size="small"
          value={width}
          onChange={handleWidthChange}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        />
      </Grid>
      <Grid xs={4}>
        <TextField
          id="input-height"
          label="Height"
          size="small"
          value={height}
          onChange={handleHeightChange}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        />
      </Grid>
      <Grid xs={4}>
        <TextField
          id="input-number-of-workers"
          label="Workers"
          size="small"
          value={numberOfWorkers}
          onChange={handleNumberOfWorkersChange}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        />
      </Grid>
      <Grid xs={12}>
        <FormControl fullWidth>
          <InputLabel id="quality-label">Render Quality</InputLabel>
          <Select
            labelId="quality-label"
            id="quality-select"
            label="Render Quality"
            size="small"
            value={quality}
            onChange={handleQualityChange}
          >
            {Object.keys(RenderQuality).map((q) => (
              <MenuItem value={q} key={q}>
                {q}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default RenderSettingsEditor;
