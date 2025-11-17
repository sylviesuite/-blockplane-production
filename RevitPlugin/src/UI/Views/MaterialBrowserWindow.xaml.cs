using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using BlockPlane.RevitPlugin.Models;
using BlockPlane.RevitPlugin.Services;
using BlockPlane.RevitPlugin.UI.ViewModels;

namespace BlockPlane.RevitPlugin.UI.Views
{
    /// <summary>
    /// Material Browser Window - Main UI for searching and browsing BlockPlane materials
    /// </summary>
    public partial class MaterialBrowserWindow : Window
    {
        private readonly MaterialBrowserViewModel _viewModel;
        private readonly MaterialService _materialService;

        public MaterialBrowserWindow(MaterialService materialService)
        {
            InitializeComponent();

            _materialService = materialService ?? throw new ArgumentNullException(nameof(materialService));
            _viewModel = new MaterialBrowserViewModel(materialService);
            DataContext = _viewModel;

            InitializeCategories();
            LoadInitialData();
        }

        /// <summary>
        /// Initialize category dropdown with all available categories
        /// </summary>
        private void InitializeCategories()
        {
            var categories = new List<string>
            {
                "All Categories",
                "Timber",
                "Steel",
                "Concrete",
                "Earth",
                "Insulation",
                "Composites",
                "Masonry"
            };

            CategoryComboBox.ItemsSource = categories;
            CategoryComboBox.SelectedIndex = 0;
        }

        /// <summary>
        /// Load initial materials data on window open
        /// </summary>
        private async void LoadInitialData()
        {
            try
            {
                ShowLoading("Loading materials...");
                await _viewModel.LoadMaterialsAsync();
                UpdateMaterialCount();
                HideLoading();
                UpdateStatus("Ready");
            }
            catch (Exception ex)
            {
                HideLoading();
                UpdateStatus($"Error loading materials: {ex.Message}");
                MessageBox.Show(
                    $"Failed to load materials:\n\n{ex.Message}",
                    "Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
            }
        }

        /// <summary>
        /// Handle search button click
        /// </summary>
        private async void SearchButton_Click(object sender, RoutedEventArgs e)
        {
            await PerformSearchAsync();
        }

        /// <summary>
        /// Handle Enter key in search box
        /// </summary>
        private async void SearchTextBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                await PerformSearchAsync();
            }
        }

        /// <summary>
        /// Perform material search with current filters
        /// </summary>
        private async System.Threading.Tasks.Task PerformSearchAsync()
        {
            try
            {
                ShowLoading("Searching materials...");
                await _viewModel.SearchMaterialsAsync();
                UpdateMaterialCount();
                HideLoading();
                UpdateStatus($"Search completed");
            }
            catch (Exception ex)
            {
                HideLoading();
                UpdateStatus($"Search failed: {ex.Message}");
                MessageBox.Show(
                    $"Search failed:\n\n{ex.Message}",
                    "Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
            }
        }

        /// <summary>
        /// Handle category filter change
        /// </summary>
        private async void CategoryComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (_viewModel == null || !_viewModel.IsInitialized) return;

            try
            {
                ShowLoading("Filtering materials...");
                await _viewModel.ApplyFiltersAsync();
                UpdateMaterialCount();
                HideLoading();
                UpdateStatus("Filters applied");
            }
            catch (Exception ex)
            {
                HideLoading();
                UpdateStatus($"Filter error: {ex.Message}");
            }
        }

        /// <summary>
        /// Clear all filters and reload materials
        /// </summary>
        private async void ClearFiltersButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                SearchTextBox.Text = string.Empty;
                CategoryComboBox.SelectedIndex = 0;
                MinRISTextBox.Text = string.Empty;
                MaxCarbonTextBox.Text = string.Empty;
                RegenerativeOnlyCheckBox.IsChecked = false;

                _viewModel.ClearFilters();

