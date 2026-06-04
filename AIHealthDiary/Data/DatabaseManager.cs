using System.Data;
using System.Data.SQLite;
using AIHealthDiary.Models;

namespace AIHealthDiary.Data
{
    /// <summary>
    /// 数据库管理类，负责数据库连接、初始化和所有CRUD操作
    /// 使用SQLite作为本地数据库
    /// </summary>
    public class DatabaseManager : IDisposable
    {
        /// <summary>
        /// SQLite数据库连接对象
        /// </summary>
        private readonly SQLiteConnection _connection;

        /// <summary>
        /// 数据库文件路径
        /// </summary>
        private readonly string _databasePath;

        /// <summary>
        /// 构造函数，初始化数据库连接
        /// </summary>
        /// <param name="dbPath">数据库文件路径，默认为应用程序目录下的health_diary.db</param>
        public DatabaseManager(string? dbPath = null)
        {
            // 如果未指定路径，使用应用程序目录
            _databasePath = dbPath ?? Path.Combine(
                AppDomain.CurrentDomain.BaseDirectory, 
                "health_diary.db"
            );

            // 创建连接字符串
            string connectionString = $"Data Source={_databasePath};Version=3;";
            _connection = new SQLiteConnection(connectionString);
            _connection.Open();

            // 初始化数据库表结构
            InitializeDatabase();
        }

        /// <summary>
        /// 初始化数据库，创建所需的表结构
        /// </summary>
        private void InitializeDatabase()
        {
            // 创建用户表
            string createUserTable = @"
                CREATE TABLE IF NOT EXISTS Users (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Name TEXT NOT NULL,
                    Gender TEXT NOT NULL,
                    Age INTEGER NOT NULL,
                    Height REAL NOT NULL,
                    Weight REAL NOT NULL,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )";
            ExecuteNonQuery(createUserTable);

            // 创建健康记录表
            string createHealthRecordTable = @"
                CREATE TABLE IF NOT EXISTS HealthRecords (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    UserId INTEGER NOT NULL,
                    RecordDate DATE NOT NULL,
                    Weight REAL NOT NULL,
                    SleepHours REAL NOT NULL,
                    SystolicPressure INTEGER NOT NULL,
                    DiastolicPressure INTEGER NOT NULL,
                    HeartRate INTEGER NOT NULL,
                    Notes TEXT,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (UserId) REFERENCES Users(Id)
                )";
            ExecuteNonQuery(createHealthRecordTable);

            // 创建饮食记录表
            string createDietTable = @"
                CREATE TABLE IF NOT EXISTS Diets (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    UserId INTEGER NOT NULL,
                    RecordDate DATE NOT NULL,
                    MealType TEXT NOT NULL,
                    FoodName TEXT NOT NULL,
                    Portion REAL NOT NULL,
                    Calories REAL NOT NULL,
                    Protein REAL NOT NULL,
                    Carbohydrates REAL NOT NULL,
                    Fat REAL NOT NULL,
                    Fiber REAL NOT NULL,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (UserId) REFERENCES Users(Id)
                )";
            ExecuteNonQuery(createDietTable);

            // 创建运动记录表
            string createExerciseTable = @"
                CREATE TABLE IF NOT EXISTS Exercises (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    UserId INTEGER NOT NULL,
                    RecordDate DATE NOT NULL,
                    ExerciseName TEXT NOT NULL,
                    ExerciseType TEXT NOT NULL,
                    Duration INTEGER NOT NULL,
                    CaloriesBurned REAL NOT NULL,
                    Intensity TEXT NOT NULL,
                    HeartRate INTEGER,
                    Notes TEXT,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (UserId) REFERENCES Users(Id)
                )";
            ExecuteNonQuery(createExerciseTable);
        }

        /// <summary>
        /// 执行非查询SQL语句
        /// </summary>
        /// <param name="sql">SQL语句</param>
        /// <param name="parameters">SQL参数</param>
        /// <returns>受影响的行数</returns>
        private int ExecuteNonQuery(string sql, params SQLiteParameter[] parameters)
        {
            using var command = new SQLiteCommand(sql, _connection);
            command.Parameters.AddRange(parameters);
            return command.ExecuteNonQuery();
        }

