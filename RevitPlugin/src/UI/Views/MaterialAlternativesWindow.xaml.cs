using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Controls;
using BlockPlane.RevitPlugin.Models;

namespace BlockPlane.RevitPlugin.UI.Views
{
    /// <summary>
    /// Material Alternatives Window - Displays and compares alternative materials
    /// </summary>
    public partial class MaterialAlternativesWindow : Window, INotifyPropertyChanged
    {
        private readonly Material _currentMaterial;
        private readonly List<Material> _alternatives;
        
        private Material _selectedAlternative;
        public Material SelectedAlternative
        {
            get => _selectedAlternative;
            set
            {
                _selectedAlternative = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(HasSelectedAlternative));
            }
        }

        public bool HasSelectedAlternative => SelectedAlternative != null;

        public Material SelectedMaterialForSwap { get; private set; }

        public MaterialAlternativesWindow(Material currentMaterial, IEnumerable<Material> alternatives)
        {
            InitializeComponent();

            _currentMaterial = currentMaterial ?? throw new ArgumentNullException(nameof(currentMaterial));
            _alternatives = alternatives?.ToList() ?? throw new ArgumentNullException(nameof(alternatives));

            DataContext = this;

            LoadData();
        }

        /// <summary>
        /// Load current material and alternatives data
        /// </summary>
        private void LoadData()
        {
            try
            {
                // Header
                CurrentMaterialText.Text = $"Finding alternatives for: {_currentMaterial.Name}";

                // Current Material Summary
                CurrentNameText.Text = _currentMaterial.Name;
                CurrentCarbonText.Text = $"{_currentMaterial.TotalCarbon:F1} kg CO₂";
                CurrentCostText.Text = $"${_currentMaterial.CostPerUnit:F2}";
                CurrentRISText.Text = $"RIS {_currentMaterial.RisScore}";

                // Prepare alternatives with comparison data
                var alternativesWithComparison = _alternatives.Select(alt => new MaterialComparison
                {
                    Material = alt,
                    CarbonSavings = _currentMaterial.TotalCarbon - alt.TotalCarbon,
                    CostDifference = alt.CostPerUnit - _currentMaterial.CostPerUnit,
                    MatchScore = CalculateMatchScore(alt)
                }).OrderByDescending(x => x.MatchScore).ToList();

                AlternativesDataGrid.ItemsSource = alternativesWithComparison;

                StatusTextBlock.Text = $"{_alternatives.Count} alternative{(_alternatives.Count != 1 ? "s" : "")} found";
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Error loading alternatives:\n\n{ex.Message}",
                    "Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
            }
        }

        /// <summary>
        /// Calculate match score for alternative material
        /// Higher score = better match
        /// </summary>
        private int CalculateMatchScore(Material alternative)
        {
            int score = 0;

            // Carbon savings (max 40 points)
            double carbonSavings = _currentMaterial.TotalCarbon - alternative.TotalCarbon;
            if (carbonSavings > 0)
            {
                score += Math.Min(40, (int)(carbonSavings * 2));
            }

            // RIS score improvement (max 30 points)
            int risImprovement = alternative.RisScore - _currentMaterial.RisScore;
            if (risImprovement > 0)
            {
                score += Math.Min(30, risImprovement);
            }

            // Cost similarity (max 20 points)
            double costDifference = Math.Abs(alternative.CostPerUnit - _currentMaterial.CostPerUnit);
            double costSimilarity = Math.Max(0, 20 - (costDifference * 2));
            score += (int)costSimilarity;

            // Same category bonus (10 points)
            if (alternative.Category?.Equals(_currentMaterial.Category, StringComparison.OrdinalIgnoreCase) == true)
            {
                score += 10;
            }

            return Math.Min(100, score);
        }

        /// <summary>
        /// Handle alternative selection change
        /// </summary>
        private void AlternativesDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (AlternativesDataGrid.SelectedItem is MaterialComparison comparison)
            {
                SelectedAlternative = comparison.Material;
                
                string carbonText = comparison.CarbonSavings > 0 
                    ? $"saves {comparison.CarbonSavings:F1} kg CO₂" 
                    : $"adds {Math.Abs(comparison.CarbonSavings):F1} kg CO₂";
                
                string costText = comparison.CostDifference > 0 
                    ? $"${comparison.CostDifference:F2} more expensive" 
                    : $"${Math.Abs(comparison.CostDifference):F2} cheaper";

                StatusTextBlock.Text = $"Selected: {comparison.Material.Name} - {carbonText}, {costText}";
            }
            else
            {
                SelectedAlternative = null;
                StatusTextBlock.Text = "Select an alternative to view details or swap";
            }
        }

        /// <summary>
        /// View details of selected alternative
        /// </summary>
        private void ViewDetailsButton_Click(object sender, RoutedEventArgs e)
        {
            if (SelectedAlternative == null)
            {
                MessageBox.Show(
                    "Please select an alternative material to view details.",
                    "No Selection",
                    MessageBoxButton.OK,
                    MessageBoxImage.Information
                );
                return;
            }

            try
            {
                var detailWindow = new MaterialDetailWindow(SelectedAlternative);
                detailWindow.Owner = this;
                detailWindow.ShowDialog();
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Failed to open material details:\n\n{ex.Message}",
                    "Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
            }
        }

        /// <summary>
        /// Select alternative for material swap
        /// </summary>
        private void SelectForSwapButton_Click(object sender, RoutedEventArgs e)
        {
            if (SelectedAlternative == null)
            {
                MessageBox.Show(
                    "Please select an alternative material for swap.",
                    "No Selection",
                    MessageBoxButton.OK,
                    MessageBoxImage.Information
                );
                return;
            }

            var comparison = AlternativesDataGrid.SelectedItem as MaterialComparison;
            
            string carbonImpact = comparison.CarbonSavings > 0 
                ? $"This will save {comparison.CarbonSavings:F1} kg CO₂ per unit." 
                : $"This will add {Math.Abs(comparison.CarbonSavings):F1} kg CO₂ per unit.";
            
            string costImpact = comparison.CostDifference > 0 
                ? $"Cost will increase by ${comparison.CostDifference:F2} per unit." 
                : $"Cost will decrease by ${Math.Abs(comparison.CostDifference):F2} per unit.";

            var result = MessageBox.Show(
                $"Replace '{_currentMaterial.Name}' with '{SelectedAlternative.Name}'?\n\n" +
                $"{carbonImpact}\n{costImpact}\n\n" +
                $"Match Score: {comparison.MatchScore}/100\n\n" +
                $"Do you want to proceed with this swap?",
                "Confirm Material Swap",
                MessageBoxButton.YesNo,
                MessageBoxImage.Question
            );

            if (result == MessageBoxResult.Yes)
            {
                SelectedMaterialForSwap = SelectedAlternative;
                DialogResult = true;
                Close();
            }
        }

        /// <summary>
        /// Close the window
        /// </summary>
        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        #region INotifyPropertyChanged

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        #endregion

        /// <summary>
        /// Helper class for material comparison display
        /// </summary>
        private class MaterialComparison
        {
            public Material Material { get; set; }
            public string Name => Material.Name;
            public string Category => Material.Category;
            public int RisScore => Material.RisScore;
            public double TotalCarbon => Material.TotalCarbon;
            public double CostPerUnit => Material.CostPerUnit;
            public double CarbonSavings { get; set; }
            public double CostDifference { get; set; }
            public int MatchScore { get; set; }
        }
    }
}
