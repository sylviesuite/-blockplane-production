using System;
using System.Threading;
using System.Threading.Tasks;
using BlockPlane.RevitPlugin.Exceptions;
using Serilog;

namespace BlockPlane.RevitPlugin.Validation
{
    /// <summary>
    /// Provides retry policies for resilient operations
    /// Implements exponential backoff with jitter for network operations
    /// </summary>
    public class RetryPolicy
    {
        private readonly int _maxRetries;
        private readonly TimeSpan _initialDelay;
        private readonly double _backoffMultiplier;
        private readonly TimeSpan _maxDelay;
        private readonly ILogger _logger;
        private readonly Random _random;

        public RetryPolicy(
            int maxRetries = 3,
            TimeSpan? initialDelay = null,
            double backoffMultiplier = 2.0,
            TimeSpan? maxDelay = null)
        {
            _maxRetries = maxRetries;
            _initialDelay = initialDelay ?? TimeSpan.FromSeconds(1);
            _backoffMultiplier = backoffMultiplier;
            _maxDelay = maxDelay ?? TimeSpan.FromMinutes(1);
            _logger = Log.ForContext<RetryPolicy>();
            _random = new Random();
        }

        /// <summary>
        /// Execute an action with retry logic
        /// </summary>
        public void Execute(Action action, string operationName = null)
        {
            int attempt = 0;
            Exception lastException = null;

            while (attempt < _maxRetries)
            {
                try
                {
                    attempt++;
                    action();
                    return; // Success
                }
                catch (Exception ex)
                {
                    lastException = ex;

                    // Don't retry for certain exception types
                    if (!ShouldRetry(ex))
                    {
                        _logger.Warning("Operation '{Operation}' failed with non-retryable exception", operationName ?? "Unknown");
                        throw;
                    }

                    if (attempt >= _maxRetries)
                    {
                        _logger.Error(ex, "Operation '{Operation}' failed after {Attempts} attempts", operationName ?? "Unknown", attempt);
                        throw;
                    }

                    // Calculate delay with exponential backoff and jitter
                    var delay = CalculateDelay(attempt);
                    
                    _logger.Warning(ex, "Operation '{Operation}' failed on attempt {Attempt}/{MaxAttempts}. Retrying in {Delay}ms...",
                        operationName ?? "Unknown", attempt, _maxRetries, delay.TotalMilliseconds);

                    Thread.Sleep(delay);
                }
            }

            // This should never be reached, but just in case
            if (lastException != null)
            {
                throw lastException;
            }
        }

        /// <summary>
        /// Execute a function with retry logic
        /// </summary>
        public T Execute<T>(Func<T> func, string operationName = null)
        {
            int attempt = 0;
            Exception lastException = null;

            while (attempt < _maxRetries)
            {
                try
                {
                    attempt++;
                    return func();
                }
                catch (Exception ex)
                {
                    lastException = ex;

                    // Don't retry for certain exception types
                    if (!ShouldRetry(ex))
                    {
                        _logger.Warning("Operation '{Operation}' failed with non-retryable exception", operationName ?? "Unknown");
                        throw;
                    }

                    if (attempt >= _maxRetries)
                    {
                        _logger.Error(ex, "Operation '{Operation}' failed after {Attempts} attempts", operationName ?? "Unknown", attempt);
                        throw;
                    }

                    // Calculate delay with exponential backoff and jitter
                    var delay = CalculateDelay(attempt);
                    
                    _logger.Warning(ex, "Operation '{Operation}' failed on attempt {Attempt}/{MaxAttempts}. Retrying in {Delay}ms...",
                        operationName ?? "Unknown", attempt, _maxRetries, delay.TotalMilliseconds);

                    Thread.Sleep(delay);
                }
            }

            // This should never be reached, but just in case
            if (lastException != null)
            {
                throw lastException;
            }

            return default(T);
        }

        /// <summary>
        /// Execute an async action with retry logic
        /// </summary>
        public async Task ExecuteAsync(Func<Task> action, string operationName = null, CancellationToken cancellationToken = default)
        {
            int attempt = 0;
            Exception lastException = null;

            while (attempt < _maxRetries)
            {
                try
                {
                    attempt++;
                    await action();
                    return; // Success
                }
                catch (Exception ex)
                {
                    lastException = ex;

                    // Don't retry for certain exception types
                    if (!ShouldRetry(ex))
                    {
                        _logger.Warning("Async operation '{Operation}' failed with non-retryable exception", operationName ?? "Unknown");
                        throw;
                    }

                    if (attempt >= _maxRetries)
                    {
                        _logger.Error(ex, "Async operation '{Operation}' failed after {Attempts} attempts", operationName ?? "Unknown", attempt);
                        throw;
                    }

                    // Calculate delay with exponential backoff and jitter
                    var delay = CalculateDelay(attempt);
                    
                    _logger.Warning(ex, "Async operation '{Operation}' failed on attempt {Attempt}/{MaxAttempts}. Retrying in {Delay}ms...",
                        operationName ?? "Unknown", attempt, _maxRetries, delay.TotalMilliseconds);

                    await Task.Delay(delay, cancellationToken);
                }
            }

            // This should never be reached, but just in case
            if (lastException != null)
            {
                throw lastException;
            }
        }

