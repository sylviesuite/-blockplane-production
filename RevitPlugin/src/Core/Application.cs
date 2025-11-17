using System;
using System.Reflection;
using System.Windows.Media.Imaging;
using Autodesk.Revit.UI;
using Serilog;
using BlockPlane.RevitPlugin.Services;

namespace BlockPlane.RevitPlugin
{
    /// <summary>
    /// Main application entry point for BlockPlane Revit Plugin
    /// Implements IExternalApplication to integrate with Revit's lifecycle
    /// </summary>
    public class Application : IExternalApplication
    {
        private static readonly string AssemblyPath = Assembly.GetExecutingAssembly().Location;
        private static readonly string AssemblyDirectory = System.IO.Path.GetDirectoryName(AssemblyPath);
        
        // Singleton instance
        public static Application Instance { get; private set; }
        
        public static ILogger Logger { get; private set; }
        
        // Service instances
        public BlockPlaneAPIClient ApiClient { get; private set; }
        public CacheService CacheService { get; private set; }
        public MaterialService MaterialService { get; private set; }
        public ProjectService ProjectService { get; private set; }
        public SwapService SwapService { get; private set; }
        
        /// <summary>
        /// Called when Revit starts up
        /// </summary>
        public Result OnStartup(UIControlledApplication application)
        {
            try
            {
                // Set singleton instance
                Instance = this;
                
                // Initialize logging
                InitializeLogging();
                Logger.Information("BlockPlane plugin starting up...");
                
                // Initialize services
                InitializeServices();
                
                // Create ribbon tab and panel
                CreateRibbonPanel(application);
                
                Logger.Information("BlockPlane plugin startup complete");
                return Result.Succeeded;
            }
            catch (Exception ex)
            {
                Logger?.Error(ex, "Failed to start BlockPlane plugin");
                TaskDialog.Show("BlockPlane Error", 
                    $"Failed to start BlockPlane plugin:\n{ex.Message}");
                return Result.Failed;
            }
        }
        
        /// <summary>
        /// Called when Revit shuts down
        /// </summary>
        public Result OnShutdown(UIControlledApplication application)
        {
            try
            {
                Logger.Information("BlockPlane plugin shutting down...");
                
                // Cleanup services
                CleanupServices();
                
                // Clear singleton
                Instance = null;
                
                Logger.Information("BlockPlane plugin shutdown complete");
                Log.CloseAndFlush();
                
                return Result.Succeeded;
            }
            catch (Exception ex)
            {
                Logger?.Error(ex, "Error during BlockPlane plugin shutdown");
                return Result.Failed;
            }
        }
        
        /// <summary>
        /// Initialize Serilog logging to file
        /// </summary>
        private void InitializeLogging()
        {
            var logPath = System.IO.Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "BlockPlane", "Logs", "blockplane-.log"
            );
            
            Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .WriteTo.File(
                    logPath,
                    rollingInterval: RollingInterval.Day,
                    retainedFileCountLimit: 30,
                    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
                )
                .WriteTo.Console()
                .CreateLogger();
            
            Log.Logger = Logger;
        }
        
        /// <summary>
        /// Create BlockPlane ribbon tab and buttons
        /// </summary>
        private void CreateRibbonPanel(UIControlledApplication app)
        {
            // Create "BlockPlane" tab
            string tabName = "BlockPlane";
            try
            {
                app.CreateRibbonTab(tabName);
            }
            catch (Autodesk.Revit.Exceptions.ArgumentException)
            {
                // Tab already exists, ignore
            }
            
            // Create "Materials" panel
            RibbonPanel panel = app.CreateRibbonPanel(tabName, "Materials");
            
            // Add "Material Browser" button
            AddPushButton(
                panel,
                "MaterialBrowser",
                "Material\nBrowser",
                "BlockPlane.RevitPlugin.Commands.BrowserCommand",
                "Open the BlockPlane material database browser",
                "pack://application:,,,/BlockPlane.RevitPlugin;component/Resources/Icons/browser.png"
            );
            
            // Add "Carbon Calculator" button
            AddPushButton(
                panel,
                "CarbonCalculator",
                "Carbon\nCalculator",
                "BlockPlane.RevitPlugin.Commands.CalculatorCommand",
                "Calculate project carbon footprint",
                "pack://application:,,,/BlockPlane.RevitPlugin;component/Resources/Icons/calculator.png"
            );
            
            panel.AddSeparator();
            
            // Add "Swap Material" button
            AddPushButton(
                panel,
                "SwapMaterial",
                "Swap\nMaterial",
                "BlockPlane.RevitPlugin.Commands.SwapCommand",
                "Replace material with sustainable alternative",
                "pack://application:,,,/BlockPlane.RevitPlugin;component/Resources/Icons/swap.png"
            );
            
            panel.AddSeparator();
            
            // Add "Settings" button
            AddPushButton(
                panel,
                "Settings",
                "Settings",
                "BlockPlane.RevitPlugin.Commands.SettingsCommand",
                "Configure BlockPlane plugin settings",
                "pack://application:,,,/BlockPlane.RevitPlugin;component/Resources/Icons/settings.png"
            );
        }
        
        /// <summary>
        /// Helper method to add a push button to a ribbon panel
        /// </summary>
        private void AddPushButton(
            RibbonPanel panel,
            string name,
            string text,
            string className,
            string tooltip,
            string iconPath)
        {
            PushButtonData buttonData = new PushButtonData(
                name,
                text,
                AssemblyPath,
                className
            );
            
            buttonData.ToolTip = tooltip;
            buttonData.LargeImage = new BitmapImage(new Uri(iconPath, UriKind.Absolute));
            
            PushButton button = panel.AddItem(buttonData) as PushButton;
        }
        
        /// <summary>
        /// Initialize all service instances
        /// </summary>
        private void InitializeServices()
        {
            try
            {
                Logger.Information("Initializing services...");
                
                // Get API base URL from settings
                string apiBaseUrl = Properties.Settings.Default.ApiBaseUrl;
                
                // Initialize services in dependency order
                ApiClient = new BlockPlaneAPIClient(apiBaseUrl, Logger);
                CacheService = new CacheService(Logger);
                MaterialService = new MaterialService(ApiClient, CacheService, Logger);
                ProjectService = new ProjectService(MaterialService, Logger);
                SwapService = new SwapService(CacheService, Logger);
                
                Logger.Information("Services initialized successfully");
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "Failed to initialize services");
                throw;
            }
        }
        
        /// <summary>
        /// Cleanup all service instances
        /// </summary>
        private void CleanupServices()
        {
            try
            {
                Logger.Information("Cleaning up services...");
                
                // Dispose services that implement IDisposable
                CacheService?.Dispose();
                
                // Clear references
                SwapService = null;
                ProjectService = null;
                MaterialService = null;
                CacheService = null;
                ApiClient = null;
                
                Logger.Information("Services cleaned up successfully");
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "Error during service cleanup");
            }
        }
    }
}