        #region 用户管理操作

        /// <summary>
        /// 添加新用户
        /// </summary>
        /// <param name="user">用户对象</param>
        /// <returns>新用户的ID</returns>
        public int AddUser(User user)
        {
            string sql = @"
                INSERT INTO Users (Name, Gender, Age, Height, Weight, CreatedAt)
                VALUES (@Name, @Gender, @Age, @Height, @Weight, @CreatedAt);
                SELECT last_insert_rowid();";

            using var command = new SQLiteCommand(sql, _connection);
            command.Parameters.AddWithValue("@Name", user.Name);
            command.Parameters.AddWithValue("@Gender", user.Gender);
            command.Parameters.AddWithValue("@Age", user.Age);
            command.Parameters.AddWithValue("@Height", user.Height);
            command.Parameters.AddWithValue("@Weight", user.Weight);
            command.Parameters.AddWithValue("@CreatedAt", DateTime.Now);

            var result = command.ExecuteScalar();
            return Convert.ToInt32(result);
        }

        /// <summary>
        /// 更新用户信息
        /// </summary>
        /// <param name="user">用户对象</param>
        /// <returns>是否更新成功</returns>
        public bool UpdateUser(User user)
        {
            string sql = @"
                UPDATE Users 
                SET Name = @Name, Gender = @Gender, Age = @Age, 
                    Height = @Height, Weight = @Weight
                WHERE Id = @Id";

            int rowsAffected = ExecuteNonQuery(sql,
                new SQLiteParameter("@Name", user.Name),
                new SQLiteParameter("@Gender", user.Gender),
                new SQLiteParameter("@Age", user.Age),
                new SQLiteParameter("@Height", user.Height),
                new SQLiteParameter("@Weight", user.Weight),
                new SQLiteParameter("@Id", user.Id)
            );

            return rowsAffected > 0;
        }

