using AIHealthDiary.Data;
using AIHealthDiary.Models;

namespace AIHealthDiary.Forms
{
    /// <summary>
    /// 用户管理窗体，用于添加和编辑用户信息
    /// </summary>
    public partial class UserForm : Form
    {
        /// <summary>
        /// 数据库管理器实例
        /// </summary>
        private readonly DatabaseManager _dbManager;

        /// <summary>
        /// 要编辑的用户（新增时为null）
        /// </summary>
        private readonly User? _editUser;

        // 表单控件
        private TextBox _txtName = null!;
        private ComboBox _cmbGender = null!;
        private NumericUpDown _numAge = null!;
        private NumericUpDown _numHeight = null!;
        private NumericUpDown _numWeight = null!;

        /// <summary>
        /// 构造函数 - 添加新用户
        /// </summary>
        /// <param name="dbManager">数据库管理器</param>
        public UserForm(DatabaseManager dbManager)
        {
            _dbManager = dbManager;
            InitializeComponent();
        }

        /// <summary>
        /// 构造函数 - 编辑现有用户
        /// </summary>
        /// <param name="dbManager">数据库管理器</param>
        /// <param name="user">要编辑的用户</param>
        public UserForm(DatabaseManager dbManager, User user) : this(dbManager)
        {
            _editUser = user;
            LoadUserData();
        }

        /// <summary>
        /// 初始化窗体组件
        /// </summary>
        private void InitializeComponent()
        {
            this.Text = _editUser == null ? "添加用户" : "编辑用户";
            this.Size = new Size(450, 400);
            this.StartPosition = FormStartPosition.CenterParent;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.BackColor = Color.White;
            this.Font = new Font("Microsoft YaHei", 10F);

            int startY = 30;
            int labelX = 50;
            int controlX = 150;
            int lineHeight = 50;

            // 姓名
            var lblName = new Label
            {
                Text = "姓名：",
                Location = new Point(labelX, startY),
                Size = new Size(80, 25),
                TextAlign = ContentAlignment.MiddleRight
            };
            this.Controls.Add(lblName);

            _txtName = new TextBox
            {
                Location = new Point(controlX, startY),
                Size = new Size(200, 25)
            };
            this.Controls.Add(_txtName);

            // 性别
            startY += lineHeight;
            var lblGender = new Label
            {
                Text = "性别：",
                Location = new Point(labelX, startY),
                Size = new Size(80, 25),
                TextAlign = ContentAlignment.MiddleRight
            };
            this.Controls.Add(lblGender);

            _cmbGender = new ComboBox
            {
                Location = new Point(controlX, startY),
                Size = new Size(200, 25),
                DropDownStyle = ComboBoxStyle.DropDownList
            };
            _cmbGender.Items.AddRange(new object[] { "男", "女" });
            _cmbGender.SelectedIndex = 0;
            this.Controls.Add(_cmbGender);

            // 年龄
            startY += lineHeight;
            var lblAge = new Label
            {
                Text = "年龄：",
                Location = new Point(labelX, startY),
                Size = new Size(80, 25),
                TextAlign = ContentAlignment.MiddleRight
            };
            this.Controls.Add(lblAge);

            _numAge = new NumericUpDown
            {
                Location = new Point(controlX, startY),
                Size = new Size(200, 25),
                Minimum = 1,
                Maximum = 150,
                Value = 25
            };
            this.Controls.Add(_numAge);

            // 身高
            startY += lineHeight;
            var lblHeight = new Label
            {
                Text = "身高(cm)：",
                Location = new Point(labelX, startY),
                Size = new Size(80, 25),
                TextAlign = ContentAlignment.MiddleRight
            };
            this.Controls.Add(lblHeight);

            _numHeight = new NumericUpDown
            {
                Location = new Point(controlX, startY),
                Size = new Size(200, 25),
                Minimum = 50,
                Maximum = 250,
                DecimalPlaces = 1,
                Value = 170
            };
            this.Controls.Add(_numHeight);

            // 体重
            startY += lineHeight;
            var lblWeight = new Label
            {
                Text = "体重(kg)：",
                Location = new Point(labelX, startY),
                Size = new Size(80, 25),
                TextAlign = ContentAlignment.MiddleRight
            };
            this.Controls.Add(lblWeight);

            _numWeight = new NumericUpDown
            {
                Location = new Point(controlX, startY),
                Size = new Size(200, 25),
                Minimum = 20,
                Maximum = 300,
                DecimalPlaces = 1,
                Value = 65
            };
            this.Controls.Add(_numWeight);

            // 按钮
            startY += lineHeight + 20;
            var btnSave = new Button
            {
                Text = "保存",
                Location = new Point(controlX, startY),
                Size = new Size(90, 35),
                BackColor = Color.FromArgb(0, 150, 136),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat
            };
            btnSave.FlatAppearance.BorderSize = 0;
            btnSave.Click += BtnSave_Click;
            this.Controls.Add(btnSave);

            var btnCancel = new Button
            {
                Text = "取消",
                Location = new Point(controlX + 110, startY),
                Size = new Size(90, 35),
                BackColor = Color.Gray,
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat
            };
            btnCancel.FlatAppearance.BorderSize = 0;
            btnCancel.Click += (s, e) => this.DialogResult = DialogResult.Cancel;
            this.Controls.Add(btnCancel);
        }

        /// <summary>
        /// 加载用户数据到表单（编辑模式）
        /// </summary>
        private void LoadUserData()
        {
            if (_editUser == null) return;

            _txtName.Text = _editUser.Name;
            _cmbGender.SelectedItem = _editUser.Gender;
            _numAge.Value = _editUser.Age;
            _numHeight.Value = (decimal)_editUser.Height;
            _numWeight.Value = (decimal)_editUser.Weight;
        }

        /// <summary>
        /// 保存按钮点击事件
        /// </summary>
        private void BtnSave_Click(object? sender, EventArgs e)
        {
            // 验证输入
            if (string.IsNullOrWhiteSpace(_txtName.Text))
            {
                MessageBox.Show("请输入姓名", "验证错误", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                _txtName.Focus();
                return;
            }

            try
            {
                var user = new User
                {
                    Id = _editUser?.Id ?? 0,
                    Name = _txtName.Text.Trim(),
                    Gender = _cmbGender.SelectedItem?.ToString() ?? "男",
                    Age = (int)_numAge.Value,
                    Height = (double)_numHeight.Value,
                    Weight = (double)_numWeight.Value
                };

                if (_editUser == null)
                {
                    // 添加新用户
                    _dbManager.AddUser(user);
                    MessageBox.Show("用户添加成功！", "成功", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                else
                {
                    // 更新用户
                    _dbManager.UpdateUser(user);
                    MessageBox.Show("用户更新成功！", "成功", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }

                this.DialogResult = DialogResult.OK;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"保存失败：{ex.Message}", "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
