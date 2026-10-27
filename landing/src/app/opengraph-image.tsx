import { ogCard, OG_SIZE } from "./og";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Terav: improve your weakest area, keep your training";

export default function Image() {
  return ogCard({
    kicker: "Free open beta",
    title: "Improve your weakest area. Keep your training.",
    sub: "Terav adjusts each session from your log and tells you why.",
  });
}
