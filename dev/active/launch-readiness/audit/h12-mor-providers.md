# H12 MoR provider comparison (access date 2026-10-27)

| Provider | MoR | Fee (published) | EU VAT / sales tax | Health/fitness risk | Approval | Notes |
|---|---|---|---|---|---|---|
| Paddle | Yes | 5% + 50c per Checkout txn ([paddle.com/pricing](https://www.paddle.com/pricing)) | Paddle collects, files, remits | Fitness not listed as restricted; "medical advice incl. muscle building" is prohibited ([paddle.com acceptable-use](https://www.paddle.com/help/start/account-verification/what-am-i-not-allowed-to-sell-on-paddle)) | Async review; unofficial 1-2 days, not confirmed | Trial/portal/refund/payout pages not extractable |
| Lemon Squeezy | Yes | 5% + 50c; +1.5% non-US; +0.5% subscriptions ([docs.lemonsqueezy.com fees](https://docs.lemonsqueezy.com/help/getting-started/fees)) | Included in fee | Not checked | Not checked | Stripe acquisition was announced July 2024, not 2025 (Finextra, PYMNTS, Fintech Futures via web search); page makes no mention of it |
| Stripe Billing + Stripe Tax | No (Managed Payments is separate) | Billing 0.7% PAYG ([stripe.com/billing/pricing](https://stripe.com/billing/pricing)); Tax 0.5%/txn no-code ([stripe.com/tax/pricing](https://stripe.com/tax/pricing)) | You register and file; EU OSS filing needs Tax Complete (from EUR 80/mo) | Stripe prohibits "nutraceuticals ... making harmful claims" (secondary source) | Not checked; Estonia support not verified | Trial, portal, refunds all native; webhooks well documented |
| Polar.sh | Yes ([polar.sh/docs](https://polar.sh/docs/)) | 4% + 40c advertised; some accounts 5% + 50c, depends on creation date ([polar.sh/resources/pricing](https://polar.sh/resources/pricing), 2026 third-party reviews) | Polar handles, uses Stripe Tax; EU OSS VAT number on FAQ | Not checked | Not checked | Payout geography not checked |

**Recommendation (live today):** Paddle as primary, since MoR and mature. [BLOCKS-ADS-TODAY] Before applying, email Paddle to confirm a training app is not "medical advice". Approval time is not confirmed same-day.
**Fallback:** Polar (MoR, possibly lower fee). [BLOCKS-ADS-TODAY] Confirm account approval and Estonia payouts first.

- [BLOCKS-ADS-TODAY] Confirm the fitness-category ruling with the chosen MoR in writing before launching ads.
- [BLOCKS-ADS-TODAY] Payout to an Estonian company: not verified for any provider.
- [BEFORE-SCALE] Stripe + own VAT registration (OSS) only if fees matter at volume.
- [LATER] Cancel portal, trial mechanics and webhook shape need a provider-doc pass before integration.

Not checked: Paddle trial/portal/refund docs, Lemon Squeezy payouts and Estonia support (docs 404), Stripe Managed Payments fee and Estonia support (404), Polar payout countries and approval process, Paddle/Lemon restricted-category lists beyond the pages cited, any provider approval timelines confirmed by the vendor.
