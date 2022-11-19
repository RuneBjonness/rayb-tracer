import React from 'react';
import TuneIcon from '@mui/icons-material/Tune';
import { Stack, TextField } from '@mui/material';
import useRayTracerStore from '../store';

function RenderSettingsEditor() {
  const width = useRayTracerStore((state) => state.width);
  const setWidth = useRayTracerStore((state) => state.setWidth);

  const height = useRayTracerStore((state) => state.height);
  const setHeight = useRayTracerStore((state) => state.setHeight);

  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(event.target.value);
    if (val) {
      setWidth(val);
    }
  };
  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(event.target.value);
    if (val) {
      setHeight(val);
    }
  };

  return (
    <Stack spacing={1} minWidth={480}>
      <h4>
        Render Settings <TuneIcon />
      </h4>
      <TextField
        id="input-width"
        label="Width"
        value={width}
        onChange={handleWidthChange}
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      />
      <TextField
        id="input-height"
        label="Height"
        defaultValue={height}
        onChange={handleHeightChange}
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      />
    </Stack>
  );
}

export default RenderSettingsEditor;