        /// <summary>
        /// Execute an async function with retry logic
        /// </summary>
        public async Task<T> ExecuteAsync<T>(Func<Task<T>> func, string operationName = null, CancellationToken cancellationToken = default)
        {
            int attempt = 0;
            Exception lastException = null;

            while (attempt < _maxRetries)
            {
                try
                {
                    attempt++;
                    return await func();
                }
                catch (Exception ex)
                {
                    lastException = ex;

                    // Don't retry for certain exception types
                    if (!ShouldRetry(ex))
                    {
                        _logger.Warning("Async operation '{Operation}' failed with non-retryable exception", operationName ?? "Unknown");
                        throw;
                    }

                    if (attempt >= _maxRetries)
                    {
                        _logger.Error(ex, "Async operation '{Operation}' failed after {Attempts} attempts", operationName ?? "Unknown", attempt);
                        throw;
                    }

                    // Calculate delay with exponential backoff and jitter
                    var delay = CalculateDelay(attempt);
                    
                    _logger.Warning(ex, "Async operation '{Operation}' failed on attempt {Attempt}/{MaxAttempts}. Retrying in {Delay}ms...",
                        operationName ?? "Unknown", attempt, _maxRetries, delay.TotalMilliseconds);

                    await Task.Delay(delay, cancellationToken);
                }
            }

            // This should never be reached, but just in case
            if (lastException != null)
            {
                throw lastException;
            }

            return default(T);
        }

        /// <summary>
        /// Calculate delay with exponential backoff and jitter
        /// </summary>
        private TimeSpan CalculateDelay(int attempt)
        {
            // Exponential backoff: initialDelay * (backoffMultiplier ^ (attempt - 1))
            var exponentialDelay = _initialDelay.TotalMilliseconds * Math.Pow(_backoffMultiplier, attempt - 1);

            // Cap at max delay
            exponentialDelay = Math.Min(exponentialDelay, _maxDelay.TotalMilliseconds);

            // Add jitter (±25% randomness)
            var jitter = exponentialDelay * 0.25 * ((_random.NextDouble() * 2) - 1);
            var finalDelay = exponentialDelay + jitter;

            return TimeSpan.FromMilliseconds(Math.Max(0, finalDelay));
        }

        /// <summary>
        /// Determine if an exception should trigger a retry
        /// </summary>
        private bool ShouldRetry(Exception ex)
        {
            // Don't retry validation exceptions
            if (ex is ValidationException)
            {
                return false;
            }

            // Don't retry configuration exceptions
            if (ex is ConfigurationException)
            {
                return false;
            }

            // Don't retry material swap exceptions (they've already been rolled back)
            if (ex is MaterialSwapException)
            {
                return false;
            }

            // Retry API exceptions (network issues, timeouts, server errors)
            if (ex is ApiException apiEx)
            {
                // Don't retry client errors (4xx), but do retry server errors (5xx)
                if (apiEx.StatusCode.HasValue)
                {
                    return apiEx.StatusCode.Value >= 500;
                }
                return true;
            }

            // Retry network exceptions
            if (ex is NetworkException)
            {
                return true;
            }

            // Retry cache exceptions
            if (ex is CacheException)
            {
                return true;
            }

            // Retry file operation exceptions
            if (ex is FileOperationException)
            {
                return true;
            }

            // Retry generic IO exceptions
            if (ex is System.IO.IOException)
            {
                return true;
            }

            // Retry timeout exceptions
            if (ex is TimeoutException)
            {
                return true;
            }

            // Don't retry other exceptions by default
            return false;
        }

        /// <summary>
        /// Create a default retry policy for API operations
        /// </summary>
        public static RetryPolicy ForApiOperations()
        {
            return new RetryPolicy(
                maxRetries: 3,
                initialDelay: TimeSpan.FromSeconds(1),
                backoffMultiplier: 2.0,
                maxDelay: TimeSpan.FromSeconds(30)
            );
        }

        /// <summary>
        /// Create a default retry policy for file operations
        /// </summary>
        public static RetryPolicy ForFileOperations()
        {
            return new RetryPolicy(
                maxRetries: 5,
                initialDelay: TimeSpan.FromMilliseconds(100),
                backoffMultiplier: 1.5,
                maxDelay: TimeSpan.FromSeconds(5)
            );
        }

        /// <summary>
        /// Create a default retry policy for cache operations
        /// </summary>
        public static RetryPolicy ForCacheOperations()
        {
            return new RetryPolicy(
                maxRetries: 2,
                initialDelay: TimeSpan.FromMilliseconds(50),
                backoffMultiplier: 2.0,
                maxDelay: TimeSpan.FromSeconds(1)
            );
        }
    }
}
