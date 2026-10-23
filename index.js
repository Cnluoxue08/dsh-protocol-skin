/**
 * dsh-protocol-skin — a protocol-console skin for DeepSeek Harness.
 *
 * The host half does one thing: it appends three rows to the served index —
 * the stylesheet, the sidebar watermark node, and the boot splash (markup +
 * script). Every bitmap, the watermark and the boot voice line travel inside
 * those rows as data URIs, so the package needs no routes, no network and no
 * second request: the desktop shell relays the whole table in one message.
 *
 * Loader config: `{ bootSound?: boolean }` — initial splash-sound state.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const VERSION = '1.0.0';
const here = dirname(fileURLToPath(import.meta.url));
const asset = (name) => join(here, 'assets', name);

function readText(name) {
  try {
    return readFileSync(asset(name), 'utf8');
  } catch {
    return '';
  }
}

/** Inline a binary asset as a data URI. */
function dataUri(name, mime) {
  try {
    return `data:${mime};base64,${readFileSync(asset(name)).toString('base64')}`;
  } catch {
    return '';
  }
}

/** Activation heartbeat, written to $DSH_HOME for support and debugging. */
function trace(patch) {
  try {
    const home = process.env.DSH_HOME || join(homedir(), '.dsh');
    writeFileSync(join(home, '.protocol-skin.json'), `${JSON.stringify(patch, null, 2)}\n`, 'utf8');
  } catch {
    /* heartbeat only */
  }
}

/**
 * @param ctx - host cordis context.
 * @param config - loader row config.
 */
export function apply(ctx, config) {
  const sound = config?.bootSound !== false;
  const activatedAt = new Date().toISOString();
  let served = 0;

  ctx.effect(() => {
    const off = ctx.on('webserver/index-inject', (table) => {
      try {
        const css = readText('skin.css')
          .replace('__CONTOUR_IMG__', dataUri('contour-hi.webp', 'image/webp'))
          .replace('__LOGO_SRC__', dataUri('rhodes-small.png', 'image/png'));
        if (css !== '') table.push({ kind: 'style', text: css });

        table.push({ kind: 'html', placement: 'body', html: '<div class="gs-logo" aria-hidden="true"></div>' });

        const html = readText('splash.html').replace('__WELCOME_SRC__', dataUri('welcome.opus', 'audio/ogg'));
        if (html !== '') table.push({ kind: 'html', placement: 'body', html });

        const js = readText('splash.js');
        if (js !== '') {
          table.push({ kind: 'script', placement: 'body', text: js.replace('__BOOT_SOUND__', String(sound)) });
        }

        served += 1;
        trace({ version: VERSION, activatedAt, listening: true, servedIndex: served, bootSound: sound });
      } catch {
        /* never break the index */
      }
    });
    trace({ version: VERSION, activatedAt, listening: true, servedIndex: served, bootSound: sound });
    return off;
  }, 'protocol-skin: index injections');
}