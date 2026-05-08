import { useState } from 'react';
import { Header } from './components/Header';

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header onLoginClick={() => setLoginOpen(true)} />
      <div className="pt-16 p-8">
        <h1 className="text-4xl font-extrabold flotteq-gradient-text">Header skeleton OK</h1>
        {loginOpen && <p>Login overlay would open here</p>}
      </div>
    </main>
  );
}
