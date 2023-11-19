import React from 'react';
import LandscapeIcon from '@mui/icons-material/Landscape';
import stringify from 'json-stringify-pretty-compact';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import useRayTracerStore from '../store';
import { ScenePreset } from '../scenes/scene-preset';
import { SceneMode } from '../scenes/scene';
import TemplateLoader from './TemplateLoader';
import { SceneDefinition } from '../scenes/scene-definition';

function SceneSelector() {
  const sceneMode = useRayTracerStore((state) => state.sceneMode);
  const setSceneMode = useRayTracerStore((state) => state.setSceneMode);

  const scenePreset = useRayTracerStore((state) => state.scenePreset);
  const setScenePreset = useRayTracerStore((state) => state.setScenePreset);

  const sceneDefinition = useRayTracerStore((state) => state.sceneDefinition);
  const setSceneDefinition = useRayTracerStore(
    (state) => state.setSceneDefinition
  );

  const handleSceneModeChange = (
    _event: React.SyntheticEvent,
    mode: SceneMode
  ) => {
    setSceneMode(mode);
  };
  const handleScenePresetChange = (event: SelectChangeEvent) => {
    const val = event.target.value as ScenePreset;
    setScenePreset(val);
  };
  const handleSceneTemplateChange = (definition: SceneDefinition) => {
    setSceneDefinition(stringify(definition, { indent: 4, maxLength: 60 }));
  };
  const handleSceneDefinitionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSceneDefinition(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h6">
        <LandscapeIcon
          sx={{ verticalAlign: 'middle', paddingBottom: '3px', mr: 1 }}
        />
        Scene
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={sceneMode} onChange={handleSceneModeChange}>
          <Tab label="Scene Builder" value={'sceneDefinition'} />
          <Tab label="Preset scenes" value={'scenePreset'} />
        </Tabs>
      </Box>
      <Box hidden={sceneMode !== 'sceneDefinition'}>
        <TemplateLoader onLoaded={handleSceneTemplateChange} />
        <TextField
          fullWidth
          multiline
          value={sceneDefinition}
          onChange={handleSceneDefinitionChange}
        />
      </Box>
      <Box hidden={sceneMode !== 'scenePreset'}>
        <FormControl fullWidth sx={{ marginBottom: 1, marginTop: 2 }}>
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
      </Box>
    </Box>
  );
}

export default SceneSelector;
