import express from 'express';
import { generateDeviceData } from './contollers/generator.js';
import {  getVehiclePosition } from './contollers/firebasefunc.js';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/tracking-data',async (req, res) => {
    const data=await generateDeviceData();
    // console.log('Generating tracking data...',data);
    res.json([data]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});