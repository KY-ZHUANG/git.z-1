using AIHealthDiary.Data;
using AIHealthDiary.Models;

namespace AIHealthDiary.Services
{
    /// <summary>
    /// AI分析服务类，提供健康数据分析、建议生成和计划制定功能
    /// 当前使用基于规则的Mock实现，可替换为真实AI API调用
    /// </summary>
    public class AIAnalysisService
    {
        /// <summary>
        /// 数据库管理器实例，用于获取用户数据
        /// </summary>
        private readonly DatabaseManager _dbManager;

        /// <summary>
        /// OpenAI API密钥（用于真实AI调用）
        /// </summary>
        private readonly string? _apiKey;

        /// <summary>
        /// 是否使用真实AI API
        /// </summary>
        private readonly bool _useRealAI;

        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="dbManager">数据库管理器</param>
        /// <param name="apiKey">OpenAI API密钥（可选）</param>
        public AIAnalysisService(DatabaseManager dbManager, string? apiKey = null)
        {
            _dbManager = dbManager;
            _apiKey = apiKey;
            _useRealAI = !string.IsNullOrEmpty(apiKey);
        }

        #region 健康数据分析

        /// <summary>
        /// 分析用户健康数据并生成建议
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="days">分析最近多少天的数据</param>
        /// <returns>健康分析报告</returns>
        public HealthAnalysisReport AnalyzeHealthData(int userId, int days = 7)
        {
            var user = _dbManager.GetUserById(userId);
            if (user == null)
                throw new ArgumentException("用户不存在");

            var endDate = DateTime.Now;
            var startDate = endDate.AddDays(-days);

            // 获取各类数据
            var healthRecords = _dbManager.GetHealthRecords(userId, startDate, endDate);
            var diets = _dbManager.GetDietsByDateRange(userId, startDate, endDate);
            var exercises = _dbManager.GetExercisesByDateRange(userId, startDate, endDate);

            // 生成分析报告
            var report = new HealthAnalysisReport
            {
                UserId = userId,
                AnalysisDate = DateTime.Now,
                PeriodDays = days,
                OverallScore = CalculateOverallScore(user, healthRecords, diets, exercises),
                BMISummary = AnalyzeBMI(user),
                WeightTrend = AnalyzeWeightTrend(healthRecords),
                SleepAnalysis = AnalyzeSleep(healthRecords),
                BloodPressureAnalysis = AnalyzeBloodPressure(healthRecords),
                DietAnalysis = AnalyzeDiet(diets, user),
                ExerciseAnalysis = AnalyzeExercise(exercises, user),
                Recommendations = GenerateRecommendations(user, healthRecords, diets, exercises)
            };

            return report;
        }

        /// <summary>
        /// 分析BMI状况
        /// </summary>
        private BMISummary AnalyzeBMI(User user)
        {
            double bmi = user.CalculateBMI();
            string category = user.GetBMICategory();

            string suggestion = category switch
            {
                "偏瘦" => "您的体重偏轻，建议适当增加营养摄入，进行适量的力量训练来增加肌肉量。",
                "正常" => "恭喜！您的体重在健康范围内，请继续保持良好的生活习惯。",
                "偏胖" => "您的体重略高于标准，建议适当控制饮食热量，增加有氧运动。",
                "肥胖" => "您的体重已进入肥胖范围，建议制定科学的减重计划，必要时咨询专业医生。",
                _ => "请确保身高体重数据准确。"
            };

            double idealWeightMin = 18.5 * Math.Pow(user.Height / 100, 2);
            double idealWeightMax = 24 * Math.Pow(user.Height / 100, 2);

            return new BMISummary
            {
                CurrentBMI = bmi,
                Category = category,
                IdealWeightRange = $"{idealWeightMin:F1} - {idealWeightMax:F1} kg",
                Suggestion = suggestion
            };
        }

