import dotenv from 'dotenv';
import { context, build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';

dotenv.config();

const [env] = process.argv.slice(2);

const baseConfig = {
  entryPoints: [
    'src/atomic_search_widget.js',
    'src/brightspace.js',
    'src/brightspace_enhanced.js',
  ],
  bundle: true,
  logLevel: 'info',
  plugins: [sassPlugin({ type: 'css-text' })],
};

if (env === 'dev') {
  const ctx = await context({
    ...baseConfig,
    sourcemap: 'inline',
    outdir: 'build/dev',
  });

  await ctx.serve({
    port: parseInt(process.env.ASSETS_PORT, 10),
  });
} else {
  build({
    ...baseConfig,
    outdir: 'build/prod',
    minify: true,
  });
}
