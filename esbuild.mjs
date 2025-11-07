import { context, build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';

const [env] = process.argv.slice(2);

const baseConfig = {
  entryPoints: [
    'src/atomic_search_widget.ts',
    'src/brightspace.ts',
    'src/brightspace_enhanced.ts',
  ],
  bundle: true,
  logLevel: 'info',
  plugins: [sassPlugin({ type: 'css-text' })],
  target: ['es2020'],
};

if (env === 'dev') {
  const ctx = await context({
    ...baseConfig,
    sourcemap: 'inline',
    outdir: 'build/dev',
  });

  await ctx.watch()
} else {
  build({
    ...baseConfig,
    outdir: 'build/prod',
    minify: true,
  });
}
