import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import * as api from './services/api';

// Mock the API service
jest.mock('./services/api');

describe('Commission Calculator App', () => {
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // RENDERING TESTS
  // ========================================

  test('renders the app title and form', () => {
    render(<App />);
    
    // Check if main elements are present
    expect(screen.getByText(/Avalpha Technologies/i)).toBeInTheDocument();
    expect(screen.getByText(/Commission Calculator/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Local Sales Count/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Foreign Sales Count/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Average Sale Amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calculate Commission/i })).toBeInTheDocument();
  });

  test('displays placeholder message when no results', () => {
    render(<App />);
    expect(screen.getByText(/Enter sales data and click/i)).toBeInTheDocument();
  });

  // ========================================
  // FORM INTERACTION TESTS
  // ========================================

  test('updates input fields when user types', () => {
    render(<App />);
    
    const localInput = screen.getByLabelText(/Local Sales Count/i);
    const foreignInput = screen.getByLabelText(/Foreign Sales Count/i);
    const amountInput = screen.getByLabelText(/Average Sale Amount/i);
    
    // Simulate user input
    fireEvent.change(localInput, { target: { value: '10' } });
    fireEvent.change(foreignInput, { target: { value: '5' } });
    fireEvent.change(amountInput, { target: { value: '100' } });
    
    // Verify values updated
    expect(localInput.value).toBe('10');
    expect(foreignInput.value).toBe('5');
    expect(amountInput.value).toBe('100');
  });

  // ========================================
  // API CALL TESTS
  // ========================================

  test('calls API and displays results on successful calculation', async () => {
    // Mock successful API response
    const mockResponse = {
      avalphaTechnologiesLocalCommission: 200.00,
      avalphaTechnologiesForeignCommission: 175.00,
      avalphaTechnologiesCommissionAmount: 375.00,
      competitorLocalCommission: 20.00,
      competitorForeignCommission: 37.75,
      competitorCommissionAmount: 57.75
    };
    
    api.calculateCommission.mockResolvedValue(mockResponse);

    render(<App />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Local Sales Count/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Foreign Sales Count/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Average Sale Amount/i), { target: { value: '100' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Calculate Commission/i }));
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('£375.00')).toBeInTheDocument();
      expect(screen.getByText('£57.75')).toBeInTheDocument();
    });
    
    // Verify API was called with correct data
    expect(api.calculateCommission).toHaveBeenCalledWith({
      localSalesCount: '10',
      foreignSalesCount: '5',
      averageSaleAmount: '100'
    });
  });

  test('displays error message when API call fails', async () => {
    // Mock failed API call
    api.calculateCommission.mockRejectedValue(new Error('Network error'));

    render(<App />);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/Local Sales Count/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Foreign Sales Count/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Average Sale Amount/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /Calculate Commission/i }));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during API call', async () => {
    // Mock delayed API response
    api.calculateCommission.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({}), 100))
    );

    render(<App />);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/Local Sales Count/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Foreign Sales Count/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Average Sale Amount/i), { target: { value: '100' } });
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Check loading state
    expect(button).toHaveTextContent('Calculating...');
    expect(button).toBeDisabled();
    
    // Wait for completion
    await waitFor(() => {
      expect(button).toHaveTextContent('Calculate Commission');
      expect(button).not.toBeDisabled();
    });
  });

  // ========================================
  // VALIDATION TESTS
  // ========================================

  test('prevents form submission with empty fields', () => {
    render(<App />);
    
    const button = screen.getByRole('button', { name: /Calculate Commission/i });
    
    // Try to submit without filling fields
    fireEvent.click(button);
    
    // API should not be called
    expect(api.calculateCommission).not.toHaveBeenCalled();
  });

  test('displays advantage calculation correctly', async () => {
    const mockResponse = {
      avalphaTechnologiesLocalCommission: 200.00,
      avalphaTechnologiesForeignCommission: 350.00,
      avalphaTechnologiesCommissionAmount: 550.00,
      competitorLocalCommission: 20.00,
      competitorForeignCommission: 75.50,
      competitorCommissionAmount: 95.50
    };
    
    api.calculateCommission.mockResolvedValue(mockResponse);

    render(<App />);
    
    fireEvent.change(screen.getByLabelText(/Local Sales Count/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Foreign Sales Count/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Average Sale Amount/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      // Advantage = 550.00 - 95.50 = 454.50
      expect(screen.getByText(/£454.50/)).toBeInTheDocument();
    });
  });
});