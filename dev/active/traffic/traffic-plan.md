# Traffic / discovery — plan

Founder, 2026-09-06, from a Facebook post claiming large SEO numbers on
AI-run sites: "can we add a task to increase traffic?"

Yes. Two things are missing that should not be, and one thing should be
sequenced before any of it.

## Read the screenshot carefully first

Site 1: 8.55K clicks, 43.5K impressions, **19.7% CTR at average position
5.6**. Site 2: 1.98K clicks, 78.4K impressions, 2.5% CTR at position 7.9.

The second is unremarkable and plausible. **The first is not a normal SEO
curve.** Typical CTR at position 5-6 is around 5%; four times that almost
always means BRANDED or navigational queries — people already searching the
name. That is a real result, but it is the result of demand that already
exists, not of SEO creating it, and it does not transfer as a playbook to a
product nobody has heard of.

Worth saying plainly because copying the wrong lesson costs months.

## Done 2026-09-06

The landing had **no `sitemap.xml` and no `robots.txt`** — so the only route
to discovery was whatever a crawler followed from the home page, and the
per-programme pages sit behind a snap carousel, which is exactly the kind of
link a crawler reaches late or never. Both now generated at build time; 15
URLs, derived from `PUBLIC_PROGRAMS` so the catalog cannot drift from the
sitemap.

Metadata was already in good shape: root plus per-page on all six routes,
`metadataBase`, OpenGraph and Twitter cards.

AI crawlers deliberately NOT blocked — the founder's interest is discovery,
LLM answers included.

## The sequencing problem, and it is the real point

**The evidence page is the most linkable thing on this site and it is
mid-correction.**

A sweep of all 126 citations finished today. Roughly 45% verify clean. Seven
links opened the wrong paper (plant genetics, hyperbaric oxygen, the marmoset
genome). Three citations argued AGAINST the claim they were cited for. The
study count on the landing was wrong four times in one evening as duplicates
were merged and phantoms removed.

Driving traffic to a page of citations while that page is being corrected
amplifies whatever is still wrong, and an evidence page is precisely the
thing a critical reader checks first. The remaining ~25 overstatements and
~13 unfindable citations should land before this site is promoted.

## Ordered

1. **DONE** — sitemap.ts, robots.ts
2. **Finish the citation corrections** before promoting anything. Not an SEO
   task; a precondition
3. Then: is there anything to rank FOR? Six pages and seven programme pages
   is a brochure. Ranking needs content answering questions people search —
   and this project has an unusual asset for that, in that its programme
   rationales are already written and now actually verified
4. Structured data (`SoftwareApplication`, `FAQPage`) once the copy is stable
5. Only then: measurement. Search Console, and a decision about analytics
   (FLAG-5 is still open and blocked)

## Not recommended

Chasing the screenshot's playbook. Two AI-run sites with unexplained branded
CTR is not a method, and the post's own comments are turned off.
