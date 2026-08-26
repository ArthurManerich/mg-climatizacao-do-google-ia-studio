import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    VITE_SUPABASE_URL: 'https://e2e-project.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'e2e-public-anon-key-not-a-secret',
  },
});

process.exit(result.status ?? 1);