        /// <summary>
        /// 分析体重趋势
        /// </summary>
        private TrendAnalysis AnalyzeWeightTrend(List<HealthRecord> records)
        {
            if (records.Count < 2)
            {
                return new TrendAnalysis
                {
                    Trend = "数据不足",
                    ChangeAmount = 0,
                    Description = "需要至少2条记录才能分析趋势"
                };
            }

            var sortedRecords = records.OrderBy(r => r.RecordDate).ToList();
            double firstWeight = sortedRecords.First().Weight;
            double lastWeight = sortedRecords.Last().Weight;
            double change = lastWeight - firstWeight;

            string trend;
            string description;

            if (Math.Abs(change) < 0.5)
            {
                trend = "稳定";
                description = "您的体重保持稳定，这是健康的好迹象。";
            }
            else if (change > 0)
            {
                trend = "上升";
                description = $"您的体重增加了 {change:F1}kg，建议关注饮食控制和运动量。";
            }
            else
            {
                trend = "下降";
                description = $"您的体重减少了 {Math.Abs(change):F1}kg，请确保减重速度适中（每周0.5-1kg）。";
            }

            return new TrendAnalysis
            {
                Trend = trend,
                ChangeAmount = change,
                Description = description,
                AverageValue = records.Average(r => r.Weight)
            };
        }

        /// <summary>
        /// 分析睡眠质量
        /// </summary>
        private SleepAnalysis AnalyzeSleep(List<HealthRecord> records)
        {
            if (records.Count == 0)
            {
                return new SleepAnalysis
                {
                    AverageSleep = 0,
                    Quality = "无数据",
                    Suggestion = "请开始记录睡眠数据以获得分析。"
                };
            }

            double avgSleep = records.Average(r => r.SleepHours);
            string quality;
            string suggestion;

            switch (avgSleep)
            {
                case < 6:
                    quality = "不足";
                    suggestion = "您的睡眠时间不足，建议每晚保证7-8小时睡眠，建立规律的作息时间。";
                    break;
                case < 7:
                    quality = "偏少";
                    suggestion = "您的睡眠略少，建议适当提前就寝时间，改善睡眠环境。";
                    break;
                case <= 9:
                    quality = "良好";
                    suggestion = "您的睡眠时间很合适，请继续保持良好的睡眠习惯。";
                    break;
                default:
                    quality = "过多";
                    suggestion = "您的睡眠时间较长，如果白天仍感疲倦，建议检查睡眠质量。";
                    break;
            }

            return new SleepAnalysis
            {
                AverageSleep = avgSleep,
                Quality = quality,
                Suggestion = suggestion
            };
        }

        /// <summary>
        /// 分析血压状况
        /// </summary>
        private BloodPressureAnalysis AnalyzeBloodPressure(List<HealthRecord> records)
        {
            if (records.Count == 0)
            {
                return new BloodPressureAnalysis
                {
                    AverageSystolic = 0,
                    AverageDiastolic = 0,
                    Status = "无数据",
                    Suggestion = "请开始记录血压数据以获得分析。"
                };
            }

            int avgSys = (int)records.Average(r => r.SystolicPressure);
            int avgDia = (int)records.Average(r => r.DiastolicPressure);

            string status;
            string suggestion;

            if (avgSys < 90 || avgDia < 60)
            {
                status = "偏低";
                suggestion = "您的血压偏低，建议适当增加盐分摄入，避免突然起立，如有不适请咨询医生。";
            }
            else if (avgSys <= 120 && avgDia <= 80)
            {
                status = "正常";
                suggestion = "您的血压正常，请继续保持健康的生活方式。";
            }
            else if (avgSys <= 140 && avgDia <= 90)
            {
                status = "正常高值";
                suggestion = "您的血压处于正常高值，建议减少盐分摄入，增加运动，定期监测。";
            }
            else
            {
                status = "偏高";
                suggestion = "您的血压偏高，建议咨询医生，改善饮食习惯，控制体重，规律运动。";
            }

            return new BloodPressureAnalysis
            {
                AverageSystolic = avgSys,
                AverageDiastolic = avgDia,
                Status = status,
                Suggestion = suggestion
            };
        }

