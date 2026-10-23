import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// On GitHub Actions, derive the base path from the repository name so this
// works for https://USER.github.io/REPOSITORY/ without editing this file.
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.GITHUB_ACTIONS && repository ? `/${repository}/` : '/';

export default defineConfig({
  plugins: [react()],
  base,
});
