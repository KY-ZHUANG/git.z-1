using AIHealthDiary.Data;
using AIHealthDiary.Models;

namespace AIHealthDiary.Controls
{
    /// <summary>
    /// 饮食记录管理控件，用于添加和查看饮食数据
    /// </summary>
    public partial class DietRecordControl : UserControl
    {
        /// <summary>
        /// 数据库管理器实例
        /// </summary>
        private readonly DatabaseManager _dbManager;

        /// <summary>
        /// 当前用户ID
        /// </summary>
        private readonly int _userId;

        // 表单控件
        private DateTimePicker _dtpDate = null!;
        private ComboBox _cmbMealType = null!;
        private TextBox _txtFoodName = null!;
        private NumericUpDown _numPortion = null!;
        private NumericUpDown _numCalories = null!;
        private NumericUpDown _numProtein = null!;
        private NumericUpDown _numCarbs = null!;
        private NumericUpDown _numFat = null!;
        private NumericUpDown _numFiber = null!;
        private DataGridView _dgvRecords = null!;

        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="dbManager">数据库管理器</param>
        /// <param name="userId">用户ID</param>
        public DietRecordControl(DatabaseManager dbManager, int userId)
        {
            _dbManager = dbManager;
            _userId = userId;
            InitializeComponent();
            LoadRecords();
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
                SplitterDistance = 420,
                Panel1MinSize = 400,
                Panel2MinSize = 500
            };

            // 左侧：添加记录表单
            var leftPanel = CreateFormPanel();
            splitContainer.Panel1.Controls.Add(leftPanel);

            // 右侧：记录列表
            var rightPanel = CreateListPanel();
            splitContainer.Panel2.Controls.Add(rightPanel);

            this.Controls.Add(splitContainer);
        }

