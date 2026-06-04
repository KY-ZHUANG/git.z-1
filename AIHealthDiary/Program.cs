namespace AIHealthDiary
{
    /// <summary>
    /// 应用程序入口类
    /// </summary>
    internal static class Program
    {
        /// <summary>
        /// 应用程序的主入口点
        /// </summary>
        [STAThread]
        static void Main()
        {
            // 启用视觉样式，使控件呈现现代化外观
            Application.EnableVisualStyles();
            
            // 设置兼容的文本渲染方式
            Application.SetCompatibleTextRenderingDefault(false);
            
            // 运行主窗体
            Application.Run(new MainForm());
        }
    }
}
