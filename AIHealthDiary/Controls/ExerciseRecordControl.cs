using AIHealthDiary.Data;
using AIHealthDiary.Models;

namespace AIHealthDiary.Controls
{
    /// <summary>
    /// 运动记录管理控件，用于添加和查看运动数据
    /// </summary>
    public partial class ExerciseRecordControl : UserControl
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
        private TextBox _txtExerciseName = null!;
        private ComboBox _cmbExerciseType = null!;
        private NumericUpDown _numDuration = null!;
        private NumericUpDown _numCalories = null!;
        private ComboBox _cmbIntensity = null!;
        private NumericUpDown _numHeartRate = null!;
        private TextBox _txtNotes = null!;
        private DataGridView _dgvRecords = null!;

        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="dbManager">数据库管理器</param>
        /// <param name="userId">用户ID</param>
        public ExerciseRecordControl(DatabaseManager dbManager, int userId)
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
                SplitterDistance = 380,
                Panel1MinSize = 300
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
                Text = "添加运动记录",
                Font = new Font("Microsoft YaHei", 14F, FontStyle.Bold),
                Dock = DockStyle.Top,
                Height = 40
            };
            panel.Controls.Add(titleLabel);

            var formPanel = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 2,
                RowCount = 8,
                Padding = new Padding(10, 20, 10, 10),
                AutoScroll = true
            };
            formPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 90F));
            formPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));
            
            // 设置行高
            for (int i = 0; i < 8; i++)
            {
                formPanel.RowStyles.Add(new RowStyle(SizeType.Absolute, 42F));
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

            // 运动名称
            _txtExerciseName = new TextBox { Dock = DockStyle.Fill };
            AddFormRow(formPanel, "运动名称：", _txtExerciseName, row++);

            // 运动类型
            _cmbExerciseType = new ComboBox
            {
                Dock = DockStyle.Fill,
                DropDownStyle = ComboBoxStyle.DropDownList
            };
            _cmbExerciseType.Items.AddRange(new object[] { "有氧运动", "力量训练", "柔韧性", "其他" });
            _cmbExerciseType.SelectedIndex = 0;
            AddFormRow(formPanel, "运动类型：", _cmbExerciseType, row++);

            // 持续时间
            _numDuration = new NumericUpDown
            {
                Minimum = 1,
                Maximum = 300,
                DecimalPlaces = 0,
                Value = 30,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "时长(分钟)：", _numDuration, row++);

            // 消耗热量
            _numCalories = new NumericUpDown
            {
                Minimum = 0,
                Maximum = 2000,
                DecimalPlaces = 0,
                Value = 200,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "消耗热量：", _numCalories, row++);

            // 运动强度
            _cmbIntensity = new ComboBox
            {
                Dock = DockStyle.Fill,
                DropDownStyle = ComboBoxStyle.DropDownList
            };
            _cmbIntensity.Items.AddRange(new object[] { "低", "中", "高" });
            _cmbIntensity.SelectedIndex = 1;
            AddFormRow(formPanel, "强度：", _cmbIntensity, row++);

            // 心率
            _numHeartRate = new NumericUpDown
            {
                Minimum = 0,
                Maximum = 220,
                DecimalPlaces = 0,
                Value = 0,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "心率(可选)：", _numHeartRate, row++);

            // 备注
            _txtNotes = new TextBox
            {
                Multiline = true,
                Height = 60,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "备注：", _txtNotes, row++);

            panel.Controls.Add(formPanel);

            // 保存按钮
            var btnSave = new Button
            {
                Text = "保存记录",
                Dock = DockStyle.Bottom,
                Height = 40,
                BackColor = Color.FromArgb(63, 81, 181),
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
                Text = "运动记录列表",
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
                    BackColor = Color.FromArgb(63, 81, 181),
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
                DataPropertyName = "ExerciseName",
                HeaderText = "运动",
                Width = 100
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "ExerciseType",
                HeaderText = "类型",
                Width = 80
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "Duration",
                HeaderText = "时长(分)",
                Width = 70
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "CaloriesBurned",
                HeaderText = "消耗热量",
                Width = 70
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "Intensity",
                HeaderText = "强度",
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
            if (string.IsNullOrWhiteSpace(_txtExerciseName.Text))
            {
                MessageBox.Show("请输入运动名称", "验证错误", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                _txtExerciseName.Focus();
                return;
            }

            try
            {
                var exercise = new Exercise
                {
                    UserId = _userId,
                    RecordDate = _dtpDate.Value,
                    ExerciseName = _txtExerciseName.Text.Trim(),
                    ExerciseType = _cmbExerciseType.SelectedItem?.ToString() ?? "有氧运动",
                    Duration = (int)_numDuration.Value,
                    CaloriesBurned = (double)_numCalories.Value,
                    Intensity = _cmbIntensity.SelectedItem?.ToString() ?? "中",
                    HeartRate = _numHeartRate.Value > 0 ? (int)_numHeartRate.Value : null,
                    Notes = string.IsNullOrWhiteSpace(_txtNotes.Text) ? null : _txtNotes.Text.Trim()
                };

                _dbManager.AddExercise(exercise);
                MessageBox.Show("运动记录保存成功！", "成功", MessageBoxButtons.OK, MessageBoxIcon.Information);

                // 清空表单
                _txtExerciseName.Clear();
                _numDuration.Value = 30;
                _numCalories.Value = 200;
                _numHeartRate.Value = 0;
                _txtNotes.Clear();

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
            var records = _dbManager.GetExercises(_userId);
            _dgvRecords.DataSource = records;
        }
    }
}
