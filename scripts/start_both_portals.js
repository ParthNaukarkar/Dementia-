/**
 * Dual-Port Dev Server Runner for SmritiNER
 * Starts Port 5173 (Patient Portal) and Port 5174 (Caregiver Portal) concurrently.
 */

import { spawn } from 'child_process';

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

console.log('---------------------------------------------------------');
console.log('🚀 Launching SmritiNER Dual-Portal Architecture');
console.log('   🟢 Patient Portal:   http://localhost:5173');
console.log('   🟣 Caregiver Portal: http://localhost:5174');
console.log('---------------------------------------------------------\n');

// 1. Patient Portal on Port 5173
const patientProcess = spawn(npxCmd, ['vite', '--port', '5173', '--strictPort'], {
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, PORT: '5173' }
});

patientProcess.stdout.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.log(`\x1b[36m[Patient :5173]\x1b[0m ${line}`);
});

patientProcess.stderr.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.error(`\x1b[31m[Patient :5173 Error]\x1b[0m ${line}`);
});

// 2. Caregiver Portal on Port 5174
const caregiverProcess = spawn(npxCmd, ['vite', '--port', '5174', '--strictPort'], {
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, PORT: '5174' }
});

caregiverProcess.stdout.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.log(`\x1b[35m[Caregiver :5174]\x1b[0m ${line}`);
});

caregiverProcess.stderr.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.error(`\x1b[31m[Caregiver :5174 Error]\x1b[0m ${line}`);
});

const cleanup = () => {
  console.log('\nStopping both portal dev servers...');
  try { patientProcess.kill(); } catch {}
  try { caregiverProcess.kill(); } catch {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
