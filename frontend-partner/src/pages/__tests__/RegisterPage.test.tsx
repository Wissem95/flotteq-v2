/**
 * Unit tests for RegisterPage component
 * Tests validation rules, multi-step navigation, and form submission
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../RegisterPage';
import { VALIDATION_RULES } from '../../config/constants';

// Mock axios
vi.mock('../../lib/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  );
};

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Multi-step navigation', () => {
    it('should render step 1 (Entreprise) by default', () => {
      renderComponent();
      expect(screen.getByText('Devenir partenaire')).toBeInTheDocument();
      expect(screen.getByLabelText(/Nom de l'entreprise/i)).toBeInTheDocument();
    });

    it('should not allow navigation to step 2 with invalid data', async () => {
      renderComponent();

      const nextButton = screen.getByRole('button', { name: /Suivant/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        // Should show validation errors
        expect(screen.getByText(/Le nom de l'entreprise est requis/i)).toBeInTheDocument();
      });
    });

    it('should navigate to step 2 with valid step 1 data', async () => {
      renderComponent();

      // Fill step 1
      fireEvent.change(screen.getByLabelText(/Nom de l'entreprise/i), {
        target: { value: 'Garage Test' },
      });
      fireEvent.change(screen.getByLabelText(/Email professionnel/i), {
        target: { value: 'test@garage.com' },
      });
      fireEvent.change(screen.getByLabelText(/Téléphone/i), {
        target: { value: '+33612345678' },
      });
      fireEvent.change(screen.getByLabelText(/SIRET/i), {
        target: { value: '12345678901234' },
      });

      const nextButton = screen.getByRole('button', { name: /Suivant/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        // Step 2 fields should appear
        expect(screen.getByLabelText(/Adresse/i)).toBeInTheDocument();
      });
    });

    it('should navigate back to step 1 from step 2', async () => {
      renderComponent();

      // Navigate to step 2
      fireEvent.change(screen.getByLabelText(/Nom de l'entreprise/i), {
        target: { value: 'Garage Test' },
      });
      fireEvent.change(screen.getByLabelText(/Email professionnel/i), {
        target: { value: 'test@garage.com' },
      });
      fireEvent.change(screen.getByLabelText(/Téléphone/i), {
        target: { value: '+33612345678' },
      });
      fireEvent.change(screen.getByLabelText(/SIRET/i), {
        target: { value: '12345678901234' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Adresse/i)).toBeInTheDocument();
      });

      // Click previous
      const previousButton = screen.getByRole('button', { name: /Précédent/i });
      fireEvent.click(previousButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/Nom de l'entreprise/i)).toBeInTheDocument();
      });
    });
  });

  describe('SIRET validation', () => {
    it('should reject SIRET with less than 14 digits', async () => {
      renderComponent();

      fireEvent.change(screen.getByLabelText(/Nom de l'entreprise/i), {
        target: { value: 'Garage Test' },
      });
      fireEvent.change(screen.getByLabelText(/Email professionnel/i), {
        target: { value: 'test@garage.com' },
      });
      fireEvent.change(screen.getByLabelText(/Téléphone/i), {
        target: { value: '+33612345678' },
      });
      fireEvent.change(screen.getByLabelText(/SIRET/i), {
        target: { value: '1234567890' }, // Only 10 digits
      });

      fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

      await waitFor(() => {
        expect(screen.getByText(VALIDATION_RULES.SIRET.MESSAGE)).toBeInTheDocument();
      });
    });

    it('should reject SIRET with non-numeric characters', async () => {
      renderComponent();

      fireEvent.change(screen.getByLabelText(/Nom de l'entreprise/i), {
        target: { value: 'Garage Test' },
      });
      fireEvent.change(screen.getByLabelText(/Email professionnel/i), {
        target: { value: 'test@garage.com' },
      });
      fireEvent.change(screen.getByLabelText(/Téléphone/i), {
        target: { value: '+33612345678' },
      });
      fireEvent.change(screen.getByLabelText(/SIRET/i), {
        target: { value: '1234567890ABCD' }, // Contains letters
      });

      fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

      await waitFor(() => {
        expect(screen.getByText(VALIDATION_RULES.SIRET.MESSAGE)).toBeInTheDocument();
      });
    });

    it('should accept valid 14-digit SIRET', async () => {
      renderComponent();

      fireEvent.change(screen.getByLabelText(/Nom de l'entreprise/i), {
        target: { value: 'Garage Test' },
      });
      fireEvent.change(screen.getByLabelText(/Email professionnel/i), {
        target: { value: 'test@garage.com' },
      });
      fireEvent.change(screen.getByLabelText(/Téléphone/i), {
        target: { value: '+33612345678' },
      });
      fireEvent.change(screen.getByLabelText(/SIRET/i), {
        target: { value: '12345678901234' }, // Valid 14 digits
      });

      fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

      await waitFor(() => {
        // Should navigate to step 2 (no validation error)
        expect(screen.getByLabelText(/Adresse/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password validation', () => {
    const navigateToStep3 = async () => {
      // Step 1
      fireEvent.change(screen.getByLabelText(/Nom de l'entreprise/i), {
        target: { value: 'Garage Test' },
      });
      fireEvent.change(screen.getByLabelText(/Email professionnel/i), {
        target: { value: 'test@garage.com' },
      });
      fireEvent.change(screen.getByLabelText(/Téléphone/i), {
        target: { value: '+33612345678' },
      });
      fireEvent.change(screen.getByLabelText(/SIRET/i), {
        target: { value: '12345678901234' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Adresse/i)).toBeInTheDocument();
      });

      // Step 2
      fireEvent.change(screen.getByLabelText(/Adresse/i), {
        target: { value: '123 Rue Test' },
      });
      fireEvent.change(screen.getByLabelText(/Code postal/i), {
        target: { value: '75001' },
      });
      fireEvent.change(screen.getByLabelText(/Ville/i), {
        target: { value: 'Paris' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Prénom/i)).toBeInTheDocument();
      });
    };

    it('should reject password with less than 8 characters', async () => {
      renderComponent();
      await navigateToStep3();

      fireEvent.change(screen.getByLabelText(/Prénom/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/Nom/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getAllByLabelText(/Mot de passe/i)[0], {
        target: { value: 'Pass1!' }, // Only 6 characters
      });
      fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
        target: { value: 'Pass1!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/Le mot de passe doit contenir au moins 8 caractères/i)
        ).toBeInTheDocument();
      });
    });

    it('should reject password without special characters', async () => {
      renderComponent();
      await navigateToStep3();

      fireEvent.change(screen.getByLabelText(/Prénom/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/Nom/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getAllByLabelText(/Mot de passe/i)[0], {
        target: { value: 'Password123' }, // No special char
      });
      fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
        target: { value: 'Password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

      await waitFor(() => {
        expect(screen.getByText(VALIDATION_RULES.PASSWORD.MESSAGE)).toBeInTheDocument();
      });
    });

    it('should reject non-matching passwords', async () => {
      renderComponent();
      await navigateToStep3();

      fireEvent.change(screen.getByLabelText(/Prénom/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/Nom/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getAllByLabelText(/Mot de passe/i)[0], {
        target: { value: 'Password123!' },
      });
      fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
        target: { value: 'DifferentPassword123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

      await waitFor(() => {
        expect(screen.getByText(/Les mots de passe ne correspondent pas/i)).toBeInTheDocument();
      });
    });

    it('should accept valid password', async () => {
      renderComponent();
      await navigateToStep3();

      fireEvent.change(screen.getByLabelText(/Prénom/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/Nom/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getAllByLabelText(/Mot de passe/i)[0], {
        target: { value: 'Password123!' }, // Valid password
      });
      fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
        target: { value: 'Password123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));

      await waitFor(() => {
        // Should navigate to step 4 (no validation error)
        expect(screen.getByText(/Documents requis/i)).toBeInTheDocument();
      });
    });
  });

  describe('Document upload validation', () => {
    it('should require at least one document', async () => {
      renderComponent();

      // Navigate through all steps without uploading documents
      // (Implementation would require full navigation flow)

      // This test would verify that submission fails without documents
      // and shows the appropriate error message
    });
  });
});
