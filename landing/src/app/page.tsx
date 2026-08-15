import { Ambient } from "@/components/Ambient";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { ThreeWayContrast } from "@/components/sections/ThreeWayContrast";
import { EvidenceClaim } from "@/components/sections/EvidenceClaim";
import { YourFirstWeek } from "@/components/sections/YourFirstWeek";
import { Programs } from "@/components/sections/Programs";
import { WontDo } from "@/components/sections/WontDo";
import { OriginStory } from "@/components/sections/OriginStory";
import { BetaCTA } from "@/components/sections/BetaCTA";
import { getDict } from "@/i18n";

export default function HomePage() {
  const dict = getDict("en");
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-ground)] text-white">
      <Ambient />
      <div className="relative">
        <Nav />
        <Hero dict={dict} />
        <ThreeWayContrast dict={dict} />
        <EvidenceClaim dict={dict} />
        <YourFirstWeek />
        <Programs dict={dict} />
        <WontDo dict={dict} />
        <OriginStory dict={dict} />
        <BetaCTA dict={dict} />
        <Footer />
      </div>
    </div>
  );
}
