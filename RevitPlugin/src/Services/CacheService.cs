using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SQLite;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using BlockPlane.RevitPlugin.Models;
using Newtonsoft.Json;
using Serilog;

namespace BlockPlane.RevitPlugin.Services
{
    /// <summary>
    /// Service for managing local SQLite cache
    /// Provides offline access to materials and project data
    /// </summary>
    public class CacheService
    {
        private readonly string _connectionString;
        private readonly ILogger _logger;
        
        private const string DATABASE_FILE = "blockplane_cache.db";
        
        public CacheService()
        {
            _logger = Log.ForContext<CacheService>();
            
            // Store database in AppData
            string appDataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "BlockPlane"
            );
            
            Directory.CreateDirectory(appDataPath);
            
            string dbPath = Path.Combine(appDataPath, DATABASE_FILE);
            _connectionString = $"Data Source={dbPath};Version=3;";
            
            InitializeDatabase();
        }
        
        /// <summary>
        /// Initialize database schema
        /// </summary>
        private void InitializeDatabase()
        {
            try
            {
                using (var connection = new SQLiteConnection(_connectionString))
                {
                    connection.Open();
                    
                    string createTablesSQL = @"
                        CREATE TABLE IF NOT EXISTS materials (
                            id INTEGER PRIMARY KEY,
                            name TEXT NOT NULL,
                            category TEXT NOT NULL,
                            description TEXT,
                            carbon_a1_a3 REAL NOT NULL,
                            carbon_a4 REAL NOT NULL,
                            carbon_a5 REAL NOT NULL,
                            carbon_b REAL NOT NULL,
                            carbon_c1_c4 REAL NOT NULL,
                            ris_score INTEGER NOT NULL,
                            lis_score INTEGER NOT NULL,
                            cost_per_unit REAL NOT NULL,
                            functional_unit TEXT NOT NULL,
                            epd_source TEXT,
                            epd_date TEXT,
                            manufacturer TEXT,
                            last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                        
                        CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
                        CREATE INDEX IF NOT EXISTS idx_materials_ris ON materials(ris_score);
                        CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);
                        
                        CREATE TABLE IF NOT EXISTS project_materials (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            revit_material_id TEXT NOT NULL,
                            revit_material_name TEXT NOT NULL,
                            blockplane_material_id INTEGER,
                            quantity REAL,
                            unit TEXT,
                            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (blockplane_material_id) REFERENCES materials(id)
                        );
                        
                        CREATE INDEX IF NOT EXISTS idx_project_materials_revit_id ON project_materials(revit_material_id);
                        
                        CREATE TABLE IF NOT EXISTS swap_history (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            project_id TEXT,
                            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            from_material_id INTEGER,
                            to_material_id INTEGER,
                            element_count INTEGER,
                            carbon_savings REAL,
                            user_name TEXT,
                            FOREIGN KEY (from_material_id) REFERENCES materials(id),
                            FOREIGN KEY (to_material_id) REFERENCES materials(id)
                        );
                        
                        CREATE INDEX IF NOT EXISTS idx_swap_history_timestamp ON swap_history(timestamp);
                    ";
                    
                    using (var command = new SQLiteCommand(createTablesSQL, connection))
                    {
                        command.ExecuteNonQuery();
                    }
                    
                    _logger.Information("Database initialized successfully");
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to initialize database");
                throw;
            }
        }
        
        /// <summary>
        /// Save materials to cache
        /// </summary>
        public async Task SaveMaterialsAsync(List<Material> materials)
        {
            try
            {
                using (var connection = new SQLiteConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    
                    using (var transaction = connection.BeginTransaction())
                    {
                        // Clear existing materials
                        using (var deleteCmd = new SQLiteCommand("DELETE FROM materials", connection, transaction))
                        {
                            await deleteCmd.ExecuteNonQueryAsync();
                        }
                        
                        // Insert new materials
                        string insertSQL = @"
                            INSERT INTO materials (
                                id, name, category, description,
                                carbon_a1_a3, carbon_a4, carbon_a5, carbon_b, carbon_c1_c4,
                                ris_score, lis_score, cost_per_unit, functional_unit,
                                epd_source, epd_date, manufacturer, last_synced
                            ) VALUES (
                                @id, @name, @category, @description,
                                @carbon_a1_a3, @carbon_a4, @carbon_a5, @carbon_b, @carbon_c1_c4,
                                @ris_score, @lis_score, @cost_per_unit, @functional_unit,
                                @epd_source, @epd_date, @manufacturer, @last_synced
                            )
                        ";
                        
                        foreach (var material in materials)
                        {
                            using (var cmd = new SQLiteCommand(insertSQL, connection, transaction))
                            {
                                cmd.Parameters.AddWithValue("@id", material.Id);
                                cmd.Parameters.AddWithValue("@name", material.Name);
                                cmd.Parameters.AddWithValue("@category", material.Category);
                                cmd.Parameters.AddWithValue("@description", material.Description ?? (object)DBNull.Value);
                                cmd.Parameters.AddWithValue("@carbon_a1_a3", material.CarbonA1A3);
                                cmd.Parameters.AddWithValue("@carbon_a4", material.CarbonA4);
                                cmd.Parameters.AddWithValue("@carbon_a5", material.CarbonA5);
                                cmd.Parameters.AddWithValue("@carbon_b", material.CarbonB);
                                cmd.Parameters.AddWithValue("@carbon_c1_c4", material.CarbonC1C4);
                                cmd.Parameters.AddWithValue("@ris_score", material.RisScore);
                                cmd.Parameters.AddWithValue("@lis_score", material.LisScore);
                                cmd.Parameters.AddWithValue("@cost_per_unit", material.CostPerUnit);
                                cmd.Parameters.AddWithValue("@functional_unit", material.FunctionalUnit);
                                cmd.Parameters.AddWithValue("@epd_source", material.EpdSource ?? (object)DBNull.Value);
                                cmd.Parameters.AddWithValue("@epd_date", material.EpdDate?.ToString("yyyy-MM-dd") ?? (object)DBNull.Value);
                                cmd.Parameters.AddWithValue("@manufacturer", material.Manufacturer ?? (object)DBNull.Value);
                                cmd.Parameters.AddWithValue("@last_synced", DateTime.Now);
                                
                                await cmd.ExecuteNonQueryAsync();
                            }
                        }
                        
                        transaction.Commit();
                    }
                    
                    _logger.Information("Saved {Count} materials to cache", materials.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to save materials to cache");
                throw;
            }
        }
        
        /// <summary>
        /// Get all materials from cache
        /// </summary>
        public async Task<List<Material>> GetMaterialsAsync()
        {
            try
            {
                var materials = new List<Material>();
                
                using (var connection = new SQLiteConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    
                    string selectSQL = "SELECT * FROM materials ORDER BY name";
                    
                    using (var command = new SQLiteCommand(selectSQL, connection))
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            materials.Add(MaterialFromReader(reader));
                        }
                    }
                }
                
                _logger.Debug("Retrieved {Count} materials from cache", materials.Count);
                return materials;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to get materials from cache");
                return new List<Material>();
            }
        }
        
        /// <summary>
        /// Get a single material by ID from cache
        /// </summary>
        public async Task<Material?> GetMaterialByIdAsync(int id)
        {
            try
            {
                using (var connection = new SQLiteConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    
                    string selectSQL = "SELECT * FROM materials WHERE id = @id";
                    
                    using (var command = new SQLiteCommand(selectSQL, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);
                        
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                return MaterialFromReader(reader);
                            }
                        }
                    }
                }
                
                return null;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to get material {MaterialId} from cache", id);
                return null;
            }
        }
        
        /// <summary>
        /// Save project material assignment
        /// </summary>
        public async Task SaveProjectMaterialAsync(string revitMaterialId, string revitMaterialName, 
            int? blockplaneMaterialId, double quantity, string unit)
        {
            try
            {
                using (var connection = new SQLiteConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    
                    string upsertSQL = @"
                        INSERT OR REPLACE INTO project_materials (
                            revit_material_id, revit_material_name, blockplane_material_id, 
                            quantity, unit, last_updated
                        ) VALUES (
                            @revit_material_id, @revit_material_name, @blockplane_material_id,
                            @quantity, @unit, @last_updated
                        )
                    ";
                    
                    using (var command = new SQLiteCommand(upsertSQL, connection))
                    {
                        command.Parameters.AddWithValue("@revit_material_id", revitMaterialId);
                        command.Parameters.AddWithValue("@revit_material_name", revitMaterialName);
                        command.Parameters.AddWithValue("@blockplane_material_id", blockplaneMaterialId ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@quantity", quantity);
                        command.Parameters.AddWithValue("@unit", unit);
                        command.Parameters.AddWithValue("@last_updated", DateTime.Now);
                        
                        await command.ExecuteNonQueryAsync();
                    }
                }
                
                _logger.Debug("Saved project material: {RevitMaterialName}", revitMaterialName);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to save project material");
                throw;
            }
        }
        
        /// <summary>
        /// Log a material swap to history
        /// </summary>
        public async Task LogSwapAsync(string projectId, int fromMaterialId, int toMaterialId, 
            int elementCount, double carbonSavings, string userName)
        {
            try
            {
                using (var connection = new SQLiteConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    
                    string insertSQL = @"
                        INSERT INTO swap_history (
                            project_id, timestamp, from_material_id, to_material_id,
                            element_count, carbon_savings, user_name
                        ) VALUES (
                            @project_id, @timestamp, @from_material_id, @to_material_id,
                            @element_count, @carbon_savings, @user_name
                        )
                    ";
                    
                    using (var command = new SQLiteCommand(insertSQL, connection))
                    {
                        command.Parameters.AddWithValue("@project_id", projectId);
                        command.Parameters.AddWithValue("@timestamp", DateTime.Now);
                        command.Parameters.AddWithValue("@from_material_id", fromMaterialId);
                        command.Parameters.AddWithValue("@to_material_id", toMaterialId);
                        command.Parameters.AddWithValue("@element_count", elementCount);
                        command.Parameters.AddWithValue("@carbon_savings", carbonSavings);
                        command.Parameters.AddWithValue("@user_name", userName);
                        
                        await command.ExecuteNonQueryAsync();
                    }
                }
                
                _logger.Information("Logged swap: {FromId} → {ToId}, saved {CarbonSavings:F1} kg CO₂", 
                    fromMaterialId, toMaterialId, carbonSavings);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to log swap");
                // Don't throw - logging failure shouldn't break the swap
            }
        }
        
        /// <summary>
        /// Get swap history for reporting
        /// </summary>
        public async Task<List<SwapHistoryEntry>> GetSwapHistoryAsync(int limit = 100)
        {
            try
            {
                var history = new List<SwapHistoryEntry>();
                
                using (var connection = new SQLiteConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    
                    string selectSQL = @"
                        SELECT 
                            sh.*,
                            m1.name as from_material_name,
                            m2.name as to_material_name
                        FROM swap_history sh
                        LEFT JOIN materials m1 ON sh.from_material_id = m1.id
                        LEFT JOIN materials m2 ON sh.to_material_id = m2.id
                        ORDER BY sh.timestamp DESC
                        LIMIT @limit
                    ";
                    
                    using (var command = new SQLiteCommand(selectSQL, connection))
                    {
                        command.Parameters.AddWithValue("@limit", limit);
                        
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                history.Add(new SwapHistoryEntry
                                {
                                    Id = reader.GetInt32(0),
                                    ProjectId = reader.GetString(1),
                                    Timestamp = reader.GetDateTime(2),
                                    FromMaterialId = reader.GetInt32(3),
                                    ToMaterialId = reader.GetInt32(4),
                                    ElementCount = reader.GetInt32(5),
                                    CarbonSavings = reader.GetDouble(6),
                                    UserName = reader.GetString(7),
                                    FromMaterialName = reader.IsDBNull(8) ? null : reader.GetString(8),
                                    ToMaterialName = reader.IsDBNull(9) ? null : reader.GetString(9)
                                });
                            }
                        }
                    }
                }
                
                return history;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to get swap history");
                return new List<SwapHistoryEntry>();
            }
        }
        
        /// <summary>
        /// Clear all cached data
        /// </summary>
        public async Task ClearCacheAsync()
        {
            try
            {
                using (var connection = new SQLiteConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    
                    using (var command = new SQLiteCommand("DELETE FROM materials", connection))
                    {
                        await command.ExecuteNonQueryAsync();
                    }
                }
                
                _logger.Information("Cache cleared");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to clear cache");
                throw;
            }
        }
        
        /// <summary>
        /// Helper to create Material object from SQLite reader
        /// </summary>
        private Material MaterialFromReader(IDataReader reader)
        {
            return new Material
            {
                Id = reader.GetInt32(reader.GetOrdinal("id")),
                Name = reader.GetString(reader.GetOrdinal("name")),
                Category = reader.GetString(reader.GetOrdinal("category")),
                Description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
                CarbonA1A3 = reader.GetDouble(reader.GetOrdinal("carbon_a1_a3")),
                CarbonA4 = reader.GetDouble(reader.GetOrdinal("carbon_a4")),
                CarbonA5 = reader.GetDouble(reader.GetOrdinal("carbon_a5")),
                CarbonB = reader.GetDouble(reader.GetOrdinal("carbon_b")),
                CarbonC1C4 = reader.GetDouble(reader.GetOrdinal("carbon_c1_c4")),
                RisScore = reader.GetInt32(reader.GetOrdinal("ris_score")),
                LisScore = reader.GetInt32(reader.GetOrdinal("lis_score")),
                CostPerUnit = reader.GetDouble(reader.GetOrdinal("cost_per_unit")),
                FunctionalUnit = reader.GetString(reader.GetOrdinal("functional_unit")),
                EpdSource = reader.IsDBNull(reader.GetOrdinal("epd_source")) ? null : reader.GetString(reader.GetOrdinal("epd_source")),
                EpdDate = reader.IsDBNull(reader.GetOrdinal("epd_date")) ? null : DateTime.Parse(reader.GetString(reader.GetOrdinal("epd_date"))),
                Manufacturer = reader.IsDBNull(reader.GetOrdinal("manufacturer")) ? null : reader.GetString(reader.GetOrdinal("manufacturer"))
            };
        }
    }
    
    /// <summary>
    /// Swap history entry for reporting
    /// </summary>
    public class SwapHistoryEntry
    {
        public int Id { get; set; }
        public string ProjectId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public int FromMaterialId { get; set; }
        public int ToMaterialId { get; set; }
        public int ElementCount { get; set; }
        public double CarbonSavings { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? FromMaterialName { get; set; }
        public string? ToMaterialName { get; set; }
    }
}
