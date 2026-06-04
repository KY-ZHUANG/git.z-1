using AIHealthDiary.Data;
using AIHealthDiary.Models;

namespace AIHealthDiary.Controls
{
    /// <summary>
    /// 用户管理控件，用于查看和修改当前用户信息
    /// </summary>
    public partial class UserManagementControl : UserControl
    {
        /// <summary>
        /// 数据库管理器实例
        /// </summary>
        private readonly DatabaseManager _dbManager;

        /// <summary>
        /// 当前用户
        /// </summary>
        private readonly User? _currentUser;

        // 表单控件
        private TextBox _txtName = null!;
        private ComboBox _cmbGender = null!;
        private NumericUpDown _numAge = null!;
        private NumericUpDown _numHeight = null!;
        private NumericUpDown _numWeight = null!;
        private Label _lblBMI = null!;
        private Label _lblBMR = null!;

        /// <summary>
        /// 用户更新事件
        /// </summary>
        public event Action<User>? OnUserUpdated;

        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="dbManager">数据库管理器</param>
        /// <param name="currentUser">当前用户</param>
        public UserManagementControl(DatabaseManager dbManager, User? currentUser)
        {
            _dbManager = dbManager;
            _currentUser = currentUser;
            InitializeComponent();
            LoadUserData();
        }

        /// <summary>
        /// 初始化控件布局
        /// </summary>
        private void InitializeComponent()
        {
            this.BackColor = Color.FromArgb(245, 247, 250);
            this.Dock = DockStyle.Fill;
            this.Padding = new Padding(20);

            // 创建主面板
            var mainPanel = new Panel
            {
                Dock = DockStyle.Fill,
                BackColor = Color.White,
                Padding = new Padding(30),
                AutoScroll = true
            };

            // 标题
            var titleLabel = new Label
            {
                Text = "👤 用户管理",
                Font = new Font("Microsoft YaHei", 20F, FontStyle.Bold),
                ForeColor = Color.FromArgb(33, 33, 33),
                Dock = DockStyle.Top,
                Height = 50,
                Margin = new Padding(0, 0, 0, 20)
            };
            mainPanel.Controls.Add(titleLabel);

            if (_currentUser == null)
            {
                // 未选择用户时的提示
                var lblNoUser = new Label
                {
                    Text = "请先添加或选择一个用户",
                    Font = new Font("Microsoft YaHei", 14F),
                    ForeColor = Color.Gray,
                    Dock = DockStyle.Fill,
                    TextAlign = ContentAlignment.MiddleCenter
                };
                mainPanel.Controls.Add(lblNoUser);
            }
            else
            {
                // 创建用户信息表单
                var formPanel = CreateUserForm();
                formPanel.Location = new Point(30, 80);
                formPanel.Size = new Size(600, 500);
                mainPanel.Controls.Add(formPanel);

                // 创建健康指标面板
                var statsPanel = CreateStatsPanel();
                statsPanel.Location = new Point(650, 80);
                statsPanel.Size = new Size(350, 300);
                mainPanel.Controls.Add(statsPanel);
            }

            this.Controls.Add(mainPanel);
        }

