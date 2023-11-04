import React from 'react';
import LandscapeIcon from '@mui/icons-material/Landscape';
import Grid from '@mui/material/Unstable_Grid2';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import useRayTracerStore from '../store';
import { ScenePreset } from '../scenes/scene-preset';

function SceneSelector() {
  const scenePreset = useRayTracerStore((state) => state.scenePreset);
  const setScenePreset = useRayTracerStore((state) => state.setScenePreset);

  const handleScenePresetChange = (event: SelectChangeEvent) => {
    const val = event.target.value as ScenePreset;
    setScenePreset(val);
  };

  return (
    <Grid container spacing={1}>
      <Grid xs={12} mb={1}>
        <Typography variant="h6">
          <LandscapeIcon
            sx={{ verticalAlign: 'middle', paddingBottom: '3px', mr: 1 }}
          />
          Scene
        </Typography>
      </Grid>
      <Grid xs={12}>
        <FormControl fullWidth>
          <InputLabel id="scene-preset-label">Presets</InputLabel>
          <Select
            labelId="scene-preset-label"
            id="scene-preset-select"
            label="Presets"
            size="small"
            value={scenePreset}
            onChange={handleScenePresetChange}
          >
            {(Object.keys(ScenePreset) as Array<keyof typeof ScenePreset>).map(
              (key) => (
                <MenuItem value={ScenePreset[key]} key={key}>
                  {ScenePreset[key]}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default SceneSelector;
