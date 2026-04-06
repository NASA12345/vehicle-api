import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getVehiclePosition } from "./firebasefunc.js";
import { randomInt } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadDataJson() {
  try {
    const p = path.join(__dirname, '../data.json');
    const raw = await fs.readFile(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function generateDeviceData(){
  const data = await loadDataJson();
  let vehicleId = 'vehicle_1';
//   console.log(data);
  if (data && Array.isArray(data.trailer) && data.trailer.length) {
    vehicleId = data.trailer[randomInt(data.trailer.length)];
  } else if (data && typeof data.trailer === 'string') {
    vehicleId = data.trailer;
  }
  return generatevehicledata(vehicleId);
}

export async function generatevehicledata(vehicleId){
  const now = Math.floor(Date.now() /1000);
  const data = await getVehiclePosition(vehicleId);
  const lat = data?.lat ?? (18.759787 + (Math.random() - 0.5) * 0.01);
  const lng = data?.lng ?? (73.379997 + (Math.random() - 0.5) * 0.01);

  return {
    deviceId: "862491073482521"+randomInt(1000),
    trailerNumber: vehicleId,
    timestamp: now,
    gpstimestamp: now ,
    gprstimestamp: now ,
    longitude: lng.toFixed(6),
    latitude: lat.toFixed(6),
    heading: Math.floor(Math.random() * 360),
    speed: 10.0 + Math.floor(Math.random()*90),
    areaCode: "0",
    cellId: "0",
    mcc: "0",
    mnc: "0",
    lac: "0",
    hdop: 0.68 + Math.random() * 0.1,
    numberOfSatellites: 12 + Math.floor(Math.random() * 4),
    digitalInput1: 1,
    digitalInput2: 0,
    digitalInput3: 0,
    analogInput1: 300.0 + Math.floor(Math.random() * 500)/10,
    digitalOutput1: 0,
    powerSupplyVoltage: 27.0 + Math.floor(Math.random() * 500)/10,
    internalBatteryVoltage: 20.0 + Math.floor(Math.random() * 500)/10,
    internalBatteryLevel: 80 + Math.floor(Math.random() * 20),
    power: 1,
    gsmlevel: 25 + Math.floor(Math.random() * 6),
    accelerometerX: 0.0,
    accelerometerY: 0.0,
    accelerometerZ: 0.0,
    maxAccelX: 0.0,
    maxAccelY: 0.0,
    maxAccelZ: 0.0,
    locationSource: 1,
    serviceProvider: "Airtel",
    gpsSpeed: 10.0 + Math.floor(Math.random() * 500)/10,
    unplugged: 0,
    gpsOdometer: 55419,
    tilt: 0,
    receiveAt: now + 19800,
    GPSVendor: "FLEETRADAR"
  };
}
