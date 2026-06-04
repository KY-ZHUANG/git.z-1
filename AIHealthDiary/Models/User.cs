namespace AIHealthDiary.Models
{
    /// <summary>
    /// 用户实体类，存储用户基础信息
    /// </summary>
    public class User
    {
        /// <summary>
        /// 用户唯一标识ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// 用户姓名
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// 用户性别（男/女）
        /// </summary>
        public string Gender { get; set; } = string.Empty;

        /// <summary>
        /// 用户年龄
        /// </summary>
        public int Age { get; set; }

        /// <summary>
        /// 用户身高（单位：厘米）
        /// </summary>
        public double Height { get; set; }

        /// <summary>
        /// 用户当前体重（单位：千克）
        /// </summary>
        public double Weight { get; set; }

        /// <summary>
        /// 用户创建时间
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// 计算BMI指数（身体质量指数）
        /// BMI = 体重(kg) / 身高(m)²
        /// </summary>
        /// <returns>BMI数值</returns>
        public double CalculateBMI()
        {
            if (Height <= 0) return 0;
            double heightInMeters = Height / 100;
            return Weight / (heightInMeters * heightInMeters);
        }

        /// <summary>
        /// 获取BMI分类描述
        /// </summary>
        /// <returns>BMI分类文字描述</returns>
        public string GetBMICategory()
        {
            double bmi = CalculateBMI();
            return bmi switch
            {
                < 18.5 => "偏瘦",
                < 24 => "正常",
                < 28 => "偏胖",
                _ => "肥胖"
            };
        }

        /// <summary>
        /// 计算基础代谢率（BMR）
        /// 使用Mifflin-St Jeor公式
        /// </summary>
        /// <returns>基础代谢率（千卡/天）</returns>
        public double CalculateBMR()
        {
            if (Gender.ToLower() == "男")
            {
                return 10 * Weight + 6.25 * Height - 5 * Age + 5;
            }
            else
            {
                return 10 * Weight + 6.25 * Height - 5 * Age - 161;
            }
        }
    }
}
