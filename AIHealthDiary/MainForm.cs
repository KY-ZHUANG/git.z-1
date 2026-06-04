using AIHealthDiary.Data;
using AIHealthDiary.Forms;
using AIHealthDiary.Models;

namespace AIHealthDiary
{
    /// <summary>
    /// 应用程序主窗体，提供导航和功能入口
    /// </summary>
    public partial class MainForm : Form
    {
        /// <summary>
        /// 数据库管理器实例
        /// </summary>
        private readonly DatabaseManager _dbManager;

        /// <summary>
        /// 当前选中的用户
        /// </summary>
        private User? _currentUser;

        /// <summary>
        /// 主内容面板，用于显示各功能界面
        /// </summary>
        private Panel _contentPanel;

        /// <summary>
        /// 侧边导航面板
        /// </summary>
        private Panel _navPanel;

        /// <summary>
        /// 顶部标题栏
        /// </summary>
        private Panel _headerPanel;

        /// <summary>
        /// 用户选择下拉框
        /// </summary>
        private ComboBox _userComboBox;

        /// <summary>
        /// 构造函数
        /// </summary>
        public MainForm()
        {
            // 初始化数据库管理器
            _dbManager = new DatabaseManager();

            // 初始化窗体
            InitializeComponent();
            InitializeUI();
            LoadUsers();
        }

        /// <summary>
        /// 初始化窗体基本属性
        /// </summary>
        private void InitializeComponent()
        {
            this.Text = "AI 健康日记与数据管理系统";
            this.Size = new Size(1200, 800);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(245, 247, 250);
            this.Font = new Font("Microsoft YaHei", 10F, FontStyle.Regular, GraphicsUnit.Point);
        }

        /// <summary>
        /// 初始化用户界面布局
        /// </summary>
        private void InitializeUI()
        {
            // 创建顶部标题栏
            _headerPanel = new Panel
            {
                Dock = DockStyle.Top,
                Height = 60,
                BackColor = Color.FromArgb(0, 150, 136)
            };

            // 标题标签
            var titleLabel = new Label
            {
                Text = "AI 健康日记与数据管理系统",
                Font = new Font("Microsoft YaHei", 16F, FontStyle.Bold),
                ForeColor = Color.White,
                AutoSize = true,
                Location = new Point(20, 15)
            };
            _headerPanel.Controls.Add(titleLabel);

            // 用户选择区域
            var userLabel = new Label
            {
                Text = "当前用户：",
                Font = new Font("Microsoft YaHei", 10F),
                ForeColor = Color.White,
                AutoSize = true,
                Location = new Point(850, 20)
            };
            _headerPanel.Controls.Add(userLabel);

            // 用户选择下拉框
            _userComboBox = new ComboBox
            {
                Location = new Point(930, 16),
                Size = new Size(150, 28),
                DropDownStyle = ComboBoxStyle.DropDownList,
                Font = new Font("Microsoft YaHei", 10F)
            };
            _userComboBox.SelectedIndexChanged += UserComboBox_SelectedIndexChanged;
            _headerPanel.Controls.Add(_userComboBox);

            // 添加用户按钮
            var addUserBtn = new Button
            {
                Text = "+ 添加用户",
                Location = new Point(1090, 15),
                Size = new Size(90, 30),
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(0, 120, 109),
                ForeColor = Color.White,
                Font = new Font("Microsoft YaHei", 9F)
            };
            addUserBtn.FlatAppearance.BorderSize = 0;
            addUserBtn.Click += AddUserBtn_Click;
            _headerPanel.Controls.Add(addUserBtn);

            this.Controls.Add(_headerPanel);

            // 创建侧边导航面板
            _navPanel = new Panel
            {
                Dock = DockStyle.Left,
                Width = 200,
                BackColor = Color.FromArgb(38, 50, 56)
            };

            // 创建导航按钮
            CreateNavButton("首页", 0, ShowDashboard);
            CreateNavButton("健康记录", 1, ShowHealthRecords);
            CreateNavButton("饮食记录", 2, ShowDietRecords);
            CreateNavButton("运动记录", 3, ShowExerciseRecords);
            CreateNavButton("AI 分析", 4, ShowAIAnalysis);
            CreateNavButton("周报", 5, ShowWeeklyReport);

            this.Controls.Add(_navPanel);

            // 创建主内容面板
            _contentPanel = new Panel
            {
                Dock = DockStyle.Fill,
                BackColor = Color.FromArgb(245, 247, 250),
                Padding = new Padding(20)
            };
            this.Controls.Add(_contentPanel);

            // 默认显示首页
            ShowDashboard();
        }

        /// <summary>
        /// 创建导航按钮
        /// </summary>
        /// <param name="text">按钮文本</param>
        /// <param name="index">按钮索引</param>
        /// <param name="clickHandler">点击事件处理</param>
        private void CreateNavButton(string text, int index, EventHandler clickHandler)
        {
            var btn = new Button
            {
                Text = text,
                Dock = DockStyle.Top,
                Height = 50,
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(38, 50, 56),
                ForeColor = Color.White,
                Font = new Font("Microsoft YaHei", 11F),
                TextAlign = ContentAlignment.MiddleLeft,
                Padding = new Padding(20, 0, 0, 0),
                Tag = index
            };
            btn.FlatAppearance.BorderSize = 0;
            btn.FlatAppearance.MouseOverBackColor = Color.FromArgb(55, 71, 79);
            btn.FlatAppearance.MouseDownBackColor = Color.FromArgb(0, 150, 136);
            btn.Click += clickHandler;
            btn.Click += NavButton_Click;

            // 将按钮添加到面板顶部，实现从上到下的排列
            _navPanel.Controls.Add(btn);
            btn.BringToFront();
        }

