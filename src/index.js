#!/usr/bin/env node
'use strict';

const http = require('http');
const { AILMENTS } = require('./ailments');
const { buildBlend, listHerbs, DOSE_LEVELS } = require('./blender');

const pad = (text, width) => String(text).padEnd(width);

/** Human-readable blend sheet for the terminal. */
function formatText(r) {
  const { ailment, profile, dose, dailyServing, totalBlend, ingredients, alerts, cautions, reviewNeeded, sources, disclaimer } = r;
  const lines = [];

  lines.push(`${ailment.name} herbal blend | profile: ${profile.label} | dose: ${dose}`);
  lines.push(ailment.summary, '');

  lines.push(
    pad('Herb', 16) + pad('Daily dose', 13) + pad('Blend %', 10) + pad('Per capsule', 13) +
      pad(`Batch (${totalBlend.servings} days)`, 24) + 'Basis'
  );
  for (const i of ingredients) {
    const mark = i.status === 'needs_review' ? '*' : '';
    lines.push(
      pad(i.name + mark, 16) + pad(`${i.dailyDoseMg} mg`, 13) + pad(`${i.blendPercent}%`, 10) +
        pad(`${i.perCapsuleMg} mg`, 13) + pad(`${(i.batchMg / 1000).toFixed(2)} g`, 24) + i.basis
    );
  }
  lines.push('');

  lines.push(
    `Daily serving: ${dailyServing.totalMg} mg = ${dailyServing.capsulesPerDay} capsule(s) of ` +
      `${dailyServing.capsuleMg} mg (about ${dailyServing.mgPerCapsule} mg blend each)`
  );
  lines.push(`Total blend:  ${totalBlend.grams} g for ${totalBlend.servings} servings`, '');

  if (alerts.length) {
    lines.push('ALERTS (based on your conditions):');
    for (const a of alerts) lines.push(`  ! ${a.message}`);
    lines.push('');
  }

  lines.push('Cautions:');
  for (const c of cautions) lines.push(`  - ${c}`);
  lines.push('');

  if (reviewNeeded.length) {
    lines.push(`* Dose for ${reviewNeeded.join(', ')} is a working range; verify against the cited source before use.`);
  }
  lines.push('Sources:');
  for (const s of sources) lines.push(`  - ${s.title}${s.url ? ` (${s.url})` : ''}`);
  lines.push('', disclaimer);

  return lines.join('\n');
}

/** Splits argv into a command, positional arguments and --flags. */
function parseArgs(argv) {
  const [command, ...rest] = argv;
  const flags = {};
  const positional = [];
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg.startsWith('--')) {
      const next = rest[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        flags[arg.slice(2)] = next;
        i++;
      } else {
        flags[arg.slice(2)] = true;
      }
    } else {
      positional.push(arg);
    }
  }
  return { command, positional, flags };
}

function usage() {
  return [
    'Usage:',
    '  herbal-mix list                         Ailments and profiles',
    '  herbal-mix herbs                        Herb reference data',
    '  herbal-mix recommend <ailment> [options]',
    '     --profile <name>        Scenario profile (default: standard)',
    '     --dose low|mid|high     Dose within each herb range (default: low)',
    '     --servings <n>          Days of supply for the batch (default: 30)',
    '     --capsule <mg>          Capsule fill size (default: 500)',
    '     --conditions a,b        Flag herbs for conditions, e.g. blood_thinners,pregnancy',
    '     --json                  Output JSON',
    '  herbal-mix serve [--port 3000]          Start the JSON API',
    '',
    `Doses: ${DOSE_LEVELS.join(', ')}`,
  ].join('\n');
}

/** JSON API: /api/ailments, /api/herbs, /api/blend?ailment=...&profile=...&dose=...&servings=...&conditions=... */
function serve(port) {
  const server = http.createServer((req, res) => {
    const send = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body, null, 2));
    };

    if (req.method !== 'GET') return send(405, { error: 'Method not allowed' });

    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/api/ailments') {
      return send(
        200,
        Object.values(AILMENTS).map(({ id, name, summary, profiles }) => ({
          id,
          name,
          summary,
          profiles: Object.entries(profiles).map(([pid, p]) => ({ id: pid, label: p.label })),
        }))
      );
    }

    if (url.pathname === '/api/herbs') return send(200, listHerbs());

    if (url.pathname === '/api/blend') {
      try {
        const result = buildBlend(url.searchParams.get('ailment') || '', {
          profile: url.searchParams.get('profile'),
          dose: url.searchParams.get('dose'),
          servings: url.searchParams.get('servings'),
          capsuleMg: url.searchParams.get('capsule'),
          conditions: url.searchParams.get('conditions'),
        });
        return send(200, result);
      } catch (err) {
        return send(400, { error: err.message });
      }
    }

    return send(404, { error: 'Not found' });
  });

  server.listen(port, () => {
    console.log(`Herbal mix API running at http://localhost:${port}`);
    console.log('Try: /api/ailments, /api/herbs, /api/blend?ailment=eye_health&profile=antioxidant_focus&dose=mid');
  });
  return server;
}

function main(argv) {
  const { command, positional, flags } = parseArgs(argv);

  try {
    switch (command) {
      case 'list':
        for (const a of Object.values(AILMENTS)) {
          console.log(`${a.id.padEnd(20)} ${a.name}`);
          for (const [pid, p] of Object.entries(a.profiles)) {
            console.log(`${' '.repeat(22)}profile: ${pid.padEnd(16)} ${p.label}`);
          }
        }
        return;

      case 'herbs':
        for (const h of listHerbs()) {
          const mark = h.status === 'needs_review' ? '*' : h.status === 'catalog_only' ? 'c' : ' ';
          console.log(`${mark} ${h.id.padEnd(16)} ${h.dailyRangeMg.padEnd(12)} mg/day  ${h.latin ?? ''}`);
        }
        console.log('\n* working range, verify against the cited source');
        console.log('c  catalog only, no dose data yet (cannot be used in a blend)');
        return;

      case 'recommend': {
        const ailmentId = positional[0];
        if (!ailmentId) {
          console.error(usage());
          process.exitCode = 1;
          return;
        }
        const result = buildBlend(ailmentId, {
          profile: flags.profile,
          dose: flags.dose,
          servings: flags.servings,
          capsuleMg: flags.capsule,
          conditions: flags.conditions,
        });
        console.log(flags.json ? JSON.stringify(result, null, 2) : formatText(result));
        return;
      }

      case 'serve':
        serve(Number(flags.port) || 3000);
        return;

      default:
        console.log(usage());
        if (command) process.exitCode = 1;
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { main, formatText, serve };
