using AIHealthDiary.Data;
using AIHealthDiary.Models;
using AIHealthDiary.Services;

namespace AIHealthDiary.Controls
{
    /// <summary>
    /// AI分析控件，提供健康分析、计划生成等功能
    /// </summary>
    public partial class AIAnalysisControl : UserControl
    {
        /// <summary>
        /// 数据库管理器实例
        /// </summary>
        private readonly DatabaseManager _dbManager;

        /// <summary>
        /// AI分析服务实例
        /// </summary>
        private readonly AIAnalysisService _aiService;

        /// <summary>
        /// 当前用户ID
        /// </summary>
        private readonly int _userId;

        /// <summary>
        /// 结果显示文本框
        /// </summary>
        private TextBox _txtResult = null!;

        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="dbManager">数据库管理器</param>
        /// <param name="userId">用户ID</param>
        public AIAnalysisControl(DatabaseManager dbManager, int userId)
        {
            _dbManager = dbManager;
            _userId = userId;
            _aiService = new AIAnalysisService(dbManager);
            InitializeComponent();
        }

        /// <summary>
        /// 初始化控件布局
        /// </summary>
        private void InitializeComponent()
        {
            this.BackColor = Color.FromArgb(245, 247, 250);
            this.Dock = DockStyle.Fill;

            // 创建主布局
            var splitContainer = new SplitContainer
            {
                Dock = DockStyle.Fill,
                Orientation = Orientation.Vertical,
                SplitterDistance = 280,
                Panel1MinSize = 250,
                Panel2MinSize = 600
            };

            // 左侧：功能按钮面板
            var leftPanel = CreateButtonPanel();
            splitContainer.Panel1.Controls.Add(leftPanel);

            // 右侧：结果显示面板
            var rightPanel = CreateResultPanel();
            splitContainer.Panel2.Controls.Add(rightPanel);

            this.Controls.Add(splitContainer);
        }

        /// <summary>
        /// 创建功能按钮面板
        /// </summary>
        private Panel CreateButtonPanel()
        {
            var panel = new Panel
            {
                Dock = DockStyle.Fill,
                Padding = new Padding(20),
                BackColor = Color.White
            };

            var titleLabel = new Label
            {
                Text = "AI 功能",
                Font = new Font("Microsoft YaHei", 14F, FontStyle.Bold),
                Dock = DockStyle.Top,
                Height = 40
            };
            panel.Controls.Add(titleLabel);

            var buttonPanel = new FlowLayoutPanel
            {
                Dock = DockStyle.Fill,
                FlowDirection = FlowDirection.TopDown,
                Padding = new Padding(0, 20, 0, 0),
                AutoScroll = true
            };

            // 健康分析按钮
            var btnHealthAnalysis = CreateFeatureButton("健康数据分析", Color.FromArgb(156, 39, 176));
            btnHealthAnalysis.Click += BtnHealthAnalysis_Click;
            buttonPanel.Controls.Add(btnHealthAnalysis);

            // 饮食计划按钮
            var btnDietPlan = CreateFeatureButton("生成饮食计划", Color.FromArgb(255, 152, 0));
            btnDietPlan.Click += BtnDietPlan_Click;
            buttonPanel.Controls.Add(btnDietPlan);

            // 运动计划按钮
            var btnExercisePlan = CreateFeatureButton("生成运动计划", Color.FromArgb(63, 81, 181));
            btnExercisePlan.Click += BtnExercisePlan_Click;
            buttonPanel.Controls.Add(btnExercisePlan);

            // 周报按钮
            var btnWeeklyReport = CreateFeatureButton("生成健康周报", Color.FromArgb(0, 150, 136));
            btnWeeklyReport.Click += BtnWeeklyReport_Click;
            buttonPanel.Controls.Add(btnWeeklyReport);

            panel.Controls.Add(buttonPanel);

            return panel;
        }

