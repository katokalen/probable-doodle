# AFWI resources migration

Moves Resources (and their topics, audiences and publishers) from the old Alberta Family
Wellness SilverStripe site into Sanity as `resource`, `resourceTopic`, `resourceAudience` and
`resourcePublisher` documents.

Document IDs come from the SilverStripe IDs (`resource-902`, `resourceTopic-3`, …), so every run
replaces the same documents instead of creating duplicates.

## What you need

- A database export of the old site in `palix-albertafamilywellness.org/db/` (`*.sql.gz`).
- The old site's `public/assets` folder at the path in `config.ts`.

## 1. Load the database into a throwaway MySQL

```bash
docker run -d --rm --name afwi-migration-db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=afwi -p 127.0.0.1:3316:3306 mysql:8.0
```

Wait a few seconds for it to start, then load the export:

```bash
gzcat ~/Sites/palix-albertafamilywellness.org/db/*.sql.gz | docker exec -i afwi-migration-db mysql -uroot -proot afwi
```

## 2. Extract, transform, import

Run from `studio/`:

```bash
pnpm exec sanity exec migrations/afwi-resources/extract.ts
```

```bash
pnpm exec sanity exec migrations/afwi-resources/transform.ts
```

Read `reports/report.md` before importing. It lists missing files, cleaned-up relationships and
links that still point at the old site.

```bash
pnpm exec sanity datasets import migrations/afwi-resources/transformed/resources.ndjson --dataset migration --replace
```

Then check it against the schema:

```bash
pnpm exec sanity documents validate --dataset migration --yes
```

To import into `production` once it's signed off, run the import with `--dataset production`.

## 3. Clean up

```bash
docker stop afwi-migration-db
```

`extracted/`, `transformed/` and `reports/` are generated and gitignored.

## Decisions made

- **All resources are published.** The old `IsPublished` flag was never read by the site, so
  every resource was public. The flag is kept in `migration.legacyIsPublished`.
- **Missing files are skipped**, not downloaded. Their old URLs are kept in
  `migration.missingFiles` and listed in the report.
- **Join-table rows for deleted records are dropped** (about 1,100 in the export) and counted in
  the report.
- **Shortcodes and relative links** in rich text become absolute links to the old site, and the
  report lists them so they can be re-pointed before the old site goes away.
- **Vimeo thumbnails** aren't imported as images; the URL is kept in `migration.vimeoThumbnailUrl`
  and the Vimeo ID is in `video.vimeoId`.
- **Not migrated:** `Tags` (empty for every resource), `Sort`/`SortOrder` (the old site sorted by
  featured, then title) and the unused single `RelatedResourceID`.
