using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using BlockPlane.RevitPlugin.Exceptions;

namespace BlockPlane.RevitPlugin.Validation
{
    /// <summary>
    /// Provides comprehensive input validation for the BlockPlane plugin
    /// Validates user inputs, configuration values, and data integrity
    /// </summary>
    public static class InputValidator
    {
        /// <summary>
        /// Validate that a string is not null or empty
        /// </summary>
        public static ValidationResult ValidateRequired(string value, string fieldName)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return ValidationResult.Failure($"{fieldName} is required and cannot be empty.");
            }

            return ValidationResult.Success();
        }

        /// <summary>
        /// Validate string length
        /// </summary>
        public static ValidationResult ValidateLength(string value, string fieldName, int minLength = 0, int maxLength = int.MaxValue)
        {
            if (value == null)
            {
                return ValidationResult.Failure($"{fieldName} cannot be null.");
            }

            if (value.Length < minLength)
            {
                return ValidationResult.Failure($"{fieldName} must be at least {minLength} characters long.");
            }

            if (value.Length > maxLength)
            {
                return ValidationResult.Failure($"{fieldName} cannot exceed {maxLength} characters.");
            }

            return ValidationResult.Success();
        }

        /// <summary>
        /// Validate URL format
        /// </summary>
        public static ValidationResult ValidateUrl(string url, string fieldName)
        {
            if (string.IsNullOrWhiteSpace(url))
            {
                return ValidationResult.Failure($"{fieldName} is required.");
            }

            if (!Uri.TryCreate(url, UriKind.Absolute, out Uri uriResult))
            {
                return ValidationResult.Failure($"{fieldName} is not a valid URL.");
            }

            if (uriResult.Scheme != Uri.UriSchemeHttp && uriResult.Scheme != Uri.UriSchemeHttps)
            {
                return ValidationResult.Failure($"{fieldName} must use HTTP or HTTPS protocol.");
            }

            return ValidationResult.Success();
        }

        /// <summary>
        /// Validate numeric range
        /// </summary>
        public static ValidationResult ValidateRange(double value, string fieldName, double min = double.MinValue, double max = double.MaxValue)
        {
            if (value < min)
            {
                return ValidationResult.Failure($"{fieldName} must be at least {min}.");
            }

            if (value > max)
            {
                return ValidationResult.Failure($"{fieldName} cannot exceed {max}.");
            }

            return ValidationResult.Success();
        }

        /// <summary>
        /// Validate integer range
        /// </summary>
        public static ValidationResult ValidateRange(int value, string fieldName, int min = int.MinValue, int max = int.MaxValue)
        {
            if (value < min)
            {
                return ValidationResult.Failure($"{fieldName} must be at least {min}.");
            }

            if (value > max)
            {
                return ValidationResult.Failure($"{fieldName} cannot exceed {max}.");
            }

            return ValidationResult.Success();
        }

        /// <summary>
        /// Validate positive number
        /// </summary>
        public static ValidationResult ValidatePositive(double value, string fieldName)
        {
            if (value <= 0)
            {
                return ValidationResult.Failure($"{fieldName} must be a positive number.");
            }

            return ValidationResult.Success();
        }

        /// <summary>
        /// Validate non-negative number
        /// </summary>
        public static ValidationResult ValidateNonNegative(double value, string fieldName)
        {
            if (value < 0)
            {
                return ValidationResult.Failure($"{fieldName} cannot be negative.");
            }

            return ValidationResult.Success();
        }

        /// <summary>
        /// Validate email format
        /// </summary>
        public static ValidationResult ValidateEmail(string email, string fieldName)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return ValidationResult.Failure($"{fieldName} is required.");
            }

            // Simple email regex
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase);
            
            if (!emailRegex.IsMatch(email))
            {
                return ValidationResult.Failure($"{fieldName} is not a valid email address.");
            }

            return ValidationResult.Success();
        }

        /// <summary>
        /// Validate file path
        /// </summary>
        public static ValidationResult ValidateFilePath(string path, string fieldName, bool mustExist = false)
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return ValidationResult.Failure($"{fieldName} is required.");
            }

            try
            {
                // Check if path is valid
                var fullPath = System.IO.Path.GetFullPath(path);

                // Check for invalid characters
                if (path.IndexOfAny(System.IO.Path.GetInvalidPathChars()) >= 0)
                {
                    return ValidationResult.Failure($"{fieldName} contains invalid characters.");
                }

                // Check if file must exist
                if (mustExist && !System.IO.File.Exists(path))
                {
                    return ValidationResult.Failure($"File does not exist: {path}");
                }

                return ValidationResult.Success();
            }
            catch (Exception ex)
            {
                return ValidationResult.Failure($"{fieldName} is not a valid file path: {ex.Message}");
            }
        }

        /// <summary>
        /// Validate directory path
        /// </summary>
        public static ValidationResult ValidateDirectoryPath(string path, string fieldName, bool mustExist = false)
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return ValidationResult.Failure($"{fieldName} is required.");
            }

            try
            {
                // Check if path is valid
                var fullPath = System.IO.Path.GetFullPath(path);

                // Check for invalid characters
                if (path.IndexOfAny(System.IO.Path.GetInvalidPathChars()) >= 0)
                {
                    return ValidationResult.Failure($"{fieldName} contains invalid characters.");
                }

                // Check if directory must exist
                if (mustExist && !System.IO.Directory.Exists(path))
                {
                    return ValidationResult.Failure($"Directory does not exist: {path}");
                }

                return ValidationResult.Success();
            }
            catch (Exception ex)
            {
                return ValidationResult.Failure($"{fieldName} is not a valid directory path: {ex.Message}");
            }
        }

        /// <summary>
        /// Validate collection is not empty
        /// </summary>
        public static ValidationResult ValidateNotEmpty<T>(IEnumerable<T> collection, string fieldName)
        {
            if (collection == null)
            {
                return ValidationResult.Failure($"{fieldName} cannot be null.");
            }

            if (!collection.Any())
            {
                return ValidationResult.Failure($"{fieldName} cannot be empty.");
            }

            return ValidationResult.Success();
        }

        /// <summary>
        /// Validate enum value
        /// </summary>
        public static ValidationResult ValidateEnum<TEnum>(object value, string fieldName) where TEnum : struct, Enum
        {
            if (value == null)
            {
                return ValidationResult.Failure($"{fieldName} cannot be null.");
            }

            if (!Enum.IsDefined(typeof(TEnum), value))
            {
                return ValidationResult.Failure($"{fieldName} has an invalid value.");
            }

            return ValidationResult.Success();
        }

        /// <summary>
        /// Validate material ID format
        /// </summary>
        public static ValidationResult ValidateMaterialId(string materialId, string fieldName)
        {
            var requiredResult = ValidateRequired(materialId, fieldName);
            if (!requiredResult.IsValid)
            {
                return requiredResult;
            }

            // Material IDs should be alphanumeric with hyphens
            var idRegex = new Regex(@"^[a-zA-Z0-9\-_]+$");
            
            if (!idRegex.IsMatch(materialId))
            {
                return ValidationResult.Failure($"{fieldName} contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed.");
            }

            return ValidationResult.Success();
        }

        /// <summary>
        /// Validate quantity value
        /// </summary>
        public static ValidationResult ValidateQuantity(double quantity, string unit, string fieldName)
        {
            var positiveResult = ValidatePositive(quantity, fieldName);
            if (!positiveResult.IsValid)
            {
                return positiveResult;
            }

            // Validate reasonable ranges based on unit
            switch (unit?.ToLowerInvariant())
            {
                case "m³":
                case "m3":
                    if (quantity > 1000000) // 1 million cubic meters
                    {
                        return ValidationResult.Failure($"{fieldName} exceeds reasonable limit for volume (1,000,000 m³).");
                    }
                    break;

                case "m²":
                case "m2":
                    if (quantity > 10000000) // 10 million square meters
                    {
                        return ValidationResult.Failure($"{fieldName} exceeds reasonable limit for area (10,000,000 m²).");
                    }
                    break;

                case "m":
                    if (quantity > 100000) // 100 km
                    {
                        return ValidationResult.Failure($"{fieldName} exceeds reasonable limit for length (100,000 m).");
                    }
                    break;

                case "ea":
                    if (quantity > 1000000) // 1 million items
                    {
                        return ValidationResult.Failure($"{fieldName} exceeds reasonable limit for count (1,000,000).");
                    }
                    break;
            }

            return ValidationResult.Success();
        }

        /// <summary>
        /// Validate carbon value
        /// </summary>
        public static ValidationResult ValidateCarbon(double carbon, string fieldName)
        {
            var nonNegativeResult = ValidateNonNegative(carbon, fieldName);
            if (!nonNegativeResult.IsValid)
            {
                return nonNegativeResult;
            }

            // Validate reasonable range (0 to 1 billion kg CO2e)
            if (carbon > 1000000000)
            {
                return ValidationResult.Failure($"{fieldName} exceeds reasonable limit (1,000,000,000 kg CO₂e).");
            }

            return ValidationResult.Success();
        }

        /// <summary>
        /// Validate multiple fields and return combined result
        /// </summary>
        public static ValidationResult ValidateAll(params ValidationResult[] results)
        {
            var failures = results.Where(r => !r.IsValid).ToList();

            if (!failures.Any())
            {
                return ValidationResult.Success();
            }

            var combinedMessage = string.Join("\n", failures.Select(f => f.ErrorMessage));
            return ValidationResult.Failure(combinedMessage);
        }

        /// <summary>
        /// Throw ValidationException if result is not valid
        /// </summary>
        public static void ThrowIfInvalid(ValidationResult result, string fieldName, object value)
        {
            if (!result.IsValid)
            {
                throw new ValidationException(fieldName, value, result.ErrorMessage);
            }
        }
    }

    /// <summary>
    /// Represents the result of a validation operation
    /// </summary>
    public class ValidationResult
    {
        public bool IsValid { get; private set; }
        public string ErrorMessage { get; private set; }

        private ValidationResult(bool isValid, string errorMessage = null)
        {
            IsValid = isValid;
            ErrorMessage = errorMessage;
        }

        public static ValidationResult Success()
        {
            return new ValidationResult(true);
        }

        public static ValidationResult Failure(string errorMessage)
        {
            return new ValidationResult(false, errorMessage);
        }
    }
}