        /// <summary>
        /// 创建表单面板
        /// </summary>
        private Panel CreateFormPanel()
        {
            var panel = new Panel
            {
                Dock = DockStyle.Fill,
                Padding = new Padding(20),
                BackColor = Color.White
            };

            var titleLabel = new Label
            {
                Text = "添加饮食记录",
                Font = new Font("Microsoft YaHei", 14F, FontStyle.Bold),
                Dock = DockStyle.Top,
                Height = 40
            };
            panel.Controls.Add(titleLabel);

            var formPanel = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 2,
                RowCount = 9,
                Padding = new Padding(10, 20, 10, 10),
                AutoScroll = true
            };
            formPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 90F));
            formPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));
            
            // 设置行高
            for (int i = 0; i < 9; i++)
            {
                formPanel.RowStyles.Add(new RowStyle(SizeType.Absolute, 40F));
            }

            int row = 0;

            // 日期
            _dtpDate = new DateTimePicker
            {
                Format = DateTimePickerFormat.Short,
                Dock = DockStyle.Fill,
                Value = DateTime.Now
            };
            AddFormRow(formPanel, "日期：", _dtpDate, row++);

            // 餐次
            _cmbMealType = new ComboBox
            {
                Dock = DockStyle.Fill,
                DropDownStyle = ComboBoxStyle.DropDownList
            };
            _cmbMealType.Items.AddRange(new object[] { "早餐", "午餐", "晚餐", "加餐" });
            _cmbMealType.SelectedIndex = 0;
            AddFormRow(formPanel, "餐次：", _cmbMealType, row++);

            // 食物名称
            _txtFoodName = new TextBox { Dock = DockStyle.Fill };
            AddFormRow(formPanel, "食物名称：", _txtFoodName, row++);

            // 份量
            _numPortion = new NumericUpDown
            {
                Minimum = 0,
                Maximum = 2000,
                DecimalPlaces = 0,
                Value = 100,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "份量(g)：", _numPortion, row++);

            // 热量
            _numCalories = new NumericUpDown
            {
                Minimum = 0,
                Maximum = 2000,
                DecimalPlaces = 0,
                Value = 200,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "热量(kcal)：", _numCalories, row++);

            // 蛋白质
            _numProtein = new NumericUpDown
            {
                Minimum = 0,
                Maximum = 200,
                DecimalPlaces = 1,
                Value = 10,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "蛋白质(g)：", _numProtein, row++);

            // 碳水化合物
            _numCarbs = new NumericUpDown
            {
                Minimum = 0,
                Maximum = 300,
                DecimalPlaces = 1,
                Value = 30,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "碳水(g)：", _numCarbs, row++);

            // 脂肪
            _numFat = new NumericUpDown
            {
                Minimum = 0,
                Maximum = 100,
                DecimalPlaces = 1,
                Value = 5,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "脂肪(g)：", _numFat, row++);

            // 膳食纤维
            _numFiber = new NumericUpDown
            {
                Minimum = 0,
                Maximum = 50,
                DecimalPlaces = 1,
                Value = 2,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "纤维(g)：", _numFiber, row++);

            panel.Controls.Add(formPanel);

            // 保存按钮
            var btnSave = new Button
            {
                Text = "保存记录",
                Dock = DockStyle.Bottom,
                Height = 40,
                BackColor = Color.FromArgb(255, 152, 0),
                ForeColor = Color.White,
                Font = new Font("Microsoft YaHei", 11F),
                FlatStyle = FlatStyle.Flat,
                Margin = new Padding(0, 20, 0, 0)
            };
            btnSave.FlatAppearance.BorderSize = 0;
            btnSave.Click += BtnSave_Click;
            panel.Controls.Add(btnSave);

            return panel;
        }

        /// <summary>
        /// 添加表单行
        /// </summary>
        private void AddFormRow(TableLayoutPanel panel, string label, Control control, int row)
        {
            var lbl = new Label
            {
                Text = label,
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleRight
            };
            panel.Controls.Add(lbl, 0, row);
            panel.Controls.Add(control, 1, row);
        }

        /// <summary>
        /// 创建列表面板
        /// </summary>
        private Panel CreateListPanel()
        {
            var panel = new Panel
            {
                Dock = DockStyle.Fill,
                Padding = new Padding(20),
                BackColor = Color.White
            };

            var titleLabel = new Label
            {
                Text = "饮食记录列表",
                Font = new Font("Microsoft YaHei", 14F, FontStyle.Bold),
                Dock = DockStyle.Top,
                Height = 40
            };
            panel.Controls.Add(titleLabel);

            // 数据表格
            _dgvRecords = new DataGridView
            {
                Dock = DockStyle.Fill,
                AutoGenerateColumns = false,
                AllowUserToAddRows = false,
                AllowUserToDeleteRows = false,
                ReadOnly = true,
                SelectionMode = DataGridViewSelectionMode.FullRowSelect,
                BackgroundColor = Color.White,
                BorderStyle = BorderStyle.None,
                ColumnHeadersDefaultCellStyle = new DataGridViewCellStyle
                {
                    BackColor = Color.FromArgb(255, 152, 0),
                    ForeColor = Color.White,
                    Font = new Font("Microsoft YaHei", 10F, FontStyle.Bold)
                },
                EnableHeadersVisualStyles = false
            };

            // 添加列
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "RecordDate",
                HeaderText = "日期",
                Width = 90,
                DefaultCellStyle = { Format = "yyyy-MM-dd" }
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "MealType",
                HeaderText = "餐次",
                Width = 60
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "FoodName",
                HeaderText = "食物",
                Width = 100
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "Portion",
                HeaderText = "份量(g)",
                Width = 70
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "Calories",
                HeaderText = "热量",
                Width = 60
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "Protein",
                HeaderText = "蛋白质",
                Width = 60
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "Carbohydrates",
                HeaderText = "碳水",
                Width = 60
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "Fat",
                HeaderText = "脂肪",
                Width = 60
            });

            panel.Controls.Add(_dgvRecords);

            return panel;
        }

        /// <summary>
        /// 保存按钮点击事件
        /// </summary>
        private void BtnSave_Click(object? sender, EventArgs e)
        {
            // 验证输入
            if (string.IsNullOrWhiteSpace(_txtFoodName.Text))
            {
                MessageBox.Show("请输入食物名称", "验证错误", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                _txtFoodName.Focus();
                return;
            }

            try
            {
                var diet = new Diet
                {
                    UserId = _userId,
                    RecordDate = _dtpDate.Value,
                    MealType = _cmbMealType.SelectedItem?.ToString() ?? "早餐",
                    FoodName = _txtFoodName.Text.Trim(),
                    Portion = (double)_numPortion.Value,
                    Calories = (double)_numCalories.Value,
                    Protein = (double)_numProtein.Value,
                    Carbohydrates = (double)_numCarbs.Value,
                    Fat = (double)_numFat.Value,
                    Fiber = (double)_numFiber.Value
                };

                _dbManager.AddDiet(diet);
                MessageBox.Show("饮食记录保存成功！", "成功", MessageBoxButtons.OK, MessageBoxIcon.Information);

                // 清空表单
                _txtFoodName.Clear();
                _numPortion.Value = 100;
                _numCalories.Value = 200;
                _numProtein.Value = 10;
                _numCarbs.Value = 30;
                _numFat.Value = 5;
                _numFiber.Value = 2;

                // 刷新列表
                LoadRecords();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"保存失败：{ex.Message}", "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        /// <summary>
        /// 加载记录列表
        /// </summary>
        private void LoadRecords()
        {
            var records = _dbManager.GetDiets(_userId);
            _dgvRecords.DataSource = records;
        }
    }
}
