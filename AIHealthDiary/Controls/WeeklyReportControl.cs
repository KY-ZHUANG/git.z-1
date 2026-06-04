using AIHealthDiary.Data;
using AIHealthDiary.Models;
using AIHealthDiary.Services;

namespace AIHealthDiary.Controls
{
    /// <summary>
    /// 周报控件，显示健康周报的详细内容
    /// </summary>
    public partial class WeeklyReportControl : UserControl
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
        /// 报告内容文本框
        /// </summary>
        private TextBox _txtReport = null!;

        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="dbManager">数据库管理器</param>
        /// <param name="userId">用户ID</param>
        public WeeklyReportControl(DatabaseManager dbManager, int userId)
        {
            _dbManager = dbManager;
            _userId = userId;
            _aiService = new AIAnalysisService(dbManager);
            InitializeComponent();
            GenerateReport();
        }

        /// <summary>
        /// 初始化控件布局
        /// </summary>
        private void InitializeComponent()
        {
            this.BackColor = Color.FromArgb(245, 247, 250);
            this.Dock = DockStyle.Fill;

            // 创建主面板
            var mainPanel = new Panel
            {
                Dock = DockStyle.Fill,
                Padding = new Padding(20),
                BackColor = Color.White
            };

            // 标题栏
            var headerPanel = new Panel
            {
                Dock = DockStyle.Top,
                Height = 60,
                BackColor = Color.FromArgb(0, 150, 136)
            };

            var titleLabel = new Label
            {
                Text = "健康周报",
                Font = new Font("Microsoft YaHei", 18F, FontStyle.Bold),
                ForeColor = Color.White,
                AutoSize = true,
                Location = new Point(20, 15)
            };
            headerPanel.Controls.Add(titleLabel);

            // 刷新按钮
            var btnRefresh = new Button
            {
                Text = "刷新报告",
                Location = new Point(700, 12),
                Size = new Size(120, 35),
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(0, 120, 109),
                ForeColor = Color.White,
                Font = new Font("Microsoft YaHei", 10F)
            };
            btnRefresh.FlatAppearance.BorderSize = 0;
            btnRefresh.Click += (s, e) => GenerateReport();
            headerPanel.Controls.Add(btnRefresh);

            // 导出按钮
            var btnExport = new Button
            {
                Text = "导出报告",
                Location = new Point(830, 12),
                Size = new Size(120, 35),
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(0, 120, 109),
                ForeColor = Color.White,
                Font = new Font("Microsoft YaHei", 10F)
            };
            btnExport.FlatAppearance.BorderSize = 0;
            btnExport.Click += BtnExport_Click;
            headerPanel.Controls.Add(btnExport);

            mainPanel.Controls.Add(headerPanel);

            // 报告内容区域
            _txtReport = new TextBox
            {
                Dock = DockStyle.Fill,
                Multiline = true,
                ScrollBars = ScrollBars.Both,
                Font = new Font("Microsoft YaHei", 11F),
                BackColor = Color.White,
                BorderStyle = BorderStyle.None,
                ReadOnly = true,
                Margin = new Padding(0, 20, 0, 0)
            };
            mainPanel.Controls.Add(_txtReport);

            this.Controls.Add(mainPanel);
        }

