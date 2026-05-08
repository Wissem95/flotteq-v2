import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MarketStatsCarousel } from './components/MarketStatsCarousel';
import { AudienceAccordion } from './components/AudienceAccordion';
import { Differentiators } from './components/Differentiators';
import { HowItWorks } from './components/HowItWorks';

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header onLoginClick={() => setLoginOpen(true)} />
      <Hero />
      <MarketStatsCarousel />
      <AudienceAccordion />
      <Differentiators />
      <HowItWorks />
      {loginOpen && <p className="hidden">{/* placeholder until LoginOverlay */}</p>}
    </main>
  );
}
