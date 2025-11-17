using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using BlockPlane.RevitPlugin.Services;

namespace BlockPlane.RevitPlugin.UI.Views
{
    /// <summary>
    /// Settings Window - Configure plugin preferences and connection settings
    /// </summary>
    public partial class SettingsWindow : Window
    {
        private readonly CacheService _cacheService;
        private readonly BlockPlaneAPIClient _apiClient;

        public SettingsWindow(CacheService cacheService, BlockPlaneAPIClient apiClient)
        {
            InitializeComponent();

            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _apiClient = apiClient ?? throw new ArgumentNullException(nameof(apiClient));

            InitializeRegions();
            LoadSettings();
        }

        /// <summary>
        /// Initialize region dropdown
        /// </summary>
        private void InitializeRegions()
        {
            var regions = new List<string>
            {
                "US National Average",
                "New York, NY",
                "Los Angeles, CA",
                "Chicago, IL",
                "Houston, TX",
                "Phoenix, AZ",
                "Philadelphia, PA",
                "San Antonio, TX",
                "San Diego, CA",
                "Dallas, TX",
                "San Jose, CA",
                "Austin, TX",
                "Jacksonville, FL",
                "Seattle, WA"
            };

            DefaultRegionComboBox.ItemsSource = regions;
            DefaultRegionComboBox.SelectedIndex = 0;
        }

        /// <summary>
        /// Load current settings
        /// </summary>
        private void LoadSettings()
        {
            try
            {
                // API Settings
                ApiUrlTextBox.Text = Properties.Settings.Default.ApiBaseUrl;
                ApiTimeoutTextBox.Text = Properties.Settings.Default.ApiTimeout.ToString();

                // Cache Settings
                EnableCacheCheckBox.IsChecked = Properties.Settings.Default.EnableCache;
                CacheDurationTextBox.Text = Properties.Settings.Default.CacheDurationHours.ToString();

                // Default Preferences
                var defaultRegion = Properties.Settings.Default.DefaultRegion;
                if (!string.IsNullOrEmpty(defaultRegion))
                {
                    var index = (DefaultRegionComboBox.ItemsSource as List<string>)?.IndexOf(defaultRegion) ?? 0;
                    DefaultRegionComboBox.SelectedIndex = index >= 0 ? index : 0;
                }

                AutoCalculateCarbonCheckBox.IsChecked = Properties.Settings.Default.AutoCalculateCarbon;
                ShowRecommendationsCheckBox.IsChecked = Properties.Settings.Default.ShowRecommendations;
                ConfirmSwapsCheckBox.IsChecked = Properties.Settings.Default.ConfirmSwaps;
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Error loading settings:\n\n{ex.Message}",
                    "Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
            }
        }

        /// <summary>
        /// Test API connection
        /// </summary>
        private async void TestConnectionButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var button = sender as System.Windows.Controls.Button;
                button.IsEnabled = false;
                button.Content = "Testing...";

                // Test connection by fetching materials
                var materials = await _apiClient.GetMaterialsAsync();

                button.IsEnabled = true;
                button.Content = "Test Connection";

                if (materials != null && materials.Any())
                {
                    MessageBox.Show(
                        $"Connection successful!\n\nFound {materials.Count()} materials in the database.",
                        "Success",
                        MessageBoxButton.OK,
                        MessageBoxImage.Information
                    );
                }
                else
                {
                    MessageBox.Show(
                        "Connection successful, but no materials were found.",
                        "Warning",
                        MessageBoxButton.OK,
                        MessageBoxImage.Warning
                    );
                }
            }
            catch (Exception ex)
            {
                var button = sender as System.Windows.Controls.Button;
                button.IsEnabled = true;
                button.Content = "Test Connection";

                MessageBox.Show(
                    $"Connection failed:\n\n{ex.Message}",
                    "Connection Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
            }
        }

        /// <summary>
        /// Clear local cache
        /// </summary>
        private void ClearCacheButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var result = MessageBox.Show(
                    "Are you sure you want to clear the local cache?\n\nThis will remove all cached materials and swap history.",
                    "Confirm Clear Cache",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Question
                );

