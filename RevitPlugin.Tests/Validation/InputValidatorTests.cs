using BlockPlane.RevitPlugin.Validation;
using FluentAssertions;
using NUnit.Framework;

namespace BlockPlane.RevitPlugin.Tests.Validation
{
    [TestFixture]
    public class InputValidatorTests
    {
        [Test]
        public void ValidateRequired_WithValidString_ReturnsSuccess()
        {
            // Act
            var result = InputValidator.ValidateRequired("test value", "TestField");

            // Assert
            result.IsValid.Should().BeTrue();
            result.ErrorMessage.Should().BeNull();
        }

        [Test]
        public void ValidateRequired_WithEmptyString_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidateRequired("", "TestField");

            // Assert
            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Contain("TestField");
            result.ErrorMessage.Should().Contain("required");
        }

        [Test]
        public void ValidateRequired_WithNull_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidateRequired(null, "TestField");

            // Assert
            result.IsValid.Should().BeFalse();
        }

        [Test]
        public void ValidateLength_WithValidLength_ReturnsSuccess()
        {
            // Act
            var result = InputValidator.ValidateLength("test", "TestField", minLength: 2, maxLength: 10);

            // Assert
            result.IsValid.Should().BeTrue();
        }

        [Test]
        public void ValidateLength_TooShort_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidateLength("a", "TestField", minLength: 2);

            // Assert
            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Contain("at least 2 characters");
        }

        [Test]
        public void ValidateLength_TooLong_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidateLength("this is too long", "TestField", maxLength: 5);

            // Assert
            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Contain("cannot exceed 5 characters");
        }

        [Test]
        public void ValidateUrl_WithValidUrl_ReturnsSuccess()
        {
            // Act
            var result = InputValidator.ValidateUrl("https://api.blockplane.com", "ApiUrl");

            // Assert
            result.IsValid.Should().BeTrue();
        }

        [Test]
        public void ValidateUrl_WithInvalidUrl_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidateUrl("not-a-url", "ApiUrl");

            // Assert
            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Contain("not a valid URL");
        }

        [Test]
        public void ValidateUrl_WithNonHttpProtocol_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidateUrl("ftp://example.com", "ApiUrl");

            // Assert
            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Contain("HTTP or HTTPS");
        }

        [Test]
        public void ValidateRange_WithinRange_ReturnsSuccess()
        {
            // Act
            var result = InputValidator.ValidateRange(50.0, "Value", min: 0.0, max: 100.0);

            // Assert
            result.IsValid.Should().BeTrue();
        }

        [Test]
        public void ValidateRange_BelowMin_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidateRange(-5.0, "Value", min: 0.0);

            // Assert
            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Contain("at least 0");
        }

        [Test]
        public void ValidateRange_AboveMax_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidateRange(150.0, "Value", max: 100.0);

            // Assert
            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Contain("cannot exceed 100");
        }

        [Test]
        public void ValidatePositive_WithPositiveNumber_ReturnsSuccess()
        {
            // Act
            var result = InputValidator.ValidatePositive(10.5, "Quantity");

            // Assert
            result.IsValid.Should().BeTrue();
        }

        [Test]
        public void ValidatePositive_WithZero_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidatePositive(0.0, "Quantity");

            // Assert
            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Contain("positive number");
        }

        [Test]
        public void ValidatePositive_WithNegative_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidatePositive(-5.0, "Quantity");

            // Assert
            result.IsValid.Should().BeFalse();
        }

        [Test]
        public void ValidateNonNegative_WithZero_ReturnsSuccess()
        {
            // Act
            var result = InputValidator.ValidateNonNegative(0.0, "Value");

            // Assert
            result.IsValid.Should().BeTrue();
        }

        [Test]
        public void ValidateNonNegative_WithNegative_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidateNonNegative(-1.0, "Value");

            // Assert
            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Contain("cannot be negative");
        }

        [Test]
        public void ValidateEmail_WithValidEmail_ReturnsSuccess()
        {
            // Act
            var result = InputValidator.ValidateEmail("user@example.com", "Email");

            // Assert
            result.IsValid.Should().BeTrue();
        }

        [Test]
        public void ValidateEmail_WithInvalidEmail_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidateEmail("not-an-email", "Email");

            // Assert
            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Contain("not a valid email");
        }

        [Test]
        public void ValidateMaterialId_WithValidId_ReturnsSuccess()
        {
            // Act
            var result = InputValidator.ValidateMaterialId("mat-001_test", "MaterialId");

            // Assert
            result.IsValid.Should().BeTrue();
        }

        [Test]
        public void ValidateMaterialId_WithInvalidCharacters_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidateMaterialId("mat@001!", "MaterialId");

            // Assert
            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Contain("invalid characters");
        }

        [Test]
        public void ValidateQuantity_WithValidQuantity_ReturnsSuccess()
        {
            // Act
            var result = InputValidator.ValidateQuantity(100.0, "m³", "Quantity");

            // Assert
            result.IsValid.Should().BeTrue();
        }

        [Test]
        public void ValidateQuantity_WithNegative_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidateQuantity(-10.0, "m³", "Quantity");

            // Assert
            result.IsValid.Should().BeFalse();
        }

        [Test]
        public void ValidateQuantity_ExceedsReasonableLimit_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidateQuantity(2000000.0, "m³", "Quantity");

            // Assert
            result.IsValid.Should().BeFalse();
            result.ErrorMessage.Should().Contain("reasonable limit");
        }

        [Test]
        public void ValidateCarbon_WithValidValue_ReturnsSuccess()
        {
            // Act
            var result = InputValidator.ValidateCarbon(1000.0, "Carbon");

            // Assert
            result.IsValid.Should().BeTrue();
        }

        [Test]
        public void ValidateCarbon_WithNegative_ReturnsFailure()
        {
            // Act
            var result = InputValidator.ValidateCarbon(-100.0, "Carbon");

            // Assert
            result.IsValid.Should().BeFalse();
        }

        [Test]
        public void ValidateAll_AllValid_ReturnsSuccess()
        {
            // Arrange
            var result1 = ValidationResult.Success();
            var result2 = ValidationResult.Success();
            var result3 = ValidationResult.Success();

            // Act
            var combined = InputValidator.ValidateAll(result1, result2, result3);

            // Assert
            combined.IsValid.Should().BeTrue();
        }

        [Test]
        public void ValidateAll_SomeInvalid_ReturnsFailure()
        {
            // Arrange
            var result1 = ValidationResult.Success();
            var result2 = ValidationResult.Failure("Error 1");
            var result3 = ValidationResult.Failure("Error 2");

            // Act
            var combined = InputValidator.ValidateAll(result1, result2, result3);

            // Assert
            combined.IsValid.Should().BeFalse();
            combined.ErrorMessage.Should().Contain("Error 1");
            combined.ErrorMessage.Should().Contain("Error 2");
        }

        [Test]
        public void ThrowIfInvalid_WithInvalidResult_ThrowsValidationException()
        {
            // Arrange
            var result = ValidationResult.Failure("Invalid value");

            // Act & Assert
            Assert.Throws<BlockPlane.RevitPlugin.Exceptions.ValidationException>(() =>
            {
                InputValidator.ThrowIfInvalid(result, "TestField", "test-value");
            });
        }

        [Test]
        public void ThrowIfInvalid_WithValidResult_DoesNotThrow()
        {
            // Arrange
            var result = ValidationResult.Success();

            // Act & Assert
            Assert.DoesNotThrow(() =>
            {
                InputValidator.ThrowIfInvalid(result, "TestField", "test-value");
            });
        }
    }
}
