import { db } from '../fb/config.js';


const R = 6371000;
const STEP_M = 10000;

function toRad(d){ return d * Math.PI / 180; }
function toDeg(r){ return r * 180 / Math.PI; }
function haversine(a,b){
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat), Δλ = toRad(b.lng - a.lng);
  const s = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return 2*R*Math.atan2(Math.sqrt(s), Math.sqrt(1-s));
}
function bearingBetween(a,b){
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const λ1 = toRad(a.lng), λ2 = toRad(b.lng);
  const y = Math.sin(λ2-λ1)*Math.cos(φ2);
  const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
  return (toDeg(Math.atan2(y,x)) + 360) % 360;
}
function destinationPoint(start, bearingDeg, distance){
  const δ = distance / R;
  const θ = toRad(bearingDeg);
  const φ1 = toRad(start.lat), λ1 = toRad(start.lng);
  const φ2 = Math.asin(Math.sin(φ1)*Math.cos(δ) + Math.cos(φ1)*Math.sin(δ)*Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ)*Math.sin(δ)*Math.cos(φ1), Math.cos(δ)-Math.sin(φ1)*Math.sin(φ2));
  return { lat: toDeg(φ2), lng: toDeg(λ2) };
}

const ROUTES = {
  'delhi-chennai': [
    { lat: 28.7041, lng: 77.1025 }, // Delhi
    { lat: 27.1767, lng: 78.0081 }, // Agra
    { lat: 24.5936, lng: 78.3568 }, // Bhopal-area (approx)
    { lat: 21.1458, lng: 79.0882 }, // Nagpur-area
    { lat: 18.5204, lng: 73.8567 }, // Pune-area (approx) -> keeps southward progression
    { lat: 16.5062, lng: 80.6480 }, // Vijayawada-area
    { lat: 14.4674, lng: 78.8242 }, // near Nandyal/Anantapur
    { lat: 13.0827, lng: 80.2707 }  // Chennai
  ],
  'chennai-bangalore': [
    { lat: 13.0827, lng: 80.2707 }, // Chennai
    { lat: 13.6288, lng: 79.4192 }, // Vellore-area
    { lat: 12.9716, lng: 77.5946 }  // Bangalore
  ],
  'wb-mp': [
    { lat: 22.5726, lng: 88.3639 }, // Kolkata (WB)
    { lat: 23.8103, lng: 86.4412 }, // Jamshedpur-area
    { lat: 24.5854, lng: 84.8708 }, // Gaya/NE Bihar area
    { lat: 23.2599, lng: 77.4126 }  // Bhopal (MP)
  ]
};

function chooseRouteForId(id){
  const key = (id || '').toLowerCase();
  if (key.includes('delhi') || key.includes('delchi') || key.includes('delhi-chennai')) return ROUTES['delhi-chennai'];
  if (key.includes('chennai') && key.includes('bangalore')) return ROUTES['chennai-bangalore'];
  if (key.includes('wb') || key.includes('west') || key.includes('kolkata') || key.includes('wb-mp')) return ROUTES['wb-mp'];
  // fallback round-robin by id hash
  const hash = [...(id||'')].reduce((s,c)=>s + c.charCodeAt(0),0);
  const keys = Object.keys(ROUTES);
  return ROUTES[keys[hash % keys.length]];
}

export async function getVehiclePosition(vehicleId){
  const ref = db.collection('vehicle').doc(String(vehicleId));
  const snap = await ref.get();
  if (!snap.exists) {
    const path = chooseRouteForId(vehicleId);
    const start = path[0];
    const payload = {
      lat: start.lat,
      lng: start.lng,
      path,
      pathIndex: 0,
      target: path[path.length - 1],
      updatedAt: Date.now()
    };
    await ref.set(payload);
    return { id: vehicleId, ...payload };
  }

  const prev = snap.data();
  const path = Array.isArray(prev.path) && prev.path.length ? prev.path : chooseRouteForId(vehicleId);
  let index = typeof prev.pathIndex === 'number' ? prev.pathIndex : 0;
  const prevPos = { lat: Number(prev.lat), lng: Number(prev.lng) };

  // next waypoint is current index+1 (if exists) else target
  const nextWaypoint = (index + 1) < path.length ? path[index + 1] : path[path.length - 1];
  const distToNext = haversine(prevPos, nextWaypoint);

  if (distToNext <= 1){
    // advance index if possible
    if ((index + 1) < path.length - 1) index++;
    // snap to waypoint
    const snapPayload = { lat: nextWaypoint.lat, lng: nextWaypoint.lng, path, pathIndex: index, updatedAt: Date.now() };
    await ref.update(snapPayload);
    return { id: vehicleId, ...snapPayload };
  }

  const step = Math.min(STEP_M, distToNext);
  const brg = bearingBetween(prevPos, nextWaypoint);
  const nextPos = destinationPoint(prevPos, brg, step);
  const out = { lat: nextPos.lat, lng: nextPos.lng, path, pathIndex: index, updatedAt: Date.now(), bearing: brg };
  await ref.update(out);
  return { id: vehicleId, ...out };
}

