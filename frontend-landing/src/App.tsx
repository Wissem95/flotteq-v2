import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header onLoginClick={() => setLoginOpen(true)} />
      <Hero />
      {loginOpen && <p className="hidden">{/* placeholder until LoginOverlay */}</p>}
    </main>
  );
}