        /// <summary>
        /// 导航按钮点击时的样式处理
        /// </summary>
        private void NavButton_Click(object? sender, EventArgs e)
        {
            // 重置所有按钮颜色
            foreach (Control ctrl in _navPanel.Controls)
            {
                if (ctrl is Button btn)
                {
                    btn.BackColor = Color.FromArgb(38, 50, 56);
                }
            }

            // 高亮当前按钮
            if (sender is Button currentBtn)
            {
                currentBtn.BackColor = Color.FromArgb(0, 150, 136);
            }
        }

        /// <summary>
        /// 加载用户列表到下拉框
        /// </summary>
        private void LoadUsers()
        {
            _userComboBox.Items.Clear();
            var users = _dbManager.GetAllUsers();

            foreach (var user in users)
            {
                _userComboBox.Items.Add(new UserComboItem { Id = user.Id, Name = user.Name });
            }

            if (_userComboBox.Items.Count > 0)
            {
                _userComboBox.SelectedIndex = 0;
            }
        }

        /// <summary>
        /// 用户选择变更事件
        /// </summary>
        private void UserComboBox_SelectedIndexChanged(object? sender, EventArgs e)
        {
            if (_userComboBox.SelectedItem is UserComboItem item)
            {
                _currentUser = _dbManager.GetUserById(item.Id);
                // 刷新当前界面
                RefreshCurrentView();
            }
        }

        /// <summary>
        /// 添加用户按钮点击事件
        /// </summary>
        private void AddUserBtn_Click(object? sender, EventArgs e)
        {
            using var form = new UserForm(_dbManager);
            if (form.ShowDialog() == DialogResult.OK)
            {
                LoadUsers();
                // 选中新添加的用户
                if (_userComboBox.Items.Count > 0)
                {
                    _userComboBox.SelectedIndex = _userComboBox.Items.Count - 1;
                }
            }
        }

        /// <summary>
        /// 刷新当前视图
        /// </summary>
        private void RefreshCurrentView()
        {
            // 根据当前显示的内容刷新
            if (_contentPanel.Controls.Count > 0)
            {
                var currentControl = _contentPanel.Controls[0];
                if (currentControl is DashboardControl)
                {
                    ShowDashboard();
                }
            }
        }

        #region 导航功能

        /// <summary>
        /// 显示首页仪表板
        /// </summary>
        private void ShowDashboard(object? sender = null, EventArgs? e = null)
        {
            _contentPanel.Controls.Clear();
            var dashboard = new DashboardControl(_dbManager, _currentUser);
            dashboard.Dock = DockStyle.Fill;
            _contentPanel.Controls.Add(dashboard);
        }

        /// <summary>
        /// 显示健康记录界面
        /// </summary>
        private void ShowHealthRecords(object? sender = null, EventArgs? e = null)
        {
            if (_currentUser == null)
            {
                MessageBox.Show("请先选择或添加用户", "提示", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            _contentPanel.Controls.Clear();
            var healthControl = new HealthRecordControl(_dbManager, _currentUser.Id);
            healthControl.Dock = DockStyle.Fill;
            _contentPanel.Controls.Add(healthControl);
        }

        /// <summary>
        /// 显示饮食记录界面
        /// </summary>
        private void ShowDietRecords(object? sender = null, EventArgs? e = null)
        {
            if (_currentUser == null)
            {
                MessageBox.Show("请先选择或添加用户", "提示", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            _contentPanel.Controls.Clear();
            var dietControl = new DietRecordControl(_dbManager, _currentUser.Id);
            dietControl.Dock = DockStyle.Fill;
            _contentPanel.Controls.Add(dietControl);
        }

        /// <summary>
        /// 显示运动记录界面
        /// </summary>
        private void ShowExerciseRecords(object? sender = null, EventArgs? e = null)
        {
            if (_currentUser == null)
            {
                MessageBox.Show("请先选择或添加用户", "提示", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            _contentPanel.Controls.Clear();
            var exerciseControl = new ExerciseRecordControl(_dbManager, _currentUser.Id);
            exerciseControl.Dock = DockStyle.Fill;
            _contentPanel.Controls.Add(exerciseControl);
        }

        /// <summary>
        /// 显示AI分析界面
        /// </summary>
        private void ShowAIAnalysis(object? sender = null, EventArgs? e = null)
        {
            if (_currentUser == null)
            {
                MessageBox.Show("请先选择或添加用户", "提示", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            _contentPanel.Controls.Clear();
            var aiControl = new AIAnalysisControl(_dbManager, _currentUser.Id);
            aiControl.Dock = DockStyle.Fill;
            _contentPanel.Controls.Add(aiControl);
        }

        /// <summary>
        /// 显示周报界面
        /// </summary>
        private void ShowWeeklyReport(object? sender = null, EventArgs? e = null)
        {
            if (_currentUser == null)
            {
                MessageBox.Show("请先选择或添加用户", "提示", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            _contentPanel.Controls.Clear();
            var reportControl = new WeeklyReportControl(_dbManager, _currentUser.Id);
            reportControl.Dock = DockStyle.Fill;
            _contentPanel.Controls.Add(reportControl);
        }

        #endregion

        /// <summary>
        /// 窗体关闭时释放资源
        /// </summary>
        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            _dbManager?.Dispose();
            base.OnFormClosing(e);
        }
    }

    /// <summary>
    /// 用户下拉框项类，用于显示用户名称但保存用户ID
    /// </summary>
    public class UserComboItem
    {
        /// <summary>
        /// 用户ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// 用户姓名
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// 重写ToString以在下拉框中显示用户名称
        /// </summary>
        public override string ToString()
        {
            return Name;
        }
    }
}