        /// <summary>
        /// 删除用户及其所有相关数据
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <returns>是否删除成功</returns>
        public bool DeleteUser(int userId)
        {
            using var transaction = _connection.BeginTransaction();
            try
            {
                // 删除相关记录
                ExecuteNonQuery("DELETE FROM HealthRecords WHERE UserId = @UserId",
                    new SQLiteParameter("@UserId", userId));
                ExecuteNonQuery("DELETE FROM Diets WHERE UserId = @UserId",
                    new SQLiteParameter("@UserId", userId));
                ExecuteNonQuery("DELETE FROM Exercises WHERE UserId = @UserId",
                    new SQLiteParameter("@UserId", userId));

                // 删除用户
                int rowsAffected = ExecuteNonQuery("DELETE FROM Users WHERE Id = @Id",
                    new SQLiteParameter("@Id", userId));

                transaction.Commit();
                return rowsAffected > 0;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        /// <summary>
        /// 获取所有用户列表
        /// </summary>
        /// <returns>用户列表</returns>
        public List<User> GetAllUsers()
        {
            var users = new List<User>();
            string sql = "SELECT * FROM Users ORDER BY CreatedAt DESC";

            using var command = new SQLiteCommand(sql, _connection);
            using var reader = command.ExecuteReader();

            while (reader.Read())
            {
                users.Add(MapUserFromReader(reader));
            }

            return users;
        }

        /// <summary>
        /// 根据ID获取用户
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <returns>用户对象，未找到返回null</returns>
        public User? GetUserById(int userId)
        {
            string sql = "SELECT * FROM Users WHERE Id = @Id";

            using var command = new SQLiteCommand(sql, _connection);
            command.Parameters.AddWithValue("@Id", userId);
            using var reader = command.ExecuteReader();

            if (reader.Read())
            {
                return MapUserFromReader(reader);
            }

            return null;
        }

        /// <summary>
        /// 从DataReader映射用户对象
        /// </summary>
        /// <param name="reader">SQLiteDataReader对象</param>
        /// <returns>用户对象</returns>
        private User MapUserFromReader(SQLiteDataReader reader)
        {
            return new User
            {
                Id = reader.GetInt32(0),
                Name = reader.GetString(1),
                Gender = reader.GetString(2),
                Age = reader.GetInt32(3),
                Height = reader.GetDouble(4),
                Weight = reader.GetDouble(5),
                CreatedAt = reader.GetDateTime(6)
            };
        }

        #endregion

        #region 健康记录操作

        /// <summary>
        /// 添加健康记录
        /// </summary>
        /// <param name="record">健康记录对象</param>
        /// <returns>新记录的ID</returns>
        public int AddHealthRecord(HealthRecord record)
        {
            string sql = @"
                INSERT INTO HealthRecords (UserId, RecordDate, Weight, SleepHours, 
                    SystolicPressure, DiastolicPressure, HeartRate, Notes, CreatedAt)
                VALUES (@UserId, @RecordDate, @Weight, @SleepHours, @SystolicPressure, 
                    @DiastolicPressure, @HeartRate, @Notes, @CreatedAt);
                SELECT last_insert_rowid();";

            using var command = new SQLiteCommand(sql, _connection);
            command.Parameters.AddWithValue("@UserId", record.UserId);
            command.Parameters.AddWithValue("@RecordDate", record.RecordDate);
            command.Parameters.AddWithValue("@Weight", record.Weight);
            command.Parameters.AddWithValue("@SleepHours", record.SleepHours);
            command.Parameters.AddWithValue("@SystolicPressure", record.SystolicPressure);
            command.Parameters.AddWithValue("@DiastolicPressure", record.DiastolicPressure);
            command.Parameters.AddWithValue("@HeartRate", record.HeartRate);
            command.Parameters.AddWithValue("@Notes", record.Notes ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@CreatedAt", DateTime.Now);

            var result = command.ExecuteScalar();
            return Convert.ToInt32(result);
        }

        /// <summary>
        /// 获取用户的健康记录列表
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="startDate">开始日期（可选）</param>
        /// <param name="endDate">结束日期（可选）</param>
        /// <returns>健康记录列表</returns>
        public List<HealthRecord> GetHealthRecords(int userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var records = new List<HealthRecord>();
            string sql = "SELECT * FROM HealthRecords WHERE UserId = @UserId";

            if (startDate.HasValue)
                sql += " AND RecordDate >= @StartDate";
            if (endDate.HasValue)
                sql += " AND RecordDate <= @EndDate";

            sql += " ORDER BY RecordDate DESC";

            using var command = new SQLiteCommand(sql, _connection);
            command.Parameters.AddWithValue("@UserId", userId);
            if (startDate.HasValue)
                command.Parameters.AddWithValue("@StartDate", startDate.Value);
            if (endDate.HasValue)
                command.Parameters.AddWithValue("@EndDate", endDate.Value);

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                records.Add(MapHealthRecordFromReader(reader));
            }

            return records;
        }

        /// <summary>
        /// 从DataReader映射健康记录对象
        /// </summary>
        private HealthRecord MapHealthRecordFromReader(SQLiteDataReader reader)
        {
            return new HealthRecord
            {
                Id = reader.GetInt32(0),
                UserId = reader.GetInt32(1),
                RecordDate = reader.GetDateTime(2),
                Weight = reader.GetDouble(3),
                SleepHours = reader.GetDouble(4),
                SystolicPressure = reader.GetInt32(5),
                DiastolicPressure = reader.GetInt32(6),
                HeartRate = reader.GetInt32(7),
                Notes = reader.IsDBNull(8) ? null : reader.GetString(8),
                CreatedAt = reader.GetDateTime(9)
            };
        }

        #endregion

        #region 饮食记录操作

        /// <summary>
        /// 添加饮食记录
        /// </summary>
        /// <param name="diet">饮食记录对象</param>
        /// <returns>新记录的ID</returns>
        public int AddDiet(Diet diet)
        {
            string sql = @"
                INSERT INTO Diets (UserId, RecordDate, MealType, FoodName, Portion, 
                    Calories, Protein, Carbohydrates, Fat, Fiber, CreatedAt)
                VALUES (@UserId, @RecordDate, @MealType, @FoodName, @Portion, @Calories, 
                    @Protein, @Carbohydrates, @Fat, @Fiber, @CreatedAt);
                SELECT last_insert_rowid();";

            using var command = new SQLiteCommand(sql, _connection);
            command.Parameters.AddWithValue("@UserId", diet.UserId);
            command.Parameters.AddWithValue("@RecordDate", diet.RecordDate);
            command.Parameters.AddWithValue("@MealType", diet.MealType);
            command.Parameters.AddWithValue("@FoodName", diet.FoodName);
            command.Parameters.AddWithValue("@Portion", diet.Portion);
            command.Parameters.AddWithValue("@Calories", diet.Calories);
            command.Parameters.AddWithValue("@Protein", diet.Protein);
            command.Parameters.AddWithValue("@Carbohydrates", diet.Carbohydrates);
            command.Parameters.AddWithValue("@Fat", diet.Fat);
            command.Parameters.AddWithValue("@Fiber", diet.Fiber);
            command.Parameters.AddWithValue("@CreatedAt", DateTime.Now);

            var result = command.ExecuteScalar();
            return Convert.ToInt32(result);
        }

        /// <summary>
        /// 获取用户的饮食记录
        /// </summary>
        public List<Diet> GetDiets(int userId, DateTime? date = null)
        {
            var diets = new List<Diet>();
            string sql = "SELECT * FROM Diets WHERE UserId = @UserId";

            if (date.HasValue)
                sql += " AND RecordDate = @Date";

            sql += " ORDER BY RecordDate DESC";

            using var command = new SQLiteCommand(sql, _connection);
            command.Parameters.AddWithValue("@UserId", userId);
            if (date.HasValue)
                command.Parameters.AddWithValue("@Date", date.Value.Date);

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                diets.Add(MapDietFromReader(reader));
            }

            return diets;
        }

        /// <summary>
        /// 获取指定日期范围内的饮食记录
        /// </summary>
        public List<Diet> GetDietsByDateRange(int userId, DateTime startDate, DateTime endDate)
        {
            var diets = new List<Diet>();
            string sql = @"
                SELECT * FROM Diets 
                WHERE UserId = @UserId 
                AND RecordDate BETWEEN @StartDate AND @EndDate
                ORDER BY RecordDate DESC";

            using var command = new SQLiteCommand(sql, _connection);
            command.Parameters.AddWithValue("@UserId", userId);
            command.Parameters.AddWithValue("@StartDate", startDate.Date);
            command.Parameters.AddWithValue("@EndDate", endDate.Date);

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                diets.Add(MapDietFromReader(reader));
            }

            return diets;
        }