        /// <summary>
        /// 创建用户表单
        /// </summary>
        private Panel CreateUserForm()
        {
            var panel = new Panel
            {
                BackColor = Color.FromArgb(250, 250, 250),
                Padding = new Padding(20)
            };
            panel.Paint += (s, e) =>
            {
                using var pen = new Pen(Color.FromArgb(224, 224, 224));
                e.Graphics.DrawRectangle(pen, 0, 0, panel.Width - 1, panel.Height - 1);
            };

            var formLayout = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 2,
                RowCount = 6,
                Padding = new Padding(10)
            };
            formLayout.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 100F));
            formLayout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));

            int row = 0;

            // 姓名
            var lblName = new Label
            {
                Text = "姓名",
                Font = new Font("Microsoft YaHei", 11F),
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleLeft
            };
            _txtName = new TextBox
            {
                Font = new Font("Microsoft YaHei", 11F),
                Dock = DockStyle.Fill
            };
            formLayout.Controls.Add(lblName, 0, row);
            formLayout.Controls.Add(_txtName, 1, row);
            row++;

            // 性别
            var lblGender = new Label
            {
                Text = "性别",
                Font = new Font("Microsoft YaHei", 11F),
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleLeft
            };
            _cmbGender = new ComboBox
            {
                Font = new Font("Microsoft YaHei", 11F),
                Dock = DockStyle.Fill,
                DropDownStyle = ComboBoxStyle.DropDownList
            };
            _cmbGender.Items.AddRange(new object[] { "男", "女" });
            formLayout.Controls.Add(lblGender, 0, row);
            formLayout.Controls.Add(_cmbGender, 1, row);
            row++;

            // 年龄
            var lblAge = new Label
            {
                Text = "年龄",
                Font = new Font("Microsoft YaHei", 11F),
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleLeft
            };
            _numAge = new NumericUpDown
            {
                Font = new Font("Microsoft YaHei", 11F),
                Dock = DockStyle.Fill,
                Minimum = 1,
                Maximum = 150
            };
            formLayout.Controls.Add(lblAge, 0, row);
            formLayout.Controls.Add(_numAge, 1, row);
            row++;

            // 身高
            var lblHeight = new Label
            {
                Text = "身高(cm)",
                Font = new Font("Microsoft YaHei", 11F),
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleLeft
            };
            _numHeight = new NumericUpDown
            {
                Font = new Font("Microsoft YaHei", 11F),
                Dock = DockStyle.Fill,
                Minimum = 50,
                Maximum = 250,
                DecimalPlaces = 1
            };
            _numHeight.ValueChanged += (s, e) => UpdateStats();
            formLayout.Controls.Add(lblHeight, 0, row);
            formLayout.Controls.Add(_numHeight, 1, row);
            row++;

            // 体重
            var lblWeight = new Label
            {
                Text = "体重(kg)",
                Font = new Font("Microsoft YaHei", 11F),
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleLeft
            };
            _numWeight = new NumericUpDown
            {
                Font = new Font("Microsoft YaHei", 11F),
                Dock = DockStyle.Fill,
                Minimum = 20,
                Maximum = 300,
                DecimalPlaces = 1
            };
            _numWeight.ValueChanged += (s, e) => UpdateStats();
            formLayout.Controls.Add(lblWeight, 0, row);
            formLayout.Controls.Add(_numWeight, 1, row);
            row++;

            panel.Controls.Add(formLayout);

            // 按钮面板
            var buttonPanel = new FlowLayoutPanel
            {
                Dock = DockStyle.Bottom,
                Height = 60,
                FlowDirection = FlowDirection.LeftToRight,
                Padding = new Padding(0, 10, 0, 0)
            };

            // 保存按钮
            var btnSave = new Button
            {
                Text = "💾 保存修改",
                Size = new Size(150, 40),
                BackColor = Color.FromArgb(0, 150, 136),
                ForeColor = Color.White,
                Font = new Font("Microsoft YaHei", 11F),
                FlatStyle = FlatStyle.Flat,
                Margin = new Padding(0, 0, 10, 0)
            };
            btnSave.FlatAppearance.BorderSize = 0;
            btnSave.Click += BtnSave_Click;
            buttonPanel.Controls.Add(btnSave);

            // 删除用户按钮
            var btnDelete = new Button
            {
                Text = "🗑️ 删除用户",
                Size = new Size(150, 40),
                BackColor = Color.FromArgb(244, 67, 54),
                ForeColor = Color.White,
                Font = new Font("Microsoft YaHei", 11F),
                FlatStyle = FlatStyle.Flat
            };
            btnDelete.FlatAppearance.BorderSize = 0;
            btnDelete.Click += BtnDelete_Click;
            buttonPanel.Controls.Add(btnDelete);

            panel.Controls.Add(buttonPanel);

            return panel;
        }

        /// <summary>
        /// 创建健康指标面板
        /// </summary>
        private Panel CreateStatsPanel()
        {
            var panel = new Panel
            {
                BackColor = Color.FromArgb(232, 245, 233),
                Padding = new Padding(20)
            };
            panel.Paint += (s, e) =>
            {
                using var pen = new Pen(Color.FromArgb(200, 230, 201));
                e.Graphics.DrawRectangle(pen, 0, 0, panel.Width - 1, panel.Height - 1);
            };

            var layout = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 1,
                RowCount = 5
            };

            // 标题
            var lblTitle = new Label
            {
                Text = "健康指标",
                Font = new Font("Microsoft YaHei", 16F, FontStyle.Bold),
                ForeColor = Color.FromArgb(46, 125, 50),
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleCenter
            };
            layout.Controls.Add(lblTitle, 0, 0);

            // BMI
            var lblBMITitle = new Label
            {
                Text = "BMI 指数",
                Font = new Font("Microsoft YaHei", 12F),
                ForeColor = Color.Gray,
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.BottomCenter
            };
            layout.Controls.Add(lblBMITitle, 0, 1);

            _lblBMI = new Label
            {
                Text = "--",
                Font = new Font("Microsoft YaHei", 32F, FontStyle.Bold),
                ForeColor = Color.FromArgb(46, 125, 50),
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleCenter
            };
            layout.Controls.Add(_lblBMI, 0, 2);

            // BMR
            var lblBMRTitle = new Label
            {
                Text = "基础代谢率",
                Font = new Font("Microsoft YaHei", 12F),
                ForeColor = Color.Gray,
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.BottomCenter
            };
            layout.Controls.Add(lblBMRTitle, 0, 3);

            _lblBMR = new Label
            {
                Text = "-- 千卡/天",
                Font = new Font("Microsoft YaHei", 18F, FontStyle.Bold),
                ForeColor = Color.FromArgb(46, 125, 50),
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.TopCenter
            };
            layout.Controls.Add(_lblBMR, 0, 4);

            panel.Controls.Add(layout);
            return panel;
        }

        /// <summary>
        /// 加载用户数据
        /// </summary>
        private void LoadUserData()
        {
            if (_currentUser == null) return;

            _txtName.Text = _currentUser.Name;
            _cmbGender.SelectedItem = _currentUser.Gender;
            _numAge.Value = _currentUser.Age;
            _numHeight.Value = (decimal)_currentUser.Height;
            _numWeight.Value = (decimal)_currentUser.Weight;

            UpdateStats();
        }

        /// <summary>
        /// 更新健康指标显示
        /// </summary>
        private void UpdateStats()
        {
            if (_currentUser == null) return;

            // 创建临时用户对象计算指标
            var tempUser = new User
            {
                Height = (double)_numHeight.Value,
                Weight = (double)_numWeight.Value,
                Age = (int)_numAge.Value,
                Gender = _cmbGender.SelectedItem?.ToString() ?? "男"
            };

            double bmi = tempUser.CalculateBMI();
            double bmr = tempUser.CalculateBMR();

            _lblBMI.Text = bmi.ToString("F1");
            _lblBMR.Text = $"{bmr:F0} 千卡/天";

            // 根据BMI设置颜色
            Color bmiColor = bmi switch
            {
                < 18.5 => Color.FromArgb(255, 152, 0),
                < 24 => Color.FromArgb(76, 175, 80),
                < 28 => Color.FromArgb(255, 152, 0),
                _ => Color.FromArgb(244, 67, 54)
            };
            _lblBMI.ForeColor = bmiColor;
        }

        /// <summary>
        /// 保存按钮点击事件
        /// </summary>
        private void BtnSave_Click(object? sender, EventArgs e)
        {
            if (_currentUser == null) return;

            if (string.IsNullOrWhiteSpace(_txtName.Text))
            {
                MessageBox.Show("请输入姓名", "验证错误", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            try
            {
                _currentUser.Name = _txtName.Text.Trim();
                _currentUser.Gender = _cmbGender.SelectedItem?.ToString() ?? "男";
                _currentUser.Age = (int)_numAge.Value;
                _currentUser.Height = (double)_numHeight.Value;
                _currentUser.Weight = (double)_numWeight.Value;

                if (_dbManager.UpdateUser(_currentUser))
                {
                    MessageBox.Show("用户信息更新成功！", "成功", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    OnUserUpdated?.Invoke(_currentUser);
                }
                else
                {
                    MessageBox.Show("更新失败，请重试", "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"保存失败：{ex.Message}", "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        /// <summary>
        /// 删除用户按钮点击事件
        /// </summary>
        private void BtnDelete_Click(object? sender, EventArgs e)
        {
            if (_currentUser == null) return;

            var result = MessageBox.Show(
                $"确定要删除用户 \"{_currentUser.Name}\" 吗？\n此操作将同时删除该用户的所有健康数据，且不可恢复！",
                "确认删除",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Warning);

            if (result == DialogResult.Yes)
            {
                try
                {
                    if (_dbManager.DeleteUser(_currentUser.Id))
                    {
                        MessageBox.Show("用户删除成功！", "成功", MessageBoxButtons.OK, MessageBoxIcon.Information);
                        OnUserUpdated?.Invoke(null!);
                    }
                    else
                    {
                        MessageBox.Show("删除失败，请重试", "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"删除失败：{ex.Message}", "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }
    }
}
