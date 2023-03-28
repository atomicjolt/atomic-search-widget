require('dotenv').config();
const esbuild = require('esbuild');
const { sassPlugin } = require('esbuild-sass-plugin');

const [env] = process.argv.slice(2);

const baseConfig = {
  entryPoints: ['src/d2l.js'],
  bundle: true,
  logLevel: 'info',
  plugins: [
    sassPlugin({ type: 'css-text' }),
  ],
};

if (env === 'dev') {
  esbuild.serve(
    { port: parseInt(process.env.ASSETS_PORT, 10) },
    {
      ...baseConfig,
      sourcemap: 'inline',
      outfile: 'atomic_search_widget.js',
    }
  ).then(_server => {
    console.log(`serving on ${process.env.ASSETS_PORT}`);
    // Call "stop" on the web server to stop serving
    // server.stop();
  }).catch(err => console.log(err))
} else {
  esbuild.build({
    ...baseConfig,
    outfile: 'build/atomic_search_widget.js',
    minify: true
  });
}