        /// <summary>
        /// 分析饮食状况
        /// </summary>
        private DietAnalysis AnalyzeDiet(List<Diet> diets, User user)
        {
            if (diets.Count == 0)
            {
                return new DietAnalysis
                {
                    AverageDailyCalories = 0,
                    Assessment = "无数据",
                    Suggestion = "请开始记录饮食数据以获得分析。"
                };
            }

            // 按日期分组计算日均热量
            var dailyCalories = diets
                .GroupBy(d => d.RecordDate.Date)
                .Select(g => g.Sum(d => d.Calories))
                .ToList();

            double avgDailyCalories = dailyCalories.Average();
            double bmr = user.CalculateBMR();
            double recommendedCalories = bmr * 1.2; // 假设轻度活动

            string assessment;
            string suggestion;

            double ratio = avgDailyCalories / recommendedCalories;

            if (ratio < 0.8)
            {
                assessment = "摄入不足";
                suggestion = $"您的日均摄入热量({avgDailyCalories:F0}千卡)低于推荐值({recommendedCalories:F0}千卡)，建议适当增加营养摄入。";
            }
            else if (ratio > 1.2)
            {
                assessment = "摄入过多";
                suggestion = $"您的日均摄入热量({avgDailyCalories:F0}千卡)超过推荐值({recommendedCalories:F0}千卡)，建议适当控制饮食。";
            }
            else
            {
                assessment = "摄入适中";
                suggestion = $"您的日均摄入热量({avgDailyCalories:F0}千卡)在合理范围内，请继续保持。";
            }

            // 计算营养素比例
            double totalProtein = diets.Sum(d => d.Protein);
            double totalCarbs = diets.Sum(d => d.Carbohydrates);
            double totalFat = diets.Sum(d => d.Fat);
            double totalNutrients = totalProtein + totalCarbs + totalFat;

            return new DietAnalysis
            {
                AverageDailyCalories = avgDailyCalories,
                RecommendedCalories = recommendedCalories,
                Assessment = assessment,
                Suggestion = suggestion,
                ProteinRatio = totalNutrients > 0 ? totalProtein / totalNutrients : 0,
                CarbsRatio = totalNutrients > 0 ? totalCarbs / totalNutrients : 0,
                FatRatio = totalNutrients > 0 ? totalFat / totalNutrients : 0
            };
        }

        /// <summary>
        /// 分析运动状况
        /// </summary>
        private ExerciseAnalysis AnalyzeExercise(List<Exercise> exercises, User user)
        {
            if (exercises.Count == 0)
            {
                return new ExerciseAnalysis
                {
                    TotalDuration = 0,
                    TotalCaloriesBurned = 0,
                    Frequency = "无数据",
                    Suggestion = "请开始记录运动数据以获得分析。建议每周至少150分钟中等强度运动。"
                };
            }

            int totalDuration = exercises.Sum(e => e.Duration);
            double totalCalories = exercises.Sum(e => e.CaloriesBurned);
            int activeDays = exercises.Select(e => e.RecordDate.Date).Distinct().Count();

            string frequency;
            string suggestion;

            if (activeDays < 2)
            {
                frequency = "不足";
                suggestion = "您的运动频率较低，建议每周至少进行3-5次运动，每次30分钟以上。";
            }
            else if (activeDays < 4)
            {
                frequency = "适中";
                suggestion = "您的运动频率适中，可以继续保持或适当增加运动强度。";
            }
            else
            {
                frequency = "良好";
                suggestion = "您的运动习惯很好，请继续保持！注意运动后的恢复和休息。";
            }

            return new ExerciseAnalysis
            {
                TotalDuration = totalDuration,
                TotalCaloriesBurned = totalCalories,
                ActiveDays = activeDays,
                Frequency = frequency,
                Suggestion = suggestion,
                AverageDurationPerSession = exercises.Count > 0 ? totalDuration / exercises.Count : 0
            };
        }

        /// <summary>
        /// 计算综合健康评分
        /// </summary>
        private int CalculateOverallScore(User user, List<HealthRecord> healthRecords, 
            List<Diet> diets, List<Exercise> exercises)
        {
            int score = 70; // 基础分

            // BMI评分
            double bmi = user.CalculateBMI();
            if (bmi >= 18.5 && bmi < 24) score += 10;
            else if (bmi >= 24 && bmi < 28) score += 5;
            else score += 2;

            // 数据记录完整性评分
            if (healthRecords.Count > 0) score += 5;
            if (diets.Count > 0) score += 5;
            if (exercises.Count > 0) score += 5;

            // 运动频率评分
            if (exercises.Count >= 3) score += 5;

            return Math.Min(100, score);
        }