        /// <summary>
        /// 删除饮食记录
        /// </summary>
        /// <param name="dietId">饮食记录ID</param>
        /// <returns>是否删除成功</returns>
        public bool DeleteDiet(int dietId)
        {
            string sql = "DELETE FROM Diets WHERE Id = @Id";
            int rowsAffected = ExecuteNonQuery(sql, new SQLiteParameter("@Id", dietId));
            return rowsAffected > 0;
        }

        private Diet MapDietFromReader(SQLiteDataReader reader)
        {
            return new Diet
            {
                Id = reader.GetInt32(0),
                UserId = reader.GetInt32(1),
                RecordDate = reader.GetDateTime(2),
                MealType = reader.GetString(3),
                FoodName = reader.GetString(4),
                Portion = reader.GetDouble(5),
                Calories = reader.GetDouble(6),
                Protein = reader.GetDouble(7),
                Carbohydrates = reader.GetDouble(8),
                Fat = reader.GetDouble(9),
                Fiber = reader.GetDouble(10),
                CreatedAt = reader.GetDateTime(11)
            };
        }

        #endregion

        #region 运动记录操作

        /// <summary>
        /// 添加运动记录
        /// </summary>
        /// <param name="exercise">运动记录对象</param>
        /// <returns>新记录的ID</returns>
        public int AddExercise(Exercise exercise)
        {
            string sql = @"
                INSERT INTO Exercises (UserId, RecordDate, ExerciseName, ExerciseType, 
                    Duration, CaloriesBurned, Intensity, HeartRate, Notes, CreatedAt)
                VALUES (@UserId, @RecordDate, @ExerciseName, @ExerciseType, @Duration, 
                    @CaloriesBurned, @Intensity, @HeartRate, @Notes, @CreatedAt);
                SELECT last_insert_rowid();";

            using var command = new SQLiteCommand(sql, _connection);
            command.Parameters.AddWithValue("@UserId", exercise.UserId);
            command.Parameters.AddWithValue("@RecordDate", exercise.RecordDate);
            command.Parameters.AddWithValue("@ExerciseName", exercise.ExerciseName);
            command.Parameters.AddWithValue("@ExerciseType", exercise.ExerciseType);
            command.Parameters.AddWithValue("@Duration", exercise.Duration);
            command.Parameters.AddWithValue("@CaloriesBurned", exercise.CaloriesBurned);
            command.Parameters.AddWithValue("@Intensity", exercise.Intensity);
            command.Parameters.AddWithValue("@HeartRate", exercise.HeartRate ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@Notes", exercise.Notes ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@CreatedAt", DateTime.Now);

            var result = command.ExecuteScalar();
            return Convert.ToInt32(result);
        }

