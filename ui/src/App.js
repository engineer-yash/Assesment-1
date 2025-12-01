import logo from './logo.png';
import './App.css';
import { useState } from 'react';
import { calculateCommission } from './services/api';

function App() {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  // Form input state
  const [formData, setFormData] = useState({
    localSalesCount: '',
    foreignSalesCount: '',
    averageSaleAmount: ''
  });
  
  // Results state - stores the API response
  const [results, setResults] = useState(null);

  // Loading state - shows spinner during API call
  const [isLoading, setIsLoading] = useState(false);
  
  // Error state - displays error messages to user
  const [error, setError] = useState(null);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  /**
   * Handle input field changes
   * Updates form data state as user types
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing again
    if (error) {
      setError(null);
    }
  };

  /**
   * Handle form submission
   * Calls backend API and displays results
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error and results
    setError(null);
    setResults(null);
    setIsLoading(true);
    
    try {
      // Call the backend API
      const response = await calculateCommission(formData);
      
      // Store the results
      setResults(response);
      
    } catch (err) {
      // Display error message to user
      setError(err.message || 'Failed to calculate commission. Please try again.');
      console.error('Calculation error:', err);
      
    } finally {
      // Always stop loading state
      setIsLoading(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="App">
      {/* HEADER SECTION */}
      <header className="App-header">
        <div className="logo-container">
          <img src={logo} className="App-logo" alt="Avalpha Technologies Logo" />
          <h1 className="company-title">Avalpha Technologies</h1>
          <h2 className="app-subtitle">Commission Calculator</h2>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="calculator-container">
          
          {/* LEFT SIDE: INPUT FORM */}
          <div className="form-section">
            <h3>Sales Information</h3>
            
            <form onSubmit={handleSubmit} className="calculator-form">
              {/* Local Sales Count Input */}
              <div className="form-group">
                <label htmlFor="localSalesCount">Local Sales Count</label>
                <input 
                  type="number" 
                  id="localSalesCount"
                  name="localSalesCount"
                  value={formData.localSalesCount}
                  onChange={handleInputChange}
                  placeholder="Enter number of local sales"
                  min="0"
                  required
                  data-testid="local-sales-input"
                />
              </div>

              {/* Foreign Sales Count Input */}
              <div className="form-group">
                <label htmlFor="foreignSalesCount">Foreign Sales Count</label>
                <input 
                  type="number" 
                  id="foreignSalesCount"
                  name="foreignSalesCount"
                  value={formData.foreignSalesCount}
                  onChange={handleInputChange}
                  placeholder="Enter number of foreign sales"
                  min="0"
                  required
                  data-testid="foreign-sales-input"
                />
              </div>
              
              {/* Average Sale Amount Input */}
              <div className="form-group">
                <label htmlFor="averageSaleAmount">Average Sale Amount (£)</label>
                <input 
                  type="number" 
                  step="0.01"
                  id="averageSaleAmount"
                  name="averageSaleAmount"
                  value={formData.averageSaleAmount}
                  onChange={handleInputChange}
                  placeholder="Enter average sale amount"
                  min="0"
                  required
                  data-testid="average-amount-input"
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className={`calculate - btn ${ isLoading ? 'loading' : '' } `}
                disabled={isLoading}
                data-testid="calculate-button"
              >
                {isLoading ? 'Calculating...' : 'Calculate Commission'}
              </button>
            </form>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="error-message" data-testid="error-message">
                <strong>⚠️ Error:</strong> {error}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: RESULTS DISPLAY */}
          <div className="results-section">
            <h3>Commission Results</h3>
            
            {/* Show placeholder if no results yet */}
            {!results && !error && (
              <div className="results-placeholder">
                <p>📊 Enter sales data and click "Calculate Commission" to see results</p>
              </div>
            )}

            {/* Show results after calculation */}
            {results && (
              <div className="results-grid">
                {/* AVALPHA TECHNOLOGIES CARD */}
                <div className="result-card avalpha-card">
                  <div className="result-header">
                    <h4>Avalpha Technologies</h4>
                    <span className="commission-rates">Local: 20% | Foreign: 35%</span>
                  </div>
                  
                  {/* Breakdown */}
                  <div className="breakdown">
                    <div className="breakdown-item">
                      <span>Local:</span>
                      <span data-testid="avalpha-local">
                        £{results.avalphaTechnologiesLocalCommission.toFixed(2)}
                      </span>
                    </div>
                    <div className="breakdown-item">
                      <span>Foreign:</span>
                      <span data-testid="avalpha-foreign">
                        £{results.avalphaTechnologiesForeignCommission.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="result-amount" data-testid="avalpha-total">
                    £{results.avalphaTechnologiesCommissionAmount.toFixed(2)}
                  </div>
                </div>
                
                {/* COMPETITOR CARD */}
                <div className="result-card competitor-card">
                  <div className="result-header">
                    <h4>Competitor</h4>
                    <span className="commission-rates">Local: 2% | Foreign: 7.55%</span>
                  </div>
                  
                  {/* Breakdown */}
                  <div className="breakdown">
                    <div className="breakdown-item">
                      <span>Local:</span>
                      <span data-testid="competitor-local">
                        £{results.competitorLocalCommission.toFixed(2)}
                      </span>
                    </div>
                    <div className="breakdown-item">
                      <span>Foreign:</span>
                      <span data-testid="competitor-foreign">
                        £{results.competitorForeignCommission.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="result-amount" data-testid="competitor-total">
                    £{results.competitorCommissionAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
            
            {/* ADVANTAGE INDICATOR */}
            {results && results.avalphaTechnologiesCommissionAmount > 0 && (
              <div className="advantage-indicator">
                <p className="advantage-text" data-testid="advantage-text">
                  Avalpha Technologies advantage: 
                  <strong>
                    {' '}£{(
                      results.avalphaTechnologiesCommissionAmount - 
                      results.competitorCommissionAmount
                    ).toFixed(2)}
                  </strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="App-footer">
        <p>&copy; 2025 Avalpha Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;