        /// <summary>
        /// 生成综合建议
        /// </summary>
        private List<string> GenerateRecommendations(User user, List<HealthRecord> healthRecords,
            List<Diet> diets, List<Exercise> exercises)
        {
            var recommendations = new List<string>();

            // BMI相关建议
            double bmi = user.CalculateBMI();
            if (bmi >= 24)
            {
                recommendations.Add("减重建议：每周减重0.5-1kg为宜，通过控制饮食和增加运动实现。");
            }
            else if (bmi < 18.5)
            {
                recommendations.Add("增重建议：增加优质蛋白质摄入，配合力量训练增加肌肉量。");
            }

            // 运动建议
            if (exercises.Count < 3)
            {
                recommendations.Add("运动建议：建议每周至少进行150分钟中等强度有氧运动，如快走、游泳、骑车等。");
            }

            // 饮食建议
            if (diets.Count == 0)
            {
                recommendations.Add("饮食建议：开始记录每日饮食，有助于了解和控制热量摄入。");
            }

            // 睡眠建议
            if (healthRecords.Count > 0)
            {
                double avgSleep = healthRecords.Average(r => r.SleepHours);
                if (avgSleep < 7)
                {
                    recommendations.Add("睡眠建议：保证每晚7-8小时睡眠，建立规律的作息时间。");
                }
            }

            // 通用建议
            recommendations.Add("健康提醒：定期体检，保持积极心态，健康是一生的投资。");

            return recommendations;
        }

        #endregion

        #region 计划生成

        /// <summary>
        /// 生成个性化饮食计划
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="goal">目标（减重/维持/增重）</param>
        /// <returns>饮食计划</returns>
        public DietPlan GenerateDietPlan(int userId, string goal = "维持")
        {
            var user = _dbManager.GetUserById(userId);
            if (user == null)
                throw new ArgumentException("用户不存在");

            double bmr = user.CalculateBMR();
            double targetCalories = goal.ToLower() switch
            {
                "减重" or "lose" => bmr * 1.2 - 500,
                "增重" or "gain" => bmr * 1.2 + 500,
                _ => bmr * 1.2
            };

            var plan = new DietPlan
            {
                UserId = userId,
                Goal = goal,
                TargetCalories = targetCalories,
                DailyMeals = new List<DailyMealPlan>(),
                NutritionalGuidelines = GenerateNutritionalGuidelines(goal),
                Tips = GenerateDietTips(goal)
            };

            // 生成一周的示例餐单
            for (int i = 0; i < 7; i++)
            {
                plan.DailyMeals.Add(GenerateDailyMealPlan(targetCalories, i));
            }

            return plan;
        }

        /// <summary>
        /// 生成每日餐单
        /// </summary>
        private DailyMealPlan GenerateDailyMealPlan(double targetCalories, int dayIndex)
        {
            double breakfastRatio = 0.3;
            double lunchRatio = 0.4;
            double dinnerRatio = 0.3;

            var breakfastOptions = new[] { "燕麦粥配鸡蛋", "全麦面包配牛奶", "豆浆配包子", "酸奶配水果麦片" };
            var lunchOptions = new[] { "糙米饭配鸡胸肉和蔬菜", "全麦面条配瘦肉", "红薯配鱼肉和沙拉", "藜麦饭配牛肉" };
            var dinnerOptions = new[] { "蔬菜沙拉配豆腐", "蒸蛋配蔬菜", "清汤面配蔬菜", "烤蔬菜配鸡胸肉" };

            return new DailyMealPlan
            {
                DayOfWeek = $"第{dayIndex + 1}天",
                Breakfast = new MealDetail
                {
                    MealType = "早餐",
                    SuggestedFoods = breakfastOptions[dayIndex % breakfastOptions.Length],
                    TargetCalories = targetCalories * breakfastRatio,
                    NutritionFocus = "优质蛋白质和复合碳水化合物"
                },
                Lunch = new MealDetail
                {
                    MealType = "午餐",
                    SuggestedFoods = lunchOptions[dayIndex % lunchOptions.Length],
                    TargetCalories = targetCalories * lunchRatio,
                    NutritionFocus = "均衡营养，适量主食"
                },
                Dinner = new MealDetail
                {
                    MealType = "晚餐",
                    SuggestedFoods = dinnerOptions[dayIndex % dinnerOptions.Length],
                    TargetCalories = targetCalories * dinnerRatio,
                    NutritionFocus = "清淡易消化，控制主食"
                }
            };
        }