        /// <summary>
        /// 获取用户的运动记录
        /// </summary>
        public List<Exercise> GetExercises(int userId, DateTime? date = null)
        {
            var exercises = new List<Exercise>();
            string sql = "SELECT * FROM Exercises WHERE UserId = @UserId";

            if (date.HasValue)
                sql += " AND RecordDate = @Date";

            sql += " ORDER BY RecordDate DESC";

            using var command = new SQLiteCommand(sql, _connection);
            command.Parameters.AddWithValue("@UserId", userId);
            if (date.HasValue)
                command.Parameters.AddWithValue("@Date", date.Value.Date);

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                exercises.Add(MapExerciseFromReader(reader));
            }

            return exercises;
        }

        /// <summary>
        /// 获取指定日期范围内的运动记录
        /// </summary>
        public List<Exercise> GetExercisesByDateRange(int userId, DateTime startDate, DateTime endDate)
        {
            var exercises = new List<Exercise>();
            string sql = @"
                SELECT * FROM Exercises 
                WHERE UserId = @UserId 
                AND RecordDate BETWEEN @StartDate AND @EndDate
                ORDER BY RecordDate DESC";

            using var command = new SQLiteCommand(sql, _connection);
            command.Parameters.AddWithValue("@UserId", userId);
            command.Parameters.AddWithValue("@StartDate", startDate.Date);
            command.Parameters.AddWithValue("@EndDate", endDate.Date);

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                exercises.Add(MapExerciseFromReader(reader));
            }

            return exercises;
        }

        /// <summary>
        /// 删除运动记录
        /// </summary>
        public bool DeleteExercise(int exerciseId)
        {
            string sql = "DELETE FROM Exercises WHERE Id = @Id";
            int rowsAffected = ExecuteNonQuery(sql, new SQLiteParameter("@Id", exerciseId));
            return rowsAffected > 0;
        }

        private Exercise MapExerciseFromReader(SQLiteDataReader reader)
        {
            return new Exercise
            {
                Id = reader.GetInt32(0),
                UserId = reader.GetInt32(1),
                RecordDate = reader.GetDateTime(2),
                ExerciseName = reader.GetString(3),
                ExerciseType = reader.GetString(4),
                Duration = reader.GetInt32(5),
                CaloriesBurned = reader.GetDouble(6),
                Intensity = reader.GetString(7),
                HeartRate = reader.IsDBNull(8) ? null : reader.GetInt32(8),
                Notes = reader.IsDBNull(9) ? null : reader.GetString(9),
                CreatedAt = reader.GetDateTime(10)
            };
        }

        #endregion

        /// <summary>
        /// 释放数据库连接资源
        /// </summary>
        public void Dispose()
        {
            _connection?.Close();
            _connection?.Dispose();
        }
    }
}
