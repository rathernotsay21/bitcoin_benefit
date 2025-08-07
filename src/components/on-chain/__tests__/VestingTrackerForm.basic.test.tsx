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
      return null;
    }
    if (field === 'vestingStartDate') {
      if (!value || value === '') return 'Vesting start date is required';
      return null;
    }
    if (field === 'annualGrantBtc') {
      if (!value || value <= 0) return 'Annual grant must be positive';
      return null;
    }
    return null;
  })
}));

describe('VestingTrackerForm - Basic Functionality', () => {
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

  it('renders all form fields', () => {
    render(<VestingTrackerForm />);

    expect(screen.getByLabelText(/bitcoin address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/vesting start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/annual grant amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start tracking vesting grants/i })).toBeInTheDocument();
  });

  it('calls setFormData when address input changes', async () => {
    const user = userEvent.setup();
    render(<VestingTrackerForm />);

    const addressInput = screen.getByLabelText(/bitcoin address/i);
    await user.type(addressInput, 'test');

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('disables submit button when form is invalid', () => {
    render(<VestingTrackerForm />);

    const submitButton = screen.getByRole('button', { name: /start tracking vesting grants/i });
    expect(submitButton).toBeDisabled();
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
  });

  it('shows loading state when isLoading is true', () => {
    mockUseOnChainStore.mockReturnValue({
      ...defaultStoreState,
      isLoading: true
    });

    render(<VestingTrackerForm />);

    expect(screen.getByText(/tracking vesting grants/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bitcoin address/i)).toBeDisabled();
  });

  it('displays error from store', () => {
    mockUseOnChainStore.mockReturnValue({
      ...defaultStoreState,
      error: 'Network error occurred'
    });

    render(<VestingTrackerForm />);

    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });

  it('calls validateAndFetch on form submission when valid', async () => {
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
  });

  it('has proper accessibility attributes', () => {
    render(<VestingTrackerForm />);

    const addressInput = screen.getByLabelText(/bitcoin address/i);
    const dateInput = screen.getByLabelText(/vesting start date/i);
    const amountInput = screen.getByLabelText(/annual grant amount/i);

    expect(addressInput).toHaveAttribute('aria-label');
    expect(dateInput).toHaveAttribute('aria-label');
    expect(amountInput).toHaveAttribute('aria-label');
  });

  it('sets proper input constraints', () => {
    render(<VestingTrackerForm />);

    const dateInput = screen.getByLabelText(/vesting start date/i);
    const amountInput = screen.getByLabelText(/annual grant amount/i);

    expect(dateInput).toHaveAttribute('type', 'date');
    expect(dateInput).toHaveAttribute('max');

    expect(amountInput).toHaveAttribute('type', 'number');
    expect(amountInput).toHaveAttribute('min', '0.00000001');
    expect(amountInput).toHaveAttribute('max', '21');
    expect(amountInput).toHaveAttribute('step', '0.00000001');
  });
});