        /// <summary>
        /// 生成营养指南
        /// </summary>
        private List<string> GenerateNutritionalGuidelines(string goal)
        {
            var guidelines = new List<string>
            {
                "蛋白质：占总热量的15-20%，选择瘦肉、鱼、蛋、豆类",
                "碳水化合物：占总热量的50-60%，以复合碳水为主",
                "脂肪：占总热量的20-30%，选择健康脂肪来源",
                "膳食纤维：每日25-30克，多吃蔬菜水果",
                "水分：每日饮水1500-2000毫升"
            };

            if (goal.ToLower() == "减重")
            {
                guidelines.Add("控制总热量，创造热量缺口，但不要低于基础代谢率");
            }

            return guidelines;
        }

        /// <summary>
        /// 生成饮食建议
        /// </summary>
        private List<string> GenerateDietTips(string goal)
        {
            var tips = new List<string>
            {
                "细嚼慢咽，每餐用时20-30分钟",
                "餐前喝一杯水，有助于控制食量",
                "少吃加工食品，多吃天然食物",
                "控制盐分摄入，每日不超过6克",
                "规律进餐，避免暴饮暴食"
            };

            return tips;
        }

        /// <summary>
        /// 生成运动计划
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="level">运动水平（初级/中级/高级）</param>
        /// <returns>运动计划</returns>
        public ExercisePlan GenerateExercisePlan(int userId, string level = "初级")
        {
            var user = _dbManager.GetUserById(userId);
            if (user == null)
                throw new ArgumentException("用户不存在");

            var plan = new ExercisePlan
            {
                UserId = userId,
                Level = level,
                WeeklySchedule = GenerateWeeklySchedule(level),
                WarmUpGuidelines = "运动前5-10分钟热身，如慢走、关节活动",
                CoolDownGuidelines = "运动后5-10分钟放松，如拉伸、慢走",
                SafetyTips = GenerateExerciseSafetyTips()
            };

            return plan;
        }

        /// <summary>
        /// 生成每周运动安排
        /// </summary>
        private List<DailyExercisePlan> GenerateWeeklySchedule(string level)
        {
            var schedule = new List<DailyExercisePlan>();

            int duration = level.ToLower() switch
            {
                "初级" => 30,
                "中级" => 45,
                _ => 60
            };

            // 周一：有氧运动
            schedule.Add(new DailyExercisePlan
            {
                Day = "周一",
                Focus = "有氧运动",
                Exercises = new List<ExerciseItem>
                {
                    new() { Name = "快走或慢跑", Duration = duration, Intensity = "中" },
                    new() { Name = "拉伸放松", Duration = 10, Intensity = "低" }
                }
            });

            // 周二：力量训练
            schedule.Add(new DailyExercisePlan
            {
                Day = "周二",
                Focus = "力量训练",
                Exercises = new List<ExerciseItem>
                {
                    new() { Name = "深蹲", Duration = 15, Intensity = "中" },
                    new() { Name = "俯卧撑", Duration = 15, Intensity = "中" },
                    new() { Name = "平板支撑", Duration = 10, Intensity = "中" },
                    new() { Name = "拉伸", Duration = 10, Intensity = "低" }
                }
            });

            // 周三：休息或轻度活动
            schedule.Add(new DailyExercisePlan
            {
                Day = "周三",
                Focus = "休息恢复",
                Exercises = new List<ExerciseItem>
                {
                    new() { Name = "散步", Duration = 30, Intensity = "低" },
                    new() { Name = "轻度拉伸", Duration = 15, Intensity = "低" }
                }
            });

            // 周四：有氧运动
            schedule.Add(new DailyExercisePlan
            {
                Day = "周四",
                Focus = "有氧运动",
                Exercises = new List<ExerciseItem>
                {
                    new() { Name = "游泳或骑车", Duration = duration, Intensity = "中" },
                    new() { Name = "拉伸放松", Duration = 10, Intensity = "低" }
                }
            });

            // 周五：力量训练
            schedule.Add(new DailyExercisePlan
            {
                Day = "周五",
                Focus = "力量训练",
                Exercises = new List<ExerciseItem>
                {
                    new() { Name = "哑铃训练", Duration = 20, Intensity = "中" },
                    new() { Name = "核心训练", Duration = 20, Intensity = "中" },
                    new() { Name = "拉伸", Duration = 10, Intensity = "低" }
                }
            });

            // 周六：户外活动
            schedule.Add(new DailyExercisePlan
            {
                Day = "周六",
                Focus = "户外活动",
                Exercises = new List<ExerciseItem>
                {
                    new() { Name = "徒步或登山", Duration = 60, Intensity = "中" },
                    new() { Name = "放松活动", Duration = 15, Intensity = "低" }
                }
            });

            // 周日：休息
            schedule.Add(new DailyExercisePlan
            {
                Day = "周日",
                Focus = "完全休息",
                Exercises = new List<ExerciseItem>
                {
                    new() { Name = "瑜伽或冥想", Duration = 30, Intensity = "低" }
                }
            });

            return schedule;
        }

