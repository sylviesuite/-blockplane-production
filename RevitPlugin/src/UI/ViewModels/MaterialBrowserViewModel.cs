using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using BlockPlane.RevitPlugin.Models;
using BlockPlane.RevitPlugin.Services;

namespace BlockPlane.RevitPlugin.UI.ViewModels
{
    /// <summary>
    /// ViewModel for Material Browser Window implementing MVVM pattern
    /// </summary>
    public class MaterialBrowserViewModel : INotifyPropertyChanged
    {
        private readonly MaterialService _materialService;
        private List<Material> _allMaterials;
        private bool _isInitialized;

        #region Properties

        private ObservableCollection<Material> _materials;
        public ObservableCollection<Material> Materials
        {
            get => _materials;
            set
            {
                _materials = value;
                OnPropertyChanged();
            }
        }

        private Material _selectedMaterial;
        public Material SelectedMaterial
        {
            get => _selectedMaterial;
            set
            {
                _selectedMaterial = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(HasSelectedMaterial));
            }
        }

        public bool HasSelectedMaterial => SelectedMaterial != null;

        private string _searchQuery;
        public string SearchQuery
        {
            get => _searchQuery;
            set
            {
                _searchQuery = value;
                OnPropertyChanged();
            }
        }

        private string _selectedCategory;
        public string SelectedCategory
        {
            get => _selectedCategory;
            set
            {
                _selectedCategory = value;
                OnPropertyChanged();
            }
        }

        private string _minRIS;
        public string MinRIS
        {
            get => _minRIS;
            set
            {
                _minRIS = value;
                OnPropertyChanged();
            }
        }

        private string _maxCarbon;
        public string MaxCarbon
        {
            get => _maxCarbon;
            set
            {
                _maxCarbon = value;
                OnPropertyChanged();
            }
        }

        private bool _regenerativeOnly;
        public bool RegenerativeOnly
        {
            get => _regenerativeOnly;
            set
            {
                _regenerativeOnly = value;
                OnPropertyChanged();
            }
        }

        public bool IsInitialized => _isInitialized;

        #endregion

        public MaterialBrowserViewModel(MaterialService materialService)
        {
            _materialService = materialService ?? throw new ArgumentNullException(nameof(materialService));
            _materials = new ObservableCollection<Material>();
            _allMaterials = new List<Material>();
            _selectedCategory = "All Categories";
            _isInitialized = false;
        }

        /// <summary>
        /// Load all materials from cache or API
        /// </summary>
        public async Task LoadMaterialsAsync()
        {
            try
            {
                var materials = await _materialService.GetAllMaterialsAsync();
                _allMaterials = materials?.ToList() ?? new List<Material>();
                
                Materials = new ObservableCollection<Material>(_allMaterials);
                _isInitialized = true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to load materials: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Search materials with current query
        /// </summary>
        public async Task SearchMaterialsAsync()
        {
            if (string.IsNullOrWhiteSpace(SearchQuery))
            {
                await LoadMaterialsAsync();
                await ApplyFiltersAsync();
                return;
            }

            try
            {
                var results = await _materialService.SearchMaterialsAsync(SearchQuery);
                _allMaterials = results?.ToList() ?? new List<Material>();
                
                await ApplyFiltersAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Search failed: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Apply current filters to materials list
        /// </summary>
        public async Task ApplyFiltersAsync()
        {
            await Task.Run(() =>
            {
                var filtered = _allMaterials.AsEnumerable();

                // Category filter
                if (!string.IsNullOrEmpty(SelectedCategory) && SelectedCategory != "All Categories")
                {
                    filtered = filtered.Where(m => 
                        m.Category?.Equals(SelectedCategory, StringComparison.OrdinalIgnoreCase) == true
                    );
                }

                // Min RIS filter
                if (!string.IsNullOrWhiteSpace(MinRIS) && int.TryParse(MinRIS, out int minRis))
                {
                    filtered = filtered.Where(m => m.RisScore >= minRis);
                }

                // Max Carbon filter
                if (!string.IsNullOrWhiteSpace(MaxCarbon) && double.TryParse(MaxCarbon, out double maxCarbon))
                {
                    filtered = filtered.Where(m => m.TotalCarbon <= maxCarbon);
                }

                // Regenerative only filter
                if (RegenerativeOnly)
                {
                    filtered = filtered.Where(m => m.IsRegenerative);
                }

                var filteredList = filtered.ToList();

                // Update UI on main thread
                System.Windows.Application.Current.Dispatcher.Invoke(() =>
                {
                    Materials = new ObservableCollection<Material>(filteredList);
                });
            });
        }

        /// <summary>
        /// Refresh materials from API (bypass cache)
        /// </summary>
        public async Task RefreshMaterialsAsync()
        {
            try
            {
                // Force refresh from API
                var materials = await _materialService.GetAllMaterialsAsync(forceRefresh: true);
                _allMaterials = materials?.ToList() ?? new List<Material>();
                
                await ApplyFiltersAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to refresh materials: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Clear all filters
        /// </summary>
        public void ClearFilters()
        {
            SearchQuery = string.Empty;
            SelectedCategory = "All Categories";
            MinRIS = string.Empty;
            MaxCarbon = string.Empty;
            RegenerativeOnly = false;
        }

        /// <summary>
        /// Update selection state
        /// </summary>
        public void UpdateSelection()
        {
            OnPropertyChanged(nameof(HasSelectedMaterial));
        }

        #region INotifyPropertyChanged

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        #endregion
    }
}
