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
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import useRayTracerStore from '../store';
import { ScenePreset } from '../scenes/scene-preset';
import { defaultScene } from '../scenes/templates/default';
import { SceneTemplate, loadSceneDefinition } from '../scenes/scene-template';
import { SceneMode } from '../scenes/scene';

function SceneSelector() {
  const sceneMode = useRayTracerStore((state) => state.sceneMode);
  const setSceneMode = useRayTracerStore((state) => state.setSceneMode);

  const scenePreset = useRayTracerStore((state) => state.scenePreset);
  const setScenePreset = useRayTracerStore((state) => state.setScenePreset);

  const sceneTemplate = useRayTracerStore((state) => state.sceneTemplate);
  const setSceneTemplate = useRayTracerStore((state) => state.setSceneTemplate);

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
  const handleSceneTemplateChange = (event: SelectChangeEvent) => {
    const val = event.target.value as SceneTemplate;
    setSceneTemplate(val);
    setSceneDefinition(
      stringify(loadSceneDefinition(val), { indent: 4, maxLength: 60 })
    );
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
        <FormControl fullWidth sx={{ marginBottom: 1, marginTop: 2 }}>
          <InputLabel id="scene-template-label">Load template</InputLabel>
          <Select
            labelId="scene-template-label"
            id="scene-template-select"
            label="Load template"
            size="small"
            value={sceneTemplate}
            onChange={handleSceneTemplateChange}
          >
            {(
              Object.keys(SceneTemplate) as Array<keyof typeof SceneTemplate>
            ).map((key) => (
              <MenuItem value={SceneTemplate[key]} key={key}>
                {SceneTemplate[key]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
