import * as esbuild from 'esbuild';
import * as path from 'path';
import * as toml from '@iarna/toml';
import * as fs from 'fs/promises';

const configExt = await import('./resource.json', {
  assert: { type: 'json' }
})
  .then(res => res.default)
  .catch(() => ({}));

const [,, mode] = process.argv;

const OUT_DIR = './dist';
const OUT_FILE = 'index.mjs';
const WATCH = mode === 'watch';
const PRODUCTION = !WATCH;

const RESOURCE_CONFIG = {
  type: 'js',
  'client-type': 'js',
  main: `server/${OUT_FILE}`,
  'client-main': `client/${OUT_FILE}`,
  'client-files': ['client/*'],
  ...configExt
};

/**
 * Bundle client or server entrypoint.
 */
async function build(dir) {
  const server = dir === 'server';

  const ctx = await esbuild.context({
    entryPoints: [`./src/${dir}/index.ts`],
    bundle: true,
    minify: PRODUCTION,
    format: 'esm',
    platform: server ? 'node' : 'browser',
    outfile: path.join(OUT_DIR, dir, OUT_FILE),
    external: ['alt-server', 'alt-client', 'natives', ...RESOURCE_CONFIG.deps]
  });

  if (WATCH) {
    return ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

/**
 * Generate our resource configuration.
 */
function writeResourceConfig() {
  return fs.writeFile(path.join(OUT_DIR, 'resource.toml'), toml.stringify(RESOURCE_CONFIG));
}

Promise.all([
  build('server'),
  build('client')
])
  .then(() => writeResourceConfig());