                ShowLoading("Loading materials...");
                await _viewModel.LoadMaterialsAsync();
                UpdateMaterialCount();
                HideLoading();
                UpdateStatus("Filters cleared");
            }
            catch (Exception ex)
            {
                HideLoading();
                UpdateStatus($"Error: {ex.Message}");
            }
        }

        /// <summary>
        /// Refresh materials from API
        /// </summary>
        private async void RefreshButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                ShowLoading("Refreshing materials from API...");
                await _viewModel.RefreshMaterialsAsync();
                UpdateMaterialCount();
                HideLoading();
                UpdateStatus("Materials refreshed");
                MessageBox.Show(
                    "Materials refreshed successfully from BlockPlane API.",
                    "Success",
                    MessageBoxButton.OK,
                    MessageBoxImage.Information
                );
            }
            catch (Exception ex)
            {
                HideLoading();
                UpdateStatus($"Refresh failed: {ex.Message}");
                MessageBox.Show(
                    $"Failed to refresh materials:\n\n{ex.Message}",
                    "Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
            }
        }

        /// <summary>
        /// Handle material selection change
        /// </summary>
        private void MaterialsDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            _viewModel.UpdateSelection();
            
            if (_viewModel.SelectedMaterial != null)
            {
                UpdateStatus($"Selected: {_viewModel.SelectedMaterial.Name}");
            }
        }

        /// <summary>
        /// View detailed information about selected material
        /// </summary>
        private void ViewDetailsButton_Click(object sender, RoutedEventArgs e)
        {
            if (_viewModel.SelectedMaterial == null)
            {
                MessageBox.Show(
                    "Please select a material to view details.",
                    "No Selection",
                    MessageBoxButton.OK,
                    MessageBoxImage.Information
                );
                return;
            }

            try
            {
                var detailWindow = new MaterialDetailWindow(_viewModel.SelectedMaterial);
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
        /// Find alternative materials for selected material
        /// </summary>
        private async void FindAlternativesButton_Click(object sender, RoutedEventArgs e)
        {
            if (_viewModel.SelectedMaterial == null)
            {
                MessageBox.Show(
                    "Please select a material to find alternatives.",
                    "No Selection",
                    MessageBoxButton.OK,
                    MessageBoxImage.Information
                );
                return;
            }

            try
            {
                ShowLoading("Finding alternatives...");
                
                var alternatives = await _materialService.GetAlternativesAsync(
                    _viewModel.SelectedMaterial.Id,
                    limit: 10
                );

                HideLoading();

                if (alternatives == null || !alternatives.Any())
                {
                    MessageBox.Show(
                        "No alternative materials found.",
                        "No Alternatives",
                        MessageBoxButton.OK,
                        MessageBoxImage.Information
                    );
                    return;
                }

                var alternativesWindow = new MaterialAlternativesWindow(
                    _viewModel.SelectedMaterial,
                    alternatives
                );
                alternativesWindow.Owner = this;
                alternativesWindow.ShowDialog();
            }
            catch (Exception ex)
            {
                HideLoading();
                MessageBox.Show(
                    $"Failed to find alternatives:\n\n{ex.Message}",
                    "Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
            }
        }

        /// <summary>
        /// Close the window
        /// </summary>
        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        #region UI Helper Methods

        /// <summary>
        /// Show loading overlay with message
        /// </summary>
        private void ShowLoading(string message)
        {
            LoadingText.Text = message;
            LoadingOverlay.Visibility = Visibility.Visible;
        }

        /// <summary>
        /// Hide loading overlay
        /// </summary>
        private void HideLoading()
        {
            LoadingOverlay.Visibility = Visibility.Collapsed;
        }

        /// <summary>
        /// Update status text
        /// </summary>
        private void UpdateStatus(string message)
        {
            StatusTextBlock.Text = message;
        }

        /// <summary>
        /// Update material count display
        /// </summary>
        private void UpdateMaterialCount()
        {
            var count = _viewModel.Materials?.Count ?? 0;
            MaterialCountTextBlock.Text = $"{count} material{(count != 1 ? "s" : "")} found";
        }

        #endregion
    }
}