        /// <summary>
        /// 生成运动安全提示
        /// </summary>
        private List<string> GenerateExerciseSafetyTips()
        {
            return new List<string>
            {
                "运动前进行健康检查，了解自身身体状况",
                "循序渐进，不要突然增加运动强度",
                "注意身体信号，如有不适立即停止",
                "保持充足的水分补充",
                "穿着合适的运动装备",
                "避免空腹或饭后立即运动"
            };
        }

        #endregion

        #region 周报生成

        /// <summary>
        /// 生成健康周报
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <returns>健康周报</returns>
        public WeeklyReport GenerateWeeklyReport(int userId)
        {
            var endDate = DateTime.Now;
            var startDate = endDate.AddDays(-7);

            var user = _dbManager.GetUserById(userId);
            var healthRecords = _dbManager.GetHealthRecords(userId, startDate, endDate);
            var diets = _dbManager.GetDietsByDateRange(userId, startDate, endDate);
            var exercises = _dbManager.GetExercisesByDateRange(userId, startDate, endDate);

            var report = new WeeklyReport
            {
                UserId = userId,
                WeekStartDate = startDate,
                WeekEndDate = endDate,
                Summary = GenerateWeekSummary(user, healthRecords, diets, exercises),
                Highlights = GenerateWeekHighlights(healthRecords, diets, exercises),
                Improvements = GenerateImprovementAreas(healthRecords, diets, exercises),
                NextWeekGoals = GenerateNextWeekGoals(healthRecords, diets, exercises),
                Statistics = GenerateWeekStatistics(healthRecords, diets, exercises)
            };

            return report;
        }

        /// <summary>
        /// 生成周总结
        /// </summary>
        private string GenerateWeekSummary(User? user, List<HealthRecord> healthRecords, 
            List<Diet> diets, List<Exercise> exercises)
        {
            var parts = new List<string>();

            parts.Add($"本周您记录了{healthRecords.Count}条健康数据、{diets.Count}条饮食记录、{exercises.Count}条运动记录。");

            if (healthRecords.Count > 0)
            {
                double avgWeight = healthRecords.Average(r => r.Weight);
                double avgSleep = healthRecords.Average(r => r.SleepHours);
                parts.Add($"平均体重{avgWeight:F1}kg，平均睡眠{avgSleep:F1}小时。");
            }

            if (exercises.Count > 0)
            {
                int totalDuration = exercises.Sum(e => e.Duration);
                parts.Add($"本周运动总时长{totalDuration}分钟。");
            }

            return string.Join("", parts);
        }