        /// <summary>
        /// 创建功能按钮
        /// </summary>
        private Button CreateFeatureButton(string text, Color color)
        {
            var btn = new Button
            {
                Text = text,
                Size = new Size(250, 50),
                Margin = new Padding(0, 0, 0, 15),
                FlatStyle = FlatStyle.Flat,
                BackColor = color,
                ForeColor = Color.White,
                Font = new Font("Microsoft YaHei", 12F)
            };
            btn.FlatAppearance.BorderSize = 0;
            return btn;
        }

        /// <summary>
        /// 创建结果显示面板
        /// </summary>
        private Panel CreateResultPanel()
        {
            var panel = new Panel
            {
                Dock = DockStyle.Fill,
                Padding = new Padding(20),
                BackColor = Color.White
            };

            var titleLabel = new Label
            {
                Text = "分析结果",
                Font = new Font("Microsoft YaHei", 14F, FontStyle.Bold),
                Dock = DockStyle.Top,
                Height = 40
            };
            panel.Controls.Add(titleLabel);

            _txtResult = new TextBox
            {
                Dock = DockStyle.Fill,
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                Font = new Font("Microsoft YaHei", 10F),
                BackColor = Color.FromArgb(250, 250, 250),
                BorderStyle = BorderStyle.FixedSingle,
                ReadOnly = true
            };
            panel.Controls.Add(_txtResult);

            return panel;
        }

        /// <summary>
        /// 健康数据分析按钮点击事件
        /// </summary>
        private void BtnHealthAnalysis_Click(object? sender, EventArgs e)
        {
            try
            {
                _txtResult.Text = "正在分析健康数据，请稍候...";
                Application.DoEvents();

                var report = _aiService.AnalyzeHealthData(_userId, 7);

                var sb = new System.Text.StringBuilder();
                sb.AppendLine("=".PadRight(50, '='));
                sb.AppendLine("健康数据分析报告");
                sb.AppendLine("=".PadRight(50, '='));
                sb.AppendLine();
                sb.AppendLine($"分析日期：{report.AnalysisDate:yyyy-MM-dd HH:mm}");
                sb.AppendLine($"分析周期：最近 {report.PeriodDays} 天");
                sb.AppendLine($"综合健康评分：{report.OverallScore}/100");
                sb.AppendLine();

                sb.AppendLine("【BMI 分析】");
                sb.AppendLine($"当前 BMI：{report.BMISummary.CurrentBMI:F1}");
                sb.AppendLine($"分类：{report.BMISummary.Category}");
                sb.AppendLine($"理想体重范围：{report.BMISummary.IdealWeightRange}");
                sb.AppendLine($"建议：{report.BMISummary.Suggestion}");
                sb.AppendLine();

                sb.AppendLine("【体重趋势】");
                sb.AppendLine($"趋势：{report.WeightTrend.Trend}");
                sb.AppendLine($"变化量：{report.WeightTrend.ChangeAmount:F1} kg");
                sb.AppendLine($"说明：{report.WeightTrend.Description}");
                sb.AppendLine();

                sb.AppendLine("【睡眠分析】");
                sb.AppendLine($"平均睡眠：{report.SleepAnalysis.AverageSleep:F1} 小时");
                sb.AppendLine($"质量评价：{report.SleepAnalysis.Quality}");
                sb.AppendLine($"建议：{report.SleepAnalysis.Suggestion}");
                sb.AppendLine();

                sb.AppendLine("【血压分析】");
                sb.AppendLine($"平均收缩压：{report.BloodPressureAnalysis.AverageSystolic} mmHg");
                sb.AppendLine($"平均舒张压：{report.BloodPressureAnalysis.AverageDiastolic} mmHg");
                sb.AppendLine($"状态：{report.BloodPressureAnalysis.Status}");
                sb.AppendLine($"建议：{report.BloodPressureAnalysis.Suggestion}");
                sb.AppendLine();

                sb.AppendLine("【饮食分析】");
                sb.AppendLine($"日均热量：{report.DietAnalysis.AverageDailyCalories:F0} 千卡");
                sb.AppendLine($"推荐热量：{report.DietAnalysis.RecommendedCalories:F0} 千卡");
                sb.AppendLine($"评估：{report.DietAnalysis.Assessment}");
                sb.AppendLine($"建议：{report.DietAnalysis.Suggestion}");
                sb.AppendLine();

                sb.AppendLine("【运动分析】");
                sb.AppendLine($"总运动时长：{report.ExerciseAnalysis.TotalDuration} 分钟");
                sb.AppendLine($"总消耗热量：{report.ExerciseAnalysis.TotalCaloriesBurned:F0} 千卡");
                sb.AppendLine($"活跃天数：{report.ExerciseAnalysis.ActiveDays} 天");
                sb.AppendLine($"频率评价：{report.ExerciseAnalysis.Frequency}");
                sb.AppendLine($"建议：{report.ExerciseAnalysis.Suggestion}");
                sb.AppendLine();

                sb.AppendLine("【综合建议】");
                foreach (var recommendation in report.Recommendations)
                {
                    sb.AppendLine($"• {recommendation}");
                }

                _txtResult.Text = sb.ToString();
            }
            catch (Exception ex)
            {
                _txtResult.Text = $"分析失败：{ex.Message}";
            }
        }

        /// <summary>
        /// 饮食计划按钮点击事件
        /// </summary>
        private void BtnDietPlan_Click(object? sender, EventArgs e)
        {
            try
            {
                _txtResult.Text = "正在生成饮食计划，请稍候...";
                Application.DoEvents();

                var plan = _aiService.GenerateDietPlan(_userId, "维持");

                var sb = new System.Text.StringBuilder();
                sb.AppendLine("=".PadRight(50, '='));
                sb.AppendLine("个性化饮食计划");
                sb.AppendLine("=".PadRight(50, '='));
                sb.AppendLine();
                sb.AppendLine($"目标：{plan.Goal}");
                sb.AppendLine($"目标热量：{plan.TargetCalories:F0} 千卡/天");
                sb.AppendLine();

                sb.AppendLine("【营养指南】");
                foreach (var guideline in plan.NutritionalGuidelines)
                {
                    sb.AppendLine($"• {guideline}");
                }
                sb.AppendLine();

                sb.AppendLine("【一周餐单示例】");
                foreach (var meal in plan.DailyMeals)
                {
                    sb.AppendLine();
                    sb.AppendLine($"--- {meal.DayOfWeek} ---");
                    sb.AppendLine($"早餐：{meal.Breakfast.SuggestedFoods}");
                    sb.AppendLine($"      目标热量：{meal.Breakfast.TargetCalories:F0} 千卡");
                    sb.AppendLine($"      营养重点：{meal.Breakfast.NutritionFocus}");
                    sb.AppendLine();
                    sb.AppendLine($"午餐：{meal.Lunch.SuggestedFoods}");
                    sb.AppendLine($"      目标热量：{meal.Lunch.TargetCalories:F0} 千卡");
                    sb.AppendLine($"      营养重点：{meal.Lunch.NutritionFocus}");
                    sb.AppendLine();
                    sb.AppendLine($"晚餐：{meal.Dinner.SuggestedFoods}");
                    sb.AppendLine($"      目标热量：{meal.Dinner.TargetCalories:F0} 千卡");
                    sb.AppendLine($"      营养重点：{meal.Dinner.NutritionFocus}");
                }
                sb.AppendLine();

                sb.AppendLine("【饮食小贴士】");
                foreach (var tip in plan.Tips)
                {
                    sb.AppendLine($"• {tip}");
                }

                _txtResult.Text = sb.ToString();
            }
            catch (Exception ex)
            {
                _txtResult.Text = $"生成计划失败：{ex.Message}";
            }
        }

        /// <summary>
        /// 运动计划按钮点击事件
        /// </summary>
        private void BtnExercisePlan_Click(object? sender, EventArgs e)
        {
            try
            {
                _txtResult.Text = "正在生成运动计划，请稍候...";
                Application.DoEvents();

                var plan = _aiService.GenerateExercisePlan(_userId, "初级");

                var sb = new System.Text.StringBuilder();
                sb.AppendLine("=".PadRight(50, '='));
                sb.AppendLine("个性化运动计划");
                sb.AppendLine("=".PadRight(50, '='));
                sb.AppendLine();
                sb.AppendLine($"运动水平：{plan.Level}");
                sb.AppendLine();

                sb.AppendLine($"【热身指南】");
                sb.AppendLine(plan.WarmUpGuidelines);
                sb.AppendLine();

                sb.AppendLine($"【放松指南】");
                sb.AppendLine(plan.CoolDownGuidelines);
                sb.AppendLine();

                sb.AppendLine("【每周运动安排】");
                foreach (var day in plan.WeeklySchedule)
                {
                    sb.AppendLine();
                    sb.AppendLine($"--- {day.Day} ({day.Focus}) ---");
                    foreach (var exercise in day.Exercises)
                    {
                        sb.AppendLine($"  • {exercise.Name} - {exercise.Duration}分钟 ({exercise.Intensity}强度)");
                    }
                }
                sb.AppendLine();

                sb.AppendLine("【安全提示】");
                foreach (var tip in plan.SafetyTips)
                {
                    sb.AppendLine($"• {tip}");
                }

                _txtResult.Text = sb.ToString();
            }
            catch (Exception ex)
            {
                _txtResult.Text = $"生成计划失败：{ex.Message}";
            }
        }

        /// <summary>
        /// 周报按钮点击事件
        /// </summary>
        private void BtnWeeklyReport_Click(object? sender, EventArgs e)
        {
            try
            {
                _txtResult.Text = "正在生成健康周报，请稍候...";
                Application.DoEvents();

                var report = _aiService.GenerateWeeklyReport(_userId);

                var sb = new System.Text.StringBuilder();
                sb.AppendLine("=".PadRight(50, '='));
                sb.AppendLine("健康周报");
                sb.AppendLine("=".PadRight(50, '='));
                sb.AppendLine();
                sb.AppendLine($"周期：{report.WeekStartDate:yyyy-MM-dd} 至 {report.WeekEndDate:yyyy-MM-dd}");
                sb.AppendLine();

                sb.AppendLine("【本周总结】");
                sb.AppendLine(report.Summary);
                sb.AppendLine();

                sb.AppendLine("【本周亮点】");
                foreach (var highlight in report.Highlights)
                {
                    sb.AppendLine($"★ {highlight}");
                }
                sb.AppendLine();

                sb.AppendLine("【统计数据】");
                sb.AppendLine($"  记录天数：{report.Statistics.RecordCount}");
                sb.AppendLine($"  平均体重：{report.Statistics.AverageWeight:F1} kg");
                sb.AppendLine($"  平均睡眠：{report.Statistics.AverageSleep:F1} 小时");
                sb.AppendLine($"  运动总时长：{report.Statistics.TotalExerciseMinutes} 分钟");
                sb.AppendLine($"  总消耗热量：{report.Statistics.TotalCaloriesBurned:F0} 千卡");
                sb.AppendLine($"  日均摄入：{report.Statistics.AverageDailyCalories:F0} 千卡");
                sb.AppendLine($"  活跃天数：{report.Statistics.ActiveDays} 天");
                sb.AppendLine();

                sb.AppendLine("【改进建议】");
                foreach (var improvement in report.Improvements)
                {
                    sb.AppendLine($"• {improvement}");
                }
                sb.AppendLine();

                sb.AppendLine("【下周目标】");
                foreach (var goal in report.NextWeekGoals)
                {
                    sb.AppendLine($"☐ {goal}");
                }

                _txtResult.Text = sb.ToString();
            }
            catch (Exception ex)
            {
                _txtResult.Text = $"生成周报失败：{ex.Message}";
            }
        }
    }
}
