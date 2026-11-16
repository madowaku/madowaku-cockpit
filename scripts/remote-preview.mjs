import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// A local development launcher only. Sharing the port through Tailscale is a
// separate, human-reviewed action and is never initiated by this script.
const port = 4173;

function validateTailnetHost(value) {
  const host = String(value ?? '').trim().toLowerCase().replace(/\.$/, '');
  const labels = host.split('.');
  const validLabel = (label) =>
    label.length > 0 && label.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label);

  if (
    host.length > 253 ||
    labels.length < 4 ||
    labels.slice(-2).join('.') !== 'ts.net' ||
    !labels.every(validLabel)
  ) {
    throw new Error('Expected a specific Tailscale hostname, for example pc.my-tailnet.ts.net');
  }
  return host;
}

function detectTailnetHost() {
  const commands = ['tailscale'];
  if (process.platform === 'win32') {
    commands.push(join(process.env.ProgramFiles || 'C:\\Program Files', 'Tailscale', 'tailscale.exe'));
  }

  for (const command of commands) {
    const result = spawnSync(command, ['status', '--json'], {
      encoding: 'utf8',
      windowsHide: true,
      timeout: 10000
    });
    if (result.error?.code === 'ENOENT') continue;
    if (result.error || result.status !== 0) {
      throw new Error('Tailscale is unavailable or disconnected. Run tailscale status and sign in first.');
    }

    const status = JSON.parse(result.stdout);
    if (status.BackendState !== 'Running' || !status.Self?.DNSName) {
      throw new Error('Tailscale is not connected or MagicDNS is unavailable.');
    }
    return validateTailnetHost(status.Self.DNSName);
  }

  throw new Error('Tailscale CLI was not found. Install Tailscale or provide your exact .ts.net hostname.');
}

try {
  if (process.argv.length > 3) {
    throw new Error('Usage: npm run dev:phone -- [device.tailnet.ts.net]');
  }
  const host = process.argv[2]
    ? validateTailnetHost(process.argv[2])
    : detectTailnetHost();

  const vite = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
  if (!existsSync(vite)) throw new Error('Vite is missing. Run npm ci first.');

  console.log('\nMGSF Remote Preview: local Vite on 127.0.0.1:' + port);
  console.log('Only ' + host + ' is added to Vite allowed hosts.');
  console.log('In another terminal, after review, run: tailscale serve ' + port);
  console.log('Stop Serve with Ctrl+C. Never use Funnel for this preview.\n');

  const child = spawn(process.execPath, [vite, '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    stdio: 'inherit',
    env: { ...process.env, __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS: host }
  });
  child.on('error', (error) => {
    console.error('Could not start Vite: ' + error.message);
    process.exitCode = 1;
  });
  child.on('exit', (code) => { process.exitCode = code ?? 1; });
} catch (error) {
  console.error('MGSF Remote Preview: ' + error.message);
  process.exitCode = 1;
}