        /// <summary>
        /// 生成本周亮点
        /// </summary>
        private List<string> GenerateWeekHighlights(List<HealthRecord> healthRecords, 
            List<Diet> diets, List<Exercise> exercises)
        {
            var highlights = new List<string>();

            if (healthRecords.Count >= 5)
                highlights.Add("坚持记录健康数据，习惯养成良好！");

            if (exercises.Count >= 3)
                highlights.Add("本周运动频率达标，继续保持！");

            if (diets.Count >= 10)
                highlights.Add("认真记录饮食，有助于健康管理！");

            if (healthRecords.Count > 1)
            {
                var sorted = healthRecords.OrderBy(r => r.RecordDate).ToList();
                if (sorted.Last().Weight < sorted.First().Weight)
                    highlights.Add("体重呈下降趋势，减重效果显著！");
            }

            if (highlights.Count == 0)
                highlights.Add("开始记录是健康的第一步，继续加油！");

            return highlights;
        }

        /// <summary>
        /// 生成改进建议
        /// </summary>
        private List<string> GenerateImprovementAreas(List<HealthRecord> healthRecords, 
            List<Diet> diets, List<Exercise> exercises)
        {
            var improvements = new List<string>();

            if (healthRecords.Count < 5)
                improvements.Add("建议每天记录健康数据，有助于追踪健康趋势。");

            if (exercises.Count < 3)
                improvements.Add("建议增加运动频率，每周至少运动3-5次。");

            if (diets.Count < 10)
                improvements.Add("建议详细记录每日饮食，了解营养摄入情况。");

            if (healthRecords.Count > 0)
            {
                double avgSleep = healthRecords.Average(r => r.SleepHours);
                if (avgSleep < 7)
                    improvements.Add("睡眠时间偏少，建议保证每晚7-8小时睡眠。");
            }

            return improvements;
        }

        /// <summary>
        /// 生成下周目标
        /// </summary>
        private List<string> GenerateNextWeekGoals(List<HealthRecord> healthRecords, 
            List<Diet> diets, List<Exercise> exercises)
        {
            var goals = new List<string>();

            goals.Add("每天记录体重和睡眠数据");
            goals.Add("每周运动至少150分钟");
            goals.Add("记录每日三餐饮食");
            goals.Add("保证每晚7-8小时睡眠");
            goals.Add("每天饮水1500-2000毫升");

            return goals;
        }

        /// <summary>
        /// 生成周统计数据
        /// </summary>
        private WeekStatistics GenerateWeekStatistics(List<HealthRecord> healthRecords, 
            List<Diet> diets, List<Exercise> exercises)
        {
            return new WeekStatistics
            {
                RecordCount = healthRecords.Count,
                AverageWeight = healthRecords.Count > 0 ? healthRecords.Average(r => r.Weight) : 0,
                AverageSleep = healthRecords.Count > 0 ? healthRecords.Average(r => r.SleepHours) : 0,
                TotalExerciseMinutes = exercises.Sum(e => e.Duration),
                TotalCaloriesBurned = exercises.Sum(e => e.CaloriesBurned),
                AverageDailyCalories = diets.Count > 0 ? 
                    diets.GroupBy(d => d.RecordDate.Date).Average(g => g.Sum(d => d.Calories)) : 0,
                ActiveDays = exercises.Select(e => e.RecordDate.Date).Distinct().Count()
            };
        }

        #endregion
    }

    #region 报告类定义

    /// <summary>
    /// 健康分析报告
    /// </summary>
    public class HealthAnalysisReport
    {
        public int UserId { get; set; }
        public DateTime AnalysisDate { get; set; }
        public int PeriodDays { get; set; }
        public int OverallScore { get; set; }
        public BMISummary BMISummary { get; set; } = new();
        public TrendAnalysis WeightTrend { get; set; } = new();
        public SleepAnalysis SleepAnalysis { get; set; } = new();
        public BloodPressureAnalysis BloodPressureAnalysis { get; set; } = new();
        public DietAnalysis DietAnalysis { get; set; } = new();
        public ExerciseAnalysis ExerciseAnalysis { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
    }

