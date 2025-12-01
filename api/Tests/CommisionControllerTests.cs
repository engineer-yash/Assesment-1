```csharp
using Xunit;
using Microsoft.AspNetCore.Mvc;
using AvalphaTechnologies.CommissionCalculator.Controllers;

namespace AvalphaTechnologies.CommissionCalculator.Tests
{
    /// Unit tests for CommisionController
    /// Tests calculation logic, validation, and edge cases
    public class CommissionControllerTests
    {
        private readonly CommisionController _controller;

        public CommissionControllerTests()
        {
            _controller = new CommisionController();
        }

        [Fact]
        public void Calculate_WithValidInput_ReturnsCorrectCommissions()
        {
            // Arrange: Prepare test data
            var request = new CommissionCalculationRequest
            {
                LocalSalesCount = 10,
                ForeignSalesCount = 10,
                AverageSaleAmount = 100M
            };

            // Act: Call the method
            var result = _controller.Calculate(request) as OkObjectResult;
            var response = result?.Value as CommissionCalculationResponse;

            // Assert: Verify results
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            Assert.NotNull(response);

            // Avalpha: Local = 10 * 100 * 0.20 = 200
            Assert.Equal(200M, response.AvalphaTechnologiesLocalCommission);

            // Avalpha: Foreign = 10 * 100 * 0.35 = 350
            Assert.Equal(350M, response.AvalphaTechnologiesForeignCommission);

            // Avalpha: Total = 200 + 350 = 550
            Assert.Equal(550M, response.AvalphaTechnologiesCommissionAmount);

            // Competitor: Local = 10 * 100 * 0.02 = 20
            Assert.Equal(20M, response.CompetitorLocalCommission);

            // Competitor: Foreign = 10 * 100 * 0.0755 = 75.50
            Assert.Equal(75.50M, response.CompetitorForeignCommission);

            // Competitor: Total = 20 + 75.50 = 95.50
            Assert.Equal(95.50M, response.CompetitorCommissionAmount);
        }

        [Fact]
        public void Calculate_WithZeroValues_ReturnsZeroCommissions()
        {
            // Arrange
            var request = new CommissionCalculationRequest
            {
                LocalSalesCount = 0,
                ForeignSalesCount = 0,
                AverageSaleAmount = 100M
            };

            // Act
            var result = _controller.Calculate(request) as OkObjectResult;
            var response = result?.Value as CommissionCalculationResponse;

            // Assert
            Assert.NotNull(response);
            Assert.Equal(0M, response.AvalphaTechnologiesCommissionAmount);
            Assert.Equal(0M, response.CompetitorCommissionAmount);
        }

        [Fact]
        public void Calculate_WithNegativeLocalSales_ReturnsBadRequest()
        {
            // Arrange
            var request = new CommissionCalculationRequest
            {
                LocalSalesCount = -5,
                ForeignSalesCount = 10,
                AverageSaleAmount = 100M
            };

            // Act
            var result = _controller.Calculate(request);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void Calculate_WithNegativeForeignSales_ReturnsBadRequest()
        {
            // Arrange
            var request = new CommissionCalculationRequest
            {
                LocalSalesCount = 10,
                ForeignSalesCount = -3,
                AverageSaleAmount = 100M
            };

            // Act
            var result = _controller.Calculate(request);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void Calculate_WithNegativeAverageAmount_ReturnsBadRequest()
        {
            // Arrange
            var request = new CommissionCalculationRequest
            {
                LocalSalesCount = 10,
                ForeignSalesCount = 10,
                AverageSaleAmount = -50M
            };

            // Act
            var result = _controller.Calculate(request);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void Calculate_WithNullRequest_ReturnsBadRequest()
        {
            // Act
            var result = _controller.Calculate(null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void Calculate_WithDecimalAmounts_RoundsCorrectly()
        {
            // Arrange
            var request = new CommissionCalculationRequest
            {
                LocalSalesCount = 7,
                ForeignSalesCount = 3,
                AverageSaleAmount = 123.45M
            };

            // Act
            var result = _controller.Calculate(request) as OkObjectResult;
            var response = result?.Value as CommissionCalculationResponse;

            // Assert
            Assert.NotNull(response);
            // All values should be rounded to 2 decimal places
            Assert.Equal(2, response.AvalphaTechnologiesCommissionAmount.ToString().Split('.')[1].Length);
        }
    }
}