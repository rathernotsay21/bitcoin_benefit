import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VestingTrackerForm from '../VestingTrackerForm';
import { useOnChainStore } from '@/stores/onChainStore';

// Mock the store
jest.mock('@/stores/onChainStore');
const mockUseOnChainStore = useOnChainStore as jest.MockedFunction<typeof useOnChainStore>;

// Mock validation functions
jest.mock('@/lib/on-chain/validation', () => ({
  validateField: jest.fn((field: string, value: unknown) => {
    if (field === 'address') {
      if (!value || typeof value !== 'string' || value.length === 0) return 'Bitcoin address too short';
      if (value.length < 26) return 'Bitcoin address too short';
      if (!value.match(/^[13bc1]/)) return 'Invalid Bitcoin address format';
      return null;
    }
    if (field === 'vestingStartDate') {
      if (!value || value === '') return 'Vesting start date is required';
      if (new Date(value as string) > new Date()) return 'Start date cannot be in the future';
      return null;
    }
    if (field === 'annualGrantBtc') {
      if (!value || value <= 0) return 'Annual grant must be positive';
      if (value > 21) return 'Annual grant must be between 1 satoshi and 21 BTC';
      return null;
    }
    return null;
  })
}));

describe('VestingTrackerForm', () => {
  const mockSetFormData = jest.fn();
  const mockValidateField = jest.fn();
  const mockValidateAndFetch = jest.fn();

  const defaultStoreState = {
    address: '',
    vestingStartDate: '',
    annualGrantBtc: 0,
    formErrors: {},
    isLoading: false,
    error: null,
    setFormData: mockSetFormData,
    validateField: mockValidateField,
    validateAndFetch: mockValidateAndFetch
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOnChainStore.mockReturnValue(defaultStoreState);
  });

  describe('Rendering', () => {
    it('renders all form fields with proper labels', () => {
      render(<VestingTrackerForm />);

      expect(screen.getByLabelText(/bitcoin address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/vesting start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/annual grant amount/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start tracking vesting grants/i })).toBeInTheDocument();
    });

    it('renders helper text for each field', () => {
      render(<VestingTrackerForm />);

      expect(screen.getByText(/supports p2pkh.*p2sh.*bech32/i)).toBeInTheDocument();
      expect(screen.getByText(/the date your vesting schedule began/i)).toBeInTheDocument();
      expect(screen.getByText(/minimum: 1 satoshi/i)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<VestingTrackerForm className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Input Handling', () => {
    it('updates address field and calls setFormData', async () => {
      const user = userEvent.setup();
      render(<VestingTrackerForm />);

      const addressInput = screen.getByLabelText(/bitcoin address/i);
      await user.type(addressInput, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

      expect(mockSetFormData).toHaveBeenLastCalledWith({ 
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' 
      });
    });

    it('updates date field and calls setFormData', async () => {
      const user = userEvent.setup();
      render(<VestingTrackerForm />);

      const dateInput = screen.getByLabelText(/vesting start date/i);
      await user.type(dateInput, '2023-01-01');

      expect(mockSetFormData).toHaveBeenCalledWith({ 
        vestingStartDate: '2023-01-01' 
      });
    });

    it('updates amount field and calls setFormData', async () => {
      const user = userEvent.setup();
      render(<VestingTrackerForm />);

      const amountInput = screen.getByLabelText(/annual grant amount/i);
      await user.type(amountInput, '0.5');

      expect(mockSetFormData).toHaveBeenCalledWith({ 
        annualGrantBtc: 0.5 
      });
    });

    it('trims whitespace from address input', async () => {
      const user = userEvent.setup();
      render(<VestingTrackerForm />);

      const addressInput = screen.getByLabelText(/bitcoin address/i);
      await user.type(addressInput, '  1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa  ');

      expect(mockSetFormData).toHaveBeenLastCalledWith({ 
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' 
      });
    });
  });

  describe('Real-time Validation', () => {
    it('shows validation error for invalid address after typing', async () => {
      const user = userEvent.setup();
      render(<VestingTrackerForm />);

      const addressInput = screen.getByLabelText(/bitcoin address/i);
      await user.type(addressInput, 'invalid');

      await waitFor(() => {
        expect(screen.getByText(/bitcoin address too short/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for future date', async () => {
      const user = userEvent.setup();
      render(<VestingTrackerForm />);

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const dateInput = screen.getByLabelText(/vesting start date/i);
      await user.type(dateInput, futureDateString);

      await waitFor(() => {
        expect(screen.getByText(/start date cannot be in the future/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid amount', async () => {
      const user = userEvent.setup();
      render(<VestingTrackerForm />);

      const amountInput = screen.getByLabelText(/annual grant amount/i);
      await user.type(amountInput, '25');

      await waitFor(() => {
        expect(screen.getByText(/annual grant must be between 1 satoshi and 21 btc/i)).toBeInTheDocument();
      });
    });

    it('clears validation errors when input becomes valid', async () => {
      const user = userEvent.setup();
      render(<VestingTrackerForm />);

      const addressInput = screen.getByLabelText(/bitcoin address/i);
      
      // Type invalid address
      await user.type(addressInput, 'invalid');
      await waitFor(() => {
        expect(screen.getByText(/bitcoin address too short/i)).toBeInTheDocument();
      });

      // Clear and type valid address
      await user.clear(addressInput);
      await user.type(addressInput, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

      await waitFor(() => {
        expect(screen.queryByText(/bitcoin address too short/i)).not.toBeInTheDocument();
        expect(screen.getByText(/supports p2pkh.*p2sh.*bech32/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for valid inputs', () => {
      render(<VestingTrackerForm />);

      const addressInput = screen.getByLabelText(/bitcoin address/i);
      const dateInput = screen.getByLabelText(/vesting start date/i);
      const amountInput = screen.getByLabelText(/annual grant amount/i);

      expect(addressInput).toHaveAttribute('aria-invalid', 'false');
      expect(addressInput).toHaveAttribute('aria-describedby', 'address-help');
      
      expect(dateInput).toHaveAttribute('aria-invalid', 'false');
      expect(dateInput).toHaveAttribute('aria-describedby', 'date-help');
      
      expect(amountInput).toHaveAttribute('aria-invalid', 'false');
      expect(amountInput).toHaveAttribute('aria-describedby', 'amount-help');
    });

    it('updates ARIA attributes when validation fails', async () => {
      const user = userEvent.setup();
      render(<VestingTrackerForm />);

      const addressInput = screen.getByLabelText(/bitcoin address/i);
      await user.type(addressInput, 'invalid');

      await waitFor(() => {
        expect(addressInput).toHaveAttribute('aria-invalid', 'true');
        expect(addressInput).toHaveAttribute('aria-describedby', 'address-error');
      });
    });

    it('has proper role attributes for error messages', async () => {
      const user = userEvent.setup();
      render(<VestingTrackerForm />);

      const addressInput = screen.getByLabelText(/bitcoin address/i);
      await user.type(addressInput, 'invalid');

      await waitFor(() => {
        const errorMessage = screen.getByText(/bitcoin address too short/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    it('has proper labels and descriptions for screen readers', () => {
      render(<VestingTrackerForm />);

      expect(screen.getByLabelText(/bitcoin address for transaction tracking/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date when vesting schedule began/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/annual bitcoin grant amount/i)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('disables inputs when loading', () => {
      mockUseOnChainStore.mockReturnValue({
        ...defaultStoreState,
        isLoading: true
      });

      render(<VestingTrackerForm />);

      expect(screen.getByLabelText(/bitcoin address/i)).toBeDisabled();
      expect(screen.getByLabelText(/vesting start date/i)).toBeDisabled();
      expect(screen.getByLabelText(/annual grant amount/i)).toBeDisabled();
    });

    it('shows loading state on submit button', () => {
      mockUseOnChainStore.mockReturnValue({
        ...defaultStoreState,
        isLoading: true
      });

      render(<VestingTrackerForm />);

      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/tracking vesting grants/i);
      expect(submitButton.querySelector('svg')).toHaveClass('animate-spin');
    });

    it('applies loading styles to inputs', () => {
      mockUseOnChainStore.mockReturnValue({
        ...defaultStoreState,
        isLoading: true
      });

      render(<VestingTrackerForm />);

      const addressInput = screen.getByLabelText(/bitcoin address/i);
      expect(addressInput).toHaveClass('bg-gray-100', 'cursor-not-allowed');
    });
  });

  describe('Error Display', () => {
    it('displays store errors', () => {
      mockUseOnChainStore.mockReturnValue({
        ...defaultStoreState,
        formErrors: {
          address: 'Store validation error'
        }
      });

      render(<VestingTrackerForm />);

      expect(screen.getByText('Store validation error')).toBeInTheDocument();
    });

    it('displays general error from store', () => {
      mockUseOnChainStore.mockReturnValue({
        ...defaultStoreState,
        error: 'Network error occurred'
      });

      render(<VestingTrackerForm />);

      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });

    it('prioritizes store errors over local errors', () => {
      mockUseOnChainStore.mockReturnValue({
        ...defaultStoreState,
        formErrors: {
          address: 'Store error'
        }
      });

      render(<VestingTrackerForm />);

      // Even if local validation would show different error, store error should be shown
      expect(screen.getByText('Store error')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('prevents submission when loading', async () => {
      const user = userEvent.setup();
      mockUseOnChainStore.mockReturnValue({
        ...defaultStoreState,
        isLoading: true
      });

      render(<VestingTrackerForm />);

      const form = screen.getByRole('button').closest('form');
      await user.click(screen.getByRole('button'));

      expect(mockValidateAndFetch).not.toHaveBeenCalled();
    });

    it('validates all fields on submission', async () => {
      const user = userEvent.setup();
      render(<VestingTrackerForm />);

      const submitButton = screen.getByRole('button', { name: /start tracking vesting grants/i });
      await user.click(submitButton);

      // Should show validation errors for empty fields
      await waitFor(() => {
        expect(screen.getByText(/bitcoin address too short/i)).toBeInTheDocument();
        expect(screen.getByText(/vesting start date is required/i)).toBeInTheDocument();
        expect(screen.getByText(/annual grant must be positive/i)).toBeInTheDocument();
      });

      expect(mockValidateAndFetch).not.toHaveBeenCalled();
    });

    it('calls validateAndFetch when form is valid', async () => {
      const user = userEvent.setup();
      mockUseOnChainStore.mockReturnValue({
        ...defaultStoreState,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        vestingStartDate: '2023-01-01',
        annualGrantBtc: 0.5
      });

      render(<VestingTrackerForm />);

      const submitButton = screen.getByRole('button', { name: /start tracking vesting grants/i });
      await user.click(submitButton);

      expect(mockValidateAndFetch).toHaveBeenCalled();
    });

    it('calls custom onSubmit when provided', async () => {
      const mockOnSubmit = jest.fn();
      const user = userEvent.setup();
      
      mockUseOnChainStore.mockReturnValue({
        ...defaultStoreState,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        vestingStartDate: '2023-01-01',
        annualGrantBtc: 0.5
      });

      render(<VestingTrackerForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /start tracking vesting grants/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        vestingStartDate: '2023-01-01',
        annualGrantBtc: 0.5
      });
      expect(mockValidateAndFetch).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation State', () => {
    it('disables submit button when form is invalid', () => {
      render(<VestingTrackerForm />);

      const submitButton = screen.getByRole('button', { name: /start tracking vesting grants/i });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('enables submit button when form is valid', () => {
      mockUseOnChainStore.mockReturnValue({
        ...defaultStoreState,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        vestingStartDate: '2023-01-01',
        annualGrantBtc: 0.5
      });

      render(<VestingTrackerForm />);

      const submitButton = screen.getByRole('button', { name: /start tracking vesting grants/i });
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).not.toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('Input Constraints', () => {
    it('sets proper constraints on date input', () => {
      render(<VestingTrackerForm />);

      const dateInput = screen.getByLabelText(/vesting start date/i);
      const today = new Date().toISOString().split('T')[0];
      
      expect(dateInput).toHaveAttribute('type', 'date');
      expect(dateInput).toHaveAttribute('max', today);
    });

    it('sets proper constraints on amount input', () => {
      render(<VestingTrackerForm />);

      const amountInput = screen.getByLabelText(/annual grant amount/i);
      
      expect(amountInput).toHaveAttribute('type', 'number');
      expect(amountInput).toHaveAttribute('step', '0.00000001');
      expect(amountInput).toHaveAttribute('min', '0.00000001');
      expect(amountInput).toHaveAttribute('max', '21');
    });
  });
});