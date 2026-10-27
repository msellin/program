/**
 * GET /data/:file
 *
 * The owner's clinical files (clinical-context, log, program, open-questions)
 * were removed from `public/data/` on 2026-10-27, yet app.terav.fit kept
 * serving them with 200 from the Pages asset cache at some edge locations
 * (cf-cache-status DYNAMIC, age ~4h) after the zone cache was purged. A
 * Function runs before static assets, so it answers 404 for those names
 * regardless of what any edge still holds. Every other data file passes
 * through to the static asset untouched.
 */

const REMOVED = new Set([
  "clinical-context.json",
  "log.json",
  "program.json",
  "open-questions.json",
]);

export const onRequest: PagesFunction = async (context) => {
  const file = String(context.params.file);
  if (REMOVED.has(file)) {
    return new Response("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }
  return context.next();
};