                if (result == MessageBoxResult.Yes)
                {
                    _cacheService.ClearCache();
                    
                    MessageBox.Show(
                        "Cache cleared successfully.",
                        "Success",
                        MessageBoxButton.OK,
                        MessageBoxImage.Information
                    );
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Failed to clear cache:\n\n{ex.Message}",
                    "Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
            }
        }

        /// <summary>
        /// Reset settings to defaults
        /// </summary>
        private void ResetButton_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show(
                "Reset all settings to default values?",
                "Confirm Reset",
                MessageBoxButton.YesNo,
                MessageBoxImage.Question
            );

            if (result == MessageBoxResult.Yes)
            {
                try
                {
                    Properties.Settings.Default.Reset();
                    LoadSettings();

                    MessageBox.Show(
                        "Settings reset to defaults.",
                        "Success",
                        MessageBoxButton.OK,
                        MessageBoxImage.Information
                    );
                }
                catch (Exception ex)
                {
                    MessageBox.Show(
                        $"Failed to reset settings:\n\n{ex.Message}",
                        "Error",
                        MessageBoxButton.OK,
                        MessageBoxImage.Error
                    );
                }
            }
        }

        /// <summary>
        /// Save settings
        /// </summary>
        private void SaveButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Validate inputs
                if (!ValidateInputs())
                {
                    return;
                }

                // API Settings
                Properties.Settings.Default.ApiBaseUrl = ApiUrlTextBox.Text.Trim();
                Properties.Settings.Default.ApiTimeout = int.Parse(ApiTimeoutTextBox.Text);

                // Cache Settings
                Properties.Settings.Default.EnableCache = EnableCacheCheckBox.IsChecked ?? true;
                Properties.Settings.Default.CacheDurationHours = int.Parse(CacheDurationTextBox.Text);

                // Default Preferences
                Properties.Settings.Default.DefaultRegion = DefaultRegionComboBox.SelectedItem?.ToString() ?? "US National Average";
                Properties.Settings.Default.AutoCalculateCarbon = AutoCalculateCarbonCheckBox.IsChecked ?? false;
                Properties.Settings.Default.ShowRecommendations = ShowRecommendationsCheckBox.IsChecked ?? false;
                Properties.Settings.Default.ConfirmSwaps = ConfirmSwapsCheckBox.IsChecked ?? true;

                // Save settings
                Properties.Settings.Default.Save();

                DialogResult = true;
                Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Failed to save settings:\n\n{ex.Message}",
                    "Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
            }
        }

        /// <summary>
        /// Validate user inputs
        /// </summary>
        private bool ValidateInputs()
        {
            // Validate API URL
            if (string.IsNullOrWhiteSpace(ApiUrlTextBox.Text))
            {
                MessageBox.Show(
                    "API Base URL is required.",
                    "Validation Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Warning
                );
                ApiUrlTextBox.Focus();
                return false;
            }

            if (!Uri.TryCreate(ApiUrlTextBox.Text, UriKind.Absolute, out _))
            {
                MessageBox.Show(
                    "API Base URL must be a valid URL.",
                    "Validation Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Warning
                );
                ApiUrlTextBox.Focus();
                return false;
            }

            // Validate API Timeout
            if (!int.TryParse(ApiTimeoutTextBox.Text, out int timeout) || timeout < 5 || timeout > 300)
            {
                MessageBox.Show(
                    "API Timeout must be a number between 5 and 300 seconds.",
                    "Validation Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Warning
                );
                ApiTimeoutTextBox.Focus();
                return false;
            }

            // Validate Cache Duration
            if (!int.TryParse(CacheDurationTextBox.Text, out int cacheDuration) || cacheDuration < 1 || cacheDuration > 168)
            {
                MessageBox.Show(
                    "Cache Duration must be a number between 1 and 168 hours (1 week).",
                    "Validation Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Warning
                );
                CacheDurationTextBox.Focus();
                return false;
            }

            return true;
        }

        /// <summary>
        /// Cancel and close window
        /// </summary>
        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }
    }
}
