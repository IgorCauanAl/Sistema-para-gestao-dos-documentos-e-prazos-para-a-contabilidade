import { JSDOM } from 'jsdom';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundle = path.join(projectDir, 'node_modules', '.cache', 'smoke-bundle.mjs');

execSync(
  `./node_modules/.bin/esbuild scripts/smoke-entry.jsx --bundle --format=esm --platform=node --jsx=automatic --outfile=${JSON.stringify(bundle)} --log-level=warning`,
  { cwd: projectDir, stdio: 'inherit' }
);

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

const { window } = dom;
const define = (key, value) => Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });

define('window', window);
define('document', window.document);
define('HTMLElement', window.HTMLElement);
define('Element', window.Element);
define('Node', window.Node);
define('MouseEvent', window.MouseEvent);
define('KeyboardEvent', window.KeyboardEvent);
define('Event', window.Event);
define('File', window.File);
define('getComputedStyle', window.getComputedStyle.bind(window));
define('requestAnimationFrame', (cb) => setTimeout(cb, 0));
define('cancelAnimationFrame', (id) => clearTimeout(id));

try {
  Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
} catch {
  /* navigator já existe no Node */
}

const { runSmoke } = await import(bundle);

try {
  await runSmoke();
  process.exit(0);
} catch (err) {
  console.error(err.message ?? err);
  console.error('BODY SNIPPET:', (globalThis.document?.body?.textContent ?? '').slice(0, 600));
  process.exit(1);
}