    public class BMISummary
    {
        public double CurrentBMI { get; set; }
        public string Category { get; set; } = string.Empty;
        public string IdealWeightRange { get; set; } = string.Empty;
        public string Suggestion { get; set; } = string.Empty;
    }

    public class TrendAnalysis
    {
        public string Trend { get; set; } = string.Empty;
        public double ChangeAmount { get; set; }
        public string Description { get; set; } = string.Empty;
        public double AverageValue { get; set; }
    }

    public class SleepAnalysis
    {
        public double AverageSleep { get; set; }
        public string Quality { get; set; } = string.Empty;
        public string Suggestion { get; set; } = string.Empty;
    }

    public class BloodPressureAnalysis
    {
        public int AverageSystolic { get; set; }
        public int AverageDiastolic { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Suggestion { get; set; } = string.Empty;
    }

    public class DietAnalysis
    {
        public double AverageDailyCalories { get; set; }
        public double RecommendedCalories { get; set; }
        public string Assessment { get; set; } = string.Empty;
        public string Suggestion { get; set; } = string.Empty;
        public double ProteinRatio { get; set; }
        public double CarbsRatio { get; set; }
        public double FatRatio { get; set; }
    }

    public class ExerciseAnalysis
    {
        public int TotalDuration { get; set; }
        public double TotalCaloriesBurned { get; set; }
        public int ActiveDays { get; set; }
        public string Frequency { get; set; } = string.Empty;
        public string Suggestion { get; set; } = string.Empty;
        public double AverageDurationPerSession { get; set; }
    }

    /// <summary>
    /// 饮食计划
    /// </summary>
    public class DietPlan
    {
        public int UserId { get; set; }
        public string Goal { get; set; } = string.Empty;
        public double TargetCalories { get; set; }
        public List<DailyMealPlan> DailyMeals { get; set; } = new();
        public List<string> NutritionalGuidelines { get; set; } = new();
        public List<string> Tips { get; set; } = new();
    }

    public class DailyMealPlan
    {
        public string DayOfWeek { get; set; } = string.Empty;
        public MealDetail Breakfast { get; set; } = new();
        public MealDetail Lunch { get; set; } = new();
        public MealDetail Dinner { get; set; } = new();
    }

    public class MealDetail
    {
        public string MealType { get; set; } = string.Empty;
        public string SuggestedFoods { get; set; } = string.Empty;
        public double TargetCalories { get; set; }
        public string NutritionFocus { get; set; } = string.Empty;
    }

    /// <summary>
    /// 运动计划
    /// </summary>
    public class ExercisePlan
    {
        public int UserId { get; set; }
        public string Level { get; set; } = string.Empty;
        public List<DailyExercisePlan> WeeklySchedule { get; set; } = new();
        public string WarmUpGuidelines { get; set; } = string.Empty;
        public string CoolDownGuidelines { get; set; } = string.Empty;
        public List<string> SafetyTips { get; set; } = new();
    }

    public class DailyExercisePlan
    {
        public string Day { get; set; } = string.Empty;
        public string Focus { get; set; } = string.Empty;
        public List<ExerciseItem> Exercises { get; set; } = new();
    }

    public class ExerciseItem
    {
        public string Name { get; set; } = string.Empty;
        public int Duration { get; set; }
        public string Intensity { get; set; } = string.Empty;
    }

    /// <summary>
    /// 健康周报
    /// </summary>
    public class WeeklyReport
    {
        public int UserId { get; set; }
        public DateTime WeekStartDate { get; set; }
        public DateTime WeekEndDate { get; set; }
        public string Summary { get; set; } = string.Empty;
        public List<string> Highlights { get; set; } = new();
        public List<string> Improvements { get; set; } = new();
        public List<string> NextWeekGoals { get; set; } = new();
        public WeekStatistics Statistics { get; set; } = new();
    }

    public class WeekStatistics
    {
        public int RecordCount { get; set; }
        public double AverageWeight { get; set; }
        public double AverageSleep { get; set; }
        public int TotalExerciseMinutes { get; set; }
        public double TotalCaloriesBurned { get; set; }
        public double AverageDailyCalories { get; set; }
        public int ActiveDays { get; set; }
    }

    #endregion
}
