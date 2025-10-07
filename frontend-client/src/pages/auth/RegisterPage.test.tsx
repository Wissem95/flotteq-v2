import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render plan selection on step 1', () => {
    render(<RegisterPage />, { wrapper });

    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('should move to step 2 when plan is selected', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    const starterPlan = screen.getByText('Choisir Starter').closest('button');
    await user.click(starterPlan!);

    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nom de l'entreprise/i)).toBeInTheDocument();
  });

  it('should allow going back to plan selection', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    // Select plan
    await user.click(screen.getByText('Choisir Starter').closest('button')!);

    // Go back
    await user.click(screen.getByText(/changer de plan/i));

    expect(screen.getByText('Starter')).toBeInTheDocument();
  });

  it('should display selected plan info on step 2', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    await user.click(screen.getByText('Choisir Professional').closest('button')!);

    expect(screen.getByText(/professional/i)).toBeInTheDocument();
    expect(screen.getByText(/79€\/mois/i)).toBeInTheDocument();
  });
});
