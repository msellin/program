import { en } from "./dictionaries/en";
import type { LandingDict } from "./dictionaries/types";

export type Locale = "en";
export const LOCALES: Locale[] = ["en"];
export const DEFAULT_LOCALE: Locale = "en";

export function getDict(_locale: Locale = "en"): LandingDict {
  void _locale;
  return en;
}
