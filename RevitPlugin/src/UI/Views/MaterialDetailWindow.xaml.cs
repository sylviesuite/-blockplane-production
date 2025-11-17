using System;
using System.Linq;
using System.Windows;
using BlockPlane.RevitPlugin.Models;

namespace BlockPlane.RevitPlugin.UI.Views
{
    /// <summary>
    /// Material Detail Window - Displays comprehensive information about a single material
    /// </summary>
    public partial class MaterialDetailWindow : Window
    {
        private readonly Material _material;

        public MaterialDetailWindow(Material material)
        {
            InitializeComponent();

            _material = material ?? throw new ArgumentNullException(nameof(material));
            
            LoadMaterialData();
        }

        /// <summary>
        /// Load material data into UI controls
        /// </summary>
        private void LoadMaterialData()
        {
            try
            {
                // Header
                MaterialNameText.Text = _material.Name ?? "Unknown Material";
                MaterialCategoryText.Text = _material.Category ?? "Uncategorized";

                // Basic Information
                ManufacturerText.Text = _material.Manufacturer ?? "N/A";
                FunctionalUnitText.Text = _material.FunctionalUnit ?? "N/A";
                CostText.Text = _material.CostPerUnit.HasValue 
                    ? $"${_material.CostPerUnit.Value:F2}" 
                    : "N/A";

                RisScoreText.Text = _material.RisScore.ToString();
                LisScoreText.Text = _material.LisScore.ToString();
                RegenerativeText.Text = _material.IsRegenerative ? "Yes" : "No";

                // Apply color coding to RIS/LIS scores
                ApplyScoreFormatting(RisScoreText, _material.RisScore);
                ApplyScoreFormatting(LisScoreText, _material.LisScore);

                // Carbon Footprint
                ProductionCarbonText.Text = FormatCarbon(_material.ProductionCarbon);
                TransportCarbonText.Text = FormatCarbon(_material.TransportCarbon);
                InstallationCarbonText.Text = FormatCarbon(_material.InstallationCarbon);
                UsePhaseCarbonText.Text = FormatCarbon(_material.UsePhaseCarbon);
                EndOfLifeCarbonText.Text = FormatCarbon(_material.EndOfLifeCarbon);
                TotalCarbonText.Text = FormatCarbon(_material.TotalCarbon);

                // Apply color to total carbon
                if (_material.TotalCarbon < 0)
                {
                    TotalCarbonText.Foreground = new System.Windows.Media.SolidColorBrush(
                        System.Windows.Media.Color.FromRgb(34, 197, 94) // Green for carbon negative
                    );
                }

                // Regional Pricing
                if (_material.RegionalPricing != null && _material.RegionalPricing.Any())
                {
                    RegionalPricingGrid.ItemsSource = _material.RegionalPricing
                        .Select(kvp => new { Region = kvp.Key, Price = kvp.Value })
                        .OrderBy(x => x.Region)
                        .ToList();
                }
                else
                {
                    RegionalPricingGrid.ItemsSource = new[] 
                    { 
                        new { Region = "No regional pricing data available", Price = 0.0 } 
                    };
                }

                // Certifications
                if (_material.Certifications != null && _material.Certifications.Any())
                {
                    CertificationsText.Text = string.Join(", ", _material.Certifications);
                }
                else
                {
                    CertificationsText.Text = "No certifications listed";
                }

                // Description
                DescriptionText.Text = !string.IsNullOrWhiteSpace(_material.Description)
                    ? _material.Description
                    : "No description available for this material.";
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Error loading material data:\n\n{ex.Message}",
                    "Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
            }
        }

        /// <summary>
        /// Format carbon value with proper sign and units
        /// </summary>
        private string FormatCarbon(double carbon)
        {
            if (carbon < 0)
            {
                return $"{carbon:F2} (carbon negative)";
            }
            else if (carbon == 0)
            {
                return "0.00 (carbon neutral)";
            }
            else
            {
                return $"{carbon:F2}";
            }
        }

        /// <summary>
        /// Apply color formatting to score text based on value
        /// </summary>
        private void ApplyScoreFormatting(System.Windows.Controls.TextBlock textBlock, int score)
        {
            System.Windows.Media.Color color;

            if (score >= 80)
            {
                // Excellent - Green
                color = System.Windows.Media.Color.FromRgb(34, 197, 94);
            }
            else if (score >= 60)
            {
                // Good - Blue
                color = System.Windows.Media.Color.FromRgb(59, 130, 246);
            }
            else if (score >= 40)
            {
                // Fair - Yellow/Orange
                color = System.Windows.Media.Color.FromRgb(245, 158, 11);
            }
            else
            {
                // Poor - Red
                color = System.Windows.Media.Color.FromRgb(239, 68, 68);
            }

            textBlock.Foreground = new System.Windows.Media.SolidColorBrush(color);
        }

        /// <summary>
        /// Close the window
        /// </summary>
        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }
    }
}
