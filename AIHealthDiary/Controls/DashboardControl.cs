using AIHealthDiary.Data;
using AIHealthDiary.Models;

namespace AIHealthDiary.Controls
{
    /// <summary>
    /// 首页仪表板控件，显示用户概览和快速入口
    /// </summary>
    public partial class DashboardControl : UserControl
    {
        /// <summary>
        /// 数据库管理器实例
        /// </summary>
        private readonly DatabaseManager _dbManager;

        /// <summary>
        /// 当前用户
        /// </summary>
        private readonly User? _currentUser;

        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="dbManager">数据库管理器</param>
        /// <param name="currentUser">当前用户</param>
        public DashboardControl(DatabaseManager dbManager, User? currentUser)
        {
            _dbManager = dbManager;
            _currentUser = currentUser;
            InitializeComponent();
            LoadData();
        }

        /// <summary>
        /// 初始化控件
        /// </summary>
        private void InitializeComponent()
        {
            this.BackColor = Color.FromArgb(245, 247, 250);
            this.Dock = DockStyle.Fill;
            this.Padding = new Padding(20);

            // 创建主布局面板
            var mainPanel = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 2,
                RowCount = 2,
                Padding = new Padding(10),
                AutoScroll = true,
                ColumnStyles = 
                {
                    new ColumnStyle(SizeType.Percent, 50F),
                    new ColumnStyle(SizeType.Percent, 50F)
                },
                RowStyles = 
                {
                    new RowStyle(SizeType.Percent, 50F),
                    new RowStyle(SizeType.Percent, 50F)
                }
            };

            // 用户信息卡片
            mainPanel.Controls.Add(CreateUserInfoCard(), 0, 0);

            // BMI卡片
            mainPanel.Controls.Add(CreateBMICard(), 1, 0);

            // 今日记录卡片
            mainPanel.Controls.Add(CreateTodayRecordCard(), 0, 1);

            // 快捷操作卡片
            mainPanel.Controls.Add(CreateQuickActionCard(), 1, 1);

            this.Controls.Add(mainPanel);
        }

        /// <summary>
        /// 创建用户信息卡片
        /// </summary>
        private Panel CreateUserInfoCard()
        {
            var card = CreateCardPanel("用户信息");

            if (_currentUser == null)
            {
                var lbl = new Label
                {
                    Text = "请添加用户开始使用",
                    Dock = DockStyle.Fill,
                    TextAlign = ContentAlignment.MiddleCenter,
                    Font = new Font("Microsoft YaHei", 12F),
                    ForeColor = Color.Gray
                };
                card.Controls.Add(lbl);
                return card;
            }

            var contentPanel = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 2,
                RowCount = 5,
                Padding = new Padding(15),
                AutoScroll = true
            };

