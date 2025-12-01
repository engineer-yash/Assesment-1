using Microsoft.AspNetCore.Mvc;

namespace AvalphaTechnologies.CommissionCalculator.Controllers
{

    /// Controller for calculating commission based on sales data
    /// Handles commission calculations for both Avalpha Technologies and competitors

    [ApiController]
    [Route("[controller]")]
    public class CommisionController : ControllerBase
    {
        // Commission rates as constants for easy maintenance
        private const decimal AVALPHA_LOCAL_RATE = 0.20M;      // 20%
        private const decimal AVALPHA_FOREIGN_RATE = 0.35M;    // 35%
        private const decimal COMPETITOR_LOCAL_RATE = 0.02M;   // 2%
        private const decimal COMPETITOR_FOREIGN_RATE = 0.0755M; // 7.55%
        
        /// Calculate commission for both Avalpha and competitors
    
        /// <param name="calculationRequest">Sales data including local count, foreign count, and average amount</param>
        /// <returns>Detailed commission breakdown</returns>
        [HttpPost]
        [ProducesResponseType(typeof(CommissionCalculationResponse), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        public IActionResult Calculate([FromBody] CommissionCalculationRequest calculationRequest)
        {
            // ========================================
            // STEP 1: Validate Input
            // ========================================

            // Check if model is valid (required fields present)
            if (calculationRequest == null)
            {
                return BadRequest(new ErrorResponse
                {
                    Error = "Invalid request",
                    Message = "Request body cannot be null"
                });
            }

            // Validate that counts are not negative
            if (calculationRequest.LocalSalesCount < 0)
            {
                return BadRequest(new ErrorResponse
                {
                    Error = "Invalid local sales count",
                    Message = "Local sales count must be greater than or equal to 0"
                });
            }

            if (calculationRequest.ForeignSalesCount < 0)
            {
                return BadRequest(new ErrorResponse
                {
                    Error = "Invalid foreign sales count",
                    Message = "Foreign sales count must be greater than or equal to 0"
                });
            }

            // Validate average sale amount
            if (calculationRequest.AverageSaleAmount < 0)
            {
                return BadRequest(new ErrorResponse
                {
                    Error = "Invalid average sale amount",
                    Message = "Average sale amount must be greater than or equal to 0"
                });
            }

            // Optional: Add reasonable upper bounds to prevent overflow
            if (calculationRequest.LocalSalesCount > 1000000 ||
                calculationRequest.ForeignSalesCount > 1000000)
            {
                return BadRequest(new ErrorResponse
                {
                    Error = "Sales count too large",
                    Message = "Sales count must be less than 1,000,000"
                });
            }

            if (calculationRequest.AverageSaleAmount > 1000000)
            {
                return BadRequest(new ErrorResponse
                {
                    Error = "Average sale amount too large",
                    Message = "Average sale amount must be less than £1,000,000"
                });
            }

            // ========================================
            // STEP 2: Calculate Avalpha Commission
            // ========================================

            // Formula: (Sales Count * Average Amount * Commission Rate)
            decimal avalphaLocalCommission =
                calculationRequest.LocalSalesCount *
                calculationRequest.AverageSaleAmount *
                AVALPHA_LOCAL_RATE;

            decimal avalphaForeignCommission =
                calculationRequest.ForeignSalesCount *
                calculationRequest.AverageSaleAmount *
                AVALPHA_FOREIGN_RATE;

            // Total Avalpha commission
            decimal avalphaTotalCommission =
                avalphaLocalCommission + avalphaForeignCommission;

            // ========================================
            // STEP 3: Calculate Competitor Commission
            // ========================================

            decimal competitorLocalCommission =
                calculationRequest.LocalSalesCount *
                calculationRequest.AverageSaleAmount *
                COMPETITOR_LOCAL_RATE;

            decimal competitorForeignCommission =
                calculationRequest.ForeignSalesCount *
                calculationRequest.AverageSaleAmount *
                COMPETITOR_FOREIGN_RATE;

            // Total competitor commission
            decimal competitorTotalCommission =
                competitorLocalCommission + competitorForeignCommission;

            // ========================================
            // STEP 4: Build and Return Response
            // ========================================

            var response = new CommissionCalculationResponse
            {
                // Avalpha breakdown
                AvalphaTechnologiesLocalCommission = Math.Round(avalphaLocalCommission, 2),
                AvalphaTechnologiesForeignCommission = Math.Round(avalphaForeignCommission, 2),
                AvalphaTechnologiesCommissionAmount = Math.Round(avalphaTotalCommission, 2),

                // Competitor breakdown
                CompetitorLocalCommission = Math.Round(competitorLocalCommission, 2),
                CompetitorForeignCommission = Math.Round(competitorForeignCommission, 2),
                CompetitorCommissionAmount = Math.Round(competitorTotalCommission, 2),

                // Additional info
                LocalSalesCount = calculationRequest.LocalSalesCount,
                ForeignSalesCount = calculationRequest.ForeignSalesCount,
                AverageSaleAmount = calculationRequest.AverageSaleAmount
            };

            // Return 200 OK with the calculated response
            return Ok(response);
        }
    }

    // ========================================
    // DATA TRANSFER OBJECTS (DTOs)
    // ========================================

    
    /// Request model for commission calculation
    /// Contains sales data needed to calculate commissions

    public class CommissionCalculationRequest
    {
        
        /// Number of local sales (must be >= 0)
    
        public int LocalSalesCount { get; set; }

        
        /// Number of foreign sales (must be >= 0)
    
        public int ForeignSalesCount { get; set; }

        
        /// Average amount per sale in pounds (must be >= 0)
    
        public decimal AverageSaleAmount { get; set; }
    }

    
    /// Response model containing detailed commission breakdown

    public class CommissionCalculationResponse
    {
        // Avalpha Technologies Commission Details
        public decimal AvalphaTechnologiesLocalCommission { get; set; }
        public decimal AvalphaTechnologiesForeignCommission { get; set; }
        public decimal AvalphaTechnologiesCommissionAmount { get; set; }

        // Competitor Commission Details
        public decimal CompetitorLocalCommission { get; set; }
        public decimal CompetitorForeignCommission { get; set; }
        public decimal CompetitorCommissionAmount { get; set; }

        // Original input data (for reference)
        public int LocalSalesCount { get; set; }
        public int ForeignSalesCount { get; set; }
        public decimal AverageSaleAmount { get; set; }
    }

    
    /// Error response model for validation failures

    public class ErrorResponse
    {
        public string Error { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}