        /// <summary>
        /// 生成周报内容
        /// </summary>
        private void GenerateReport()
        {
            try
            {
                _txtReport.Text = "正在生成周报，请稍候...";
                Application.DoEvents();

                var report = _aiService.GenerateWeeklyReport(_userId);
                var user = _dbManager.GetUserById(_userId);

                var sb = new System.Text.StringBuilder();

                // 报告头部
                sb.AppendLine();
                sb.AppendLine("    AI 健康日记与数据管理系统");
                sb.AppendLine("          健 康 周 报");
                sb.AppendLine();
                sb.AppendLine($"    用户：{user?.Name ?? "未知"}");
                sb.AppendLine($"    周期：{report.WeekStartDate:yyyy年MM月dd日} 至 {report.WeekEndDate:yyyy年MM月dd日}");
                sb.AppendLine($"    生成时间：{DateTime.Now:yyyy-MM-dd HH:mm}");
                sb.AppendLine();
                sb.AppendLine("=".PadRight(80, '='));
                sb.AppendLine();

                // 本周总结
                sb.AppendLine("【本周总结】");
                sb.AppendLine();
                sb.AppendLine(report.Summary);
                sb.AppendLine();
                sb.AppendLine("-".PadRight(80, '-'));
                sb.AppendLine();

                // 本周亮点
                sb.AppendLine("【本周亮点】");
                sb.AppendLine();
                foreach (var highlight in report.Highlights)
                {
                    sb.AppendLine($"  ★ {highlight}");
                }
                sb.AppendLine();
                sb.AppendLine("-".PadRight(80, '-'));
                sb.AppendLine();

                // 详细统计
                sb.AppendLine("【详细统计数据】");
                sb.AppendLine();
                sb.AppendLine($"  健康记录天数：    {report.Statistics.RecordCount} 天");
                sb.AppendLine($"  平均体重：        {report.Statistics.AverageWeight:F1} kg");
                sb.AppendLine($"  平均睡眠时长：    {report.Statistics.AverageSleep:F1} 小时");
                sb.AppendLine($"  运动总时长：      {report.Statistics.TotalExerciseMinutes} 分钟");
                sb.AppendLine($"  总消耗热量：      {report.Statistics.TotalCaloriesBurned:F0} 千卡");
                sb.AppendLine($"  日均摄入热量：    {report.Statistics.AverageDailyCalories:F0} 千卡");
                sb.AppendLine($"  活跃运动天数：    {report.Statistics.ActiveDays} 天");
                sb.AppendLine();
                sb.AppendLine("-".PadRight(80, '-'));
                sb.AppendLine();

                // 改进建议
                sb.AppendLine("【改进建议】");
                sb.AppendLine();
                foreach (var improvement in report.Improvements)
                {
                    sb.AppendLine($"  • {improvement}");
                }
                sb.AppendLine();
                sb.AppendLine("-".PadRight(80, '-'));
                sb.AppendLine();

                // 下周目标
                sb.AppendLine("【下周目标】");
                sb.AppendLine();
                foreach (var goal in report.NextWeekGoals)
                {
                    sb.AppendLine($"  ☐ {goal}");
                }
                sb.AppendLine();
                sb.AppendLine("=".PadRight(80, '='));
                sb.AppendLine();

                // 健康提示
                sb.AppendLine();
                sb.AppendLine("【健康小贴士】");
                sb.AppendLine();
                sb.AppendLine("  1. 健康的生活方式需要长期坚持，不要急于求成");
                sb.AppendLine("  2. 记录是管理健康的第一步，坚持记录有助于发现问题");
                sb.AppendLine("  3. 如有身体不适，请及时就医咨询专业医生");
                sb.AppendLine("  4. 保持积极心态，健康不仅是身体，也包括心理健康");
                sb.AppendLine();
                sb.AppendLine("=".PadRight(80, '='));
                sb.AppendLine();
                sb.AppendLine("                    祝您身体健康，生活愉快！");
                sb.AppendLine();

                _txtReport.Text = sb.ToString();
            }
            catch (Exception ex)
            {
                _txtReport.Text = $"生成周报失败：{ex.Message}\n\n请确保您已经添加了足够的健康数据。";
            }
        }

        /// <summary>
        /// 导出按钮点击事件
        /// </summary>
        private void BtnExport_Click(object? sender, EventArgs e)
        {
            try
            {
                using var saveDialog = new SaveFileDialog
                {
                    Filter = "文本文件|*.txt",
                    FileName = $"健康周报_{DateTime.Now:yyyyMMdd}.txt",
                    Title = "导出健康周报"
                };

                if (saveDialog.ShowDialog() == DialogResult.OK)
                {
                    File.WriteAllText(saveDialog.FileName, _txtReport.Text, System.Text.Encoding.UTF8);
                    MessageBox.Show("报告导出成功！", "成功", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"导出失败：{ex.Message}", "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