            // 设置列宽比例
            contentPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 80F));
            contentPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));

            // 设置行高
            for (int i = 0; i < 5; i++)
            {
                contentPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 20F));
            }

            AddInfoRow(contentPanel, "姓名：", _currentUser.Name, 0);
            AddInfoRow(contentPanel, "性别：", _currentUser.Gender, 1);
            AddInfoRow(contentPanel, "年龄：", $"{_currentUser.Age} 岁", 2);
            AddInfoRow(contentPanel, "身高：", $"{_currentUser.Height:F1} cm", 3);
            AddInfoRow(contentPanel, "体重：", $"{_currentUser.Weight:F1} kg", 4);

            card.Controls.Add(contentPanel);
            return card;
        }

        /// <summary>
        /// 创建BMI卡片
        /// </summary>
        private Panel CreateBMICard()
        {
            var card = CreateCardPanel("BMI 指数");

            if (_currentUser == null)
            {
                var lbl = new Label
                {
                    Text = "添加用户后查看BMI",
                    Dock = DockStyle.Fill,
                    TextAlign = ContentAlignment.MiddleCenter,
                    Font = new Font("Microsoft YaHei", 12F),
                    ForeColor = Color.Gray
                };
                card.Controls.Add(lbl);
                return card;
            }

            var contentPanel = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 1,
                RowCount = 4,
                Padding = new Padding(10)
            };
            contentPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 25F));
            contentPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 30F));
            contentPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 25F));
            contentPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 20F));

            double bmi = _currentUser.CalculateBMI();
            string category = _currentUser.GetBMICategory();

            // BMI分类标题（放在最上方，避免被遮挡）
            var lblCategoryTitle = new Label
            {
                Text = "BMI 分类",
                Font = new Font("Microsoft YaHei", 12F),
                ForeColor = Color.Gray,
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.BottomCenter
            };
            contentPanel.Controls.Add(lblCategoryTitle, 0, 0);

            // BMI数值显示
            var lblBMI = new Label
            {
                Text = bmi.ToString("F1"),
                Font = new Font("Microsoft YaHei", 42F, FontStyle.Bold),
                ForeColor = GetBMIColor(bmi),
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleCenter
            };
            contentPanel.Controls.Add(lblBMI, 0, 1);

            // BMI分类
            var lblCategory = new Label
            {
                Text = category,
                Font = new Font("Microsoft YaHei", 14F, FontStyle.Bold),
                ForeColor = GetBMIColor(bmi),
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.TopCenter
            };
            contentPanel.Controls.Add(lblCategory, 0, 2);

            // 理想体重范围
            double idealMin = 18.5 * Math.Pow(_currentUser.Height / 100, 2);
            double idealMax = 24 * Math.Pow(_currentUser.Height / 100, 2);
            var lblIdeal = new Label
            {
                Text = $"理想体重: {idealMin:F1} - {idealMax:F1} kg",
                Font = new Font("Microsoft YaHei", 10F),
                ForeColor = Color.Gray,
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.TopCenter
            };
            contentPanel.Controls.Add(lblIdeal, 0, 3);

            card.Controls.Add(contentPanel);
            return card;
        }

        /// <summary>
        /// 创建今日记录卡片
        /// </summary>
        private Panel CreateTodayRecordCard()
        {
            var card = CreateCardPanel("今日记录概览");

            var contentPanel = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 4,
                RowCount = 3,
                Padding = new Padding(15),
                AutoScroll = true
            };

            // 设置列宽
            for (int i = 0; i < 4; i += 2)
            {
                contentPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 90F));
                contentPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50F));
            }

            // 设置行高
            for (int i = 0; i < 3; i++)
            {
                contentPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 33.33F));
            }

            if (_currentUser != null)
            {
                var today = DateTime.Now.Date;
                var healthRecords = _dbManager.GetHealthRecords(_currentUser.Id, today, today);
                var diets = _dbManager.GetDiets(_currentUser.Id, today);
                var exercises = _dbManager.GetExercises(_currentUser.Id, today);

                double totalCaloriesIn = diets.Sum(d => d.Calories);
                double totalCaloriesOut = exercises.Sum(e => e.CaloriesBurned);

                AddInfoRow(contentPanel, "健康记录：", healthRecords.Count > 0 ? "已记录" : "未记录", 0);
                AddInfoRow(contentPanel, "饮食记录：", $"{diets.Count} 条", 1);
                AddInfoRow(contentPanel, "摄入热量：", $"{totalCaloriesIn:F0} 千卡", 2);
                AddInfoRow(contentPanel, "运动记录：", $"{exercises.Count} 条", 0, 1);
                AddInfoRow(contentPanel, "消耗热量：", $"{totalCaloriesOut:F0} 千卡", 1, 1);
                AddInfoRow(contentPanel, "热量差：", $"{totalCaloriesIn - totalCaloriesOut:F0} 千卡", 2, 1);
            }
            else
            {
                var lbl = new Label
                {
                    Text = "选择用户后查看今日记录",
                    Dock = DockStyle.Fill,
                    TextAlign = ContentAlignment.MiddleCenter,
                    ForeColor = Color.Gray
                };
                contentPanel.Controls.Add(lbl);
                contentPanel.SetColumnSpan(lbl, 2);
            }

            card.Controls.Add(contentPanel);
            return card;
        }

        /// <summary>
        /// 创建快捷操作卡片
        /// </summary>
        private Panel CreateQuickActionCard()
        {
            var card = CreateCardPanel("快捷操作");

            var contentPanel = new FlowLayoutPanel
            {
                Dock = DockStyle.Fill,
                FlowDirection = FlowDirection.TopDown,
                Padding = new Padding(20),
                AutoScroll = true
            };

            var btnHealth = CreateActionButton("记录健康数据", Color.FromArgb(0, 150, 136));
            btnHealth.Click += (s, e) => OnQuickAction?.Invoke("health");

            var btnDiet = CreateActionButton("记录饮食", Color.FromArgb(255, 152, 0));
            btnDiet.Click += (s, e) => OnQuickAction?.Invoke("diet");

            var btnExercise = CreateActionButton("记录运动", Color.FromArgb(63, 81, 181));
            btnExercise.Click += (s, e) => OnQuickAction?.Invoke("exercise");

            var btnAI = CreateActionButton("AI 分析", Color.FromArgb(156, 39, 176));
            btnAI.Click += (s, e) => OnQuickAction?.Invoke("ai");

            contentPanel.Controls.Add(btnHealth);
            contentPanel.Controls.Add(btnDiet);
            contentPanel.Controls.Add(btnExercise);
            contentPanel.Controls.Add(btnAI);

            card.Controls.Add(contentPanel);
            return card;
        }

        /// <summary>
        /// 创建卡片面板
        /// </summary>
        private Panel CreateCardPanel(string title)
        {
            var card = new Panel
            {
                Dock = DockStyle.Fill,
                BackColor = Color.White,
                Margin = new Padding(8),
                Padding = new Padding(12),
                MinimumSize = new Size(280, 200)
            };
            card.Paint += (s, e) =>
            {
                // 绘制边框
                using var pen = new Pen(Color.FromArgb(224, 224, 224));
                e.Graphics.DrawRectangle(pen, 0, 0, card.Width - 1, card.Height - 1);
            };

            // 标题
            var titleLabel = new Label
            {
                Text = title,
                Font = new Font("Microsoft YaHei", 14F, FontStyle.Bold),
                ForeColor = Color.FromArgb(33, 33, 33),
                Dock = DockStyle.Top,
                Height = 30
            };
            card.Controls.Add(titleLabel);

            return card;
        }

        /// <summary>
        /// 添加信息行到表格布局
        /// </summary>
        private void AddInfoRow(TableLayoutPanel panel, string label, string value, int row, int column = 0)
        {
            var lblLabel = new Label
            {
                Text = label,
                Font = new Font("Microsoft YaHei", 10F),
                ForeColor = Color.Gray,
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleLeft,
                AutoSize = true,
                Margin = new Padding(3)
            };

            var lblValue = new Label
            {
                Text = value,
                Font = new Font("Microsoft YaHei", 10F, FontStyle.Bold),
                ForeColor = Color.FromArgb(33, 33, 33),
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleLeft,
                AutoSize = true,
                Margin = new Padding(3)
            };

            panel.Controls.Add(lblLabel, column * 2, row);
            panel.Controls.Add(lblValue, column * 2 + 1, row);
        }

        /// <summary>
        /// 创建操作按钮
        /// </summary>
        private Button CreateActionButton(string text, Color color)
        {
            var btn = new Button
            {
                Text = text,
                Size = new Size(200, 45),
                Margin = new Padding(0, 0, 0, 10),
                FlatStyle = FlatStyle.Flat,
                BackColor = color,
                ForeColor = Color.White,
                Font = new Font("Microsoft YaHei", 11F)
            };
            btn.FlatAppearance.BorderSize = 0;
            return btn;
        }

        /// <summary>
        /// 根据BMI值获取对应颜色
        /// </summary>
        private Color GetBMIColor(double bmi)
        {
            return bmi switch
            {
                < 18.5 => Color.FromArgb(255, 152, 0),  // 偏瘦 - 橙色
                < 24 => Color.FromArgb(76, 175, 80),    // 正常 - 绿色
                < 28 => Color.FromArgb(255, 152, 0),    // 偏胖 - 橙色
                _ => Color.FromArgb(244, 67, 54)        // 肥胖 - 红色
            };
        }

        /// <summary>
        /// 加载数据
        /// </summary>
        private void LoadData()
        {
            // 数据已在控件创建时加载
        }

        /// <summary>
        /// 快捷操作事件
        /// </summary>
        public event Action<string>? OnQuickAction;
    }
}
