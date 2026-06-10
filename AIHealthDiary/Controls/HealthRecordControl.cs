using AIHealthDiary.Data;
using AIHealthDiary.Models;

namespace AIHealthDiary.Controls
{
    /// <summary>
    /// 健康记录管理控件，用于添加和查看健康数据
    /// </summary>
    public partial class HealthRecordControl : UserControl
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
        private NumericUpDown _numWeight = null!;
        private NumericUpDown _numSleep = null!;
        private NumericUpDown _numSystolic = null!;
        private NumericUpDown _numDiastolic = null!;
        private NumericUpDown _numHeartRate = null!;
        private TextBox _txtNotes = null!;
        private DataGridView _dgvRecords = null!;

        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="dbManager">数据库管理器</param>
        /// <param name="userId">用户ID</param>
        public HealthRecordControl(DatabaseManager dbManager, int userId)
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
                Text = "添加健康记录",
                Font = new Font("Microsoft YaHei", 14F, FontStyle.Bold),
                Dock = DockStyle.Top,
                Height = 40
            };
            panel.Controls.Add(titleLabel);

            var formPanel = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 2,
                RowCount = 7,
                Padding = new Padding(10, 60, 10, 10),
                AutoScroll = true,
                Margin = new Padding(0, 20, 0, 0)
            };
            formPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 120F));
            formPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));
            
            // 设置行高
            for (int i = 0; i < 7; i++)
            {
                formPanel.RowStyles.Add(new RowStyle(SizeType.Absolute, 50F));
            }

            int row = 0;

            // 日期
            AddFormRow(formPanel, "日期：", CreateDatePicker(), row++);

            // 体重
            _numWeight = new NumericUpDown
            {
                Minimum = 20,
                Maximum = 300,
                DecimalPlaces = 1,
                Value = 65,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "体重(kg)：", _numWeight, row++);

            // 睡眠
            _numSleep = new NumericUpDown
            {
                Minimum = 0,
                Maximum = 24,
                DecimalPlaces = 1,
                Value = 8,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "睡眠(小时)：", _numSleep, row++);

            // 收缩压
            _numSystolic = new NumericUpDown
            {
                Minimum = 50,
                Maximum = 250,
                Value = 120,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "收缩压：", _numSystolic, row++);

            // 舒张压
            _numDiastolic = new NumericUpDown
            {
                Minimum = 30,
                Maximum = 150,
                Value = 80,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "舒张压：", _numDiastolic, row++);

            // 心率
            _numHeartRate = new NumericUpDown
            {
                Minimum = 30,
                Maximum = 200,
                Value = 70,
                Dock = DockStyle.Fill
            };
            AddFormRow(formPanel, "心率：", _numHeartRate, row++);

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
                BackColor = Color.FromArgb(0, 150, 136),
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
        /// 创建日期选择器
        /// </summary>
        private DateTimePicker CreateDatePicker()
        {
            _dtpDate = new DateTimePicker
            {
                Format = DateTimePickerFormat.Short,
                Dock = DockStyle.Fill,
                Value = DateTime.Now
            };
            return _dtpDate;
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
                Text = "历史记录",
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
                    BackColor = Color.FromArgb(0, 150, 136),
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
                Width = 100,
                DefaultCellStyle = { Format = "yyyy-MM-dd" }
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "Weight",
                HeaderText = "体重(kg)",
                Width = 80
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "SleepHours",
                HeaderText = "睡眠(h)",
                Width = 70
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "SystolicPressure",
                HeaderText = "收缩压",
                Width = 70
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "DiastolicPressure",
                HeaderText = "舒张压",
                Width = 70
            });
            _dgvRecords.Columns.Add(new DataGridViewTextBoxColumn
            {
                DataPropertyName = "HeartRate",
                HeaderText = "心率",
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
            try
            {
                var record = new HealthRecord
                {
                    UserId = _userId,
                    RecordDate = _dtpDate.Value,
                    Weight = (double)_numWeight.Value,
                    SleepHours = (double)_numSleep.Value,
                    SystolicPressure = (int)_numSystolic.Value,
                    DiastolicPressure = (int)_numDiastolic.Value,
                    HeartRate = (int)_numHeartRate.Value,
                    Notes = _txtNotes.Text
                };

                _dbManager.AddHealthRecord(record);
                MessageBox.Show("记录保存成功！", "成功", MessageBoxButtons.OK, MessageBoxIcon.Information);

                // 清空表单
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
            var records = _dbManager.GetHealthRecords(_userId);
            _dgvRecords.DataSource = records;
        }
    }
}
