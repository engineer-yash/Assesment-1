/**
 * API Service for Commission Calculator
 * Handles all HTTP communication with the backend
 * Provides clean separation between UI and network logic
 */

// Backend API base URL
// Change this if your backend runs on a different port
const API_BASE_URL = 'http://localhost:5000';

/**
 * Calculate commission by calling the backend API
 * 
 * @param {Object} data - Sales data
 * @param {number} data.localSalesCount - Number of local sales
 * @param {number} data.foreignSalesCount - Number of foreign sales
 * @param {number} data.averageSaleAmount - Average amount per sale
 * @returns {Promise<Object>} Commission calculation response
 * @throws {Error} If the API call fails
 */
export const calculateCommission = async (data) => {
  try {
    // Prepare the request body with proper casing for C# backend
    const requestBody = {
      localSalesCount: parseInt(data.localSalesCount),
      foreignSalesCount: parseInt(data.foreignSalesCount),
      averageSaleAmount: parseFloat(data.averageSaleAmount)
    };

    // Make POST request to backend
    const response = await fetch(`${API_BASE_URL}/Commision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Check if response is successful
    if (!response.ok) {
      // Try to parse error message from backend
      const errorData = await response.json().catch(() => null);
      
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      }
      
      // Generic error message if no specific message from backend
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Parse and return the response data
    const responseData = await response.json();
    return responseData;

  } catch (error) {
    // Re-throw with more context if it's a network error
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to backend. Please ensure the API is running on http://localhost:5000');
    }
    
    // Re-throw the original error
    throw error;
  }
};

/**
 * Format currency for display
 * 
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};