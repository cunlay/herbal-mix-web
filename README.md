# Herbal Mix Web

A web app that builds an herb blend for a common concern. It shows daily doses, blend percentages, capsule fill, total batch size, cautions, and sources.

This is an original design built on the Herbal Mix engine in `src/`. It doesn't reuse the code or design of herbcomb.com.

## Requirements

- Node.js 18 or newer. Check with `node --version`. Install from https://nodejs.org if needed.

No npm packages are required. The app uses only Node.js built-in modules.

## Installation

1. Unzip the archive and enter the folder:

   ```bash
   unzip herbal-mix-web.zip
   cd herbal-mix-web
   ```

2. Run the app. Nothing needs to be installed first:

   ```bash
   npm start
   ```

   Or without npm:

   ```bash
   node server.js
   ```

3. Open http://localhost:3000 in your browser.

To use another port:

```bash
PORT=8080 npm start        # macOS / Linux
set PORT=8080 && npm start # Windows (cmd)
```

## Using the app

1. Pick a concern (for example, Eye health).
2. Pick a profile if one is offered (a profile is a narrower herb set for a specific goal).
3. Choose a dose level: low, mid, or high within each herb's reference range.
4. Set the days of supply (1 to 365) and the capsule size.
5. Tick any conditions you have. Herbs flagged for those conditions produce an alert.
6. Click **Build blend**. Use **Print** to print or save the sheet.

## API

| Endpoint | Description |
| --- | --- |
| `GET /api/ailments` | Concerns and their profiles |
| `GET /api/herbs` | Herb reference data with dose ranges and status |
| `GET /api/conditions` | Condition flags used for alerts |
| `GET /api/blend?ailment=eye_health&profile=standard&dose=low&servings=30&capsule=500&conditions=blood_thinners` | Builds a blend |

Errors return HTTP 400 with `{ "error": "message" }`.

## Project layout

```
herbal-mix-web/
├── package.json        Project metadata and start script
├── server.js           HTTP server: static files and JSON API
├── public/
│   ├── index.html      Page structure
│   ├── styles.css      Styling, including print styles
│   └── app.js          Form handling and rendering (no frameworks)
└── src/                Blend engine, herb data, ailments (shared with the CLI version)
    ├── blender.js
    ├── herbs.js
    ├── ailments.js
    └── index.js        Command-line version
```

Only `index.html`, `styles.css`, and `app.js` are served from `public/`. Other files are not reachable from the browser.

## Editing the data

Herbs, sources, ailments and profiles live in `src/herbs.js` and `src/ailments.js`. Restart the server after editing them.

Herbs marked `needs_review` show a `*` in the results. Their dose ranges are working values and must be checked against the cited sources before use.

## Deploying

The server is plain Node.js, so it runs on any host that supports Node 18+. If you make it public:

- Serve it over HTTPS.
- Add rate limiting in front of the API.
- Review the disclaimers and legal requirements in your country before publishing health-related content.

## Important

This is educational software, not medical advice. It does not diagnose or treat conditions. Herbs can interact with prescription drugs and can be unsafe in pregnancy or for certain conditions. Anyone taking medication should check with a doctor or pharmacist first.

## License

MIT (see `package.json`). Private package.

## HERB evidence and traditional use

Each ingredient in the results shows:

- Paper counts from the HERB v2 database, including clinical papers, with links to the most recent clinical papers (via DOI)
- Transcriptomic dataset counts
- Key-compound paper counts, matched by compound name (not confirmed as coming from the herb)
- The traditional Chinese name, part used, function, indications and toxicity, where HERB has a record

The results also show how many HERB disease records match the concern, by name pattern.

These come from `src/data/herb_evidence.json` and `src/data/herb_traditional.json`, built with the importer scripts in the herbal-mix project. They are context only and do not change doses. Traditional descriptions are from Chinese medicine and are not clinical evidence. Check HERB's terms of use before redistributing these data files.
