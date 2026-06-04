namespace AIHealthDiary.Models
{
    /// <summary>
    /// 饮食记录实体类，存储每日饮食信息
    /// </summary>
    public class Diet
    {
        /// <summary>
        /// 饮食记录唯一标识ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// 关联的用户ID
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// 饮食记录日期
        /// </summary>
        public DateTime RecordDate { get; set; }

        /// <summary>
        /// 餐次类型（早餐/午餐/晚餐/加餐）
        /// </summary>
        public string MealType { get; set; } = string.Empty;

        /// <summary>
        /// 食物名称
        /// </summary>
        public string FoodName { get; set; } = string.Empty;

        /// <summary>
        /// 食物份量（克）
        /// </summary>
        public double Portion { get; set; }

        /// <summary>
        /// 热量（千卡）
        /// </summary>
        public double Calories { get; set; }

        /// <summary>
        /// 蛋白质含量（克）
        /// </summary>
        public double Protein { get; set; }

        /// <summary>
        /// 碳水化合物含量（克）
        /// </summary>
        public double Carbohydrates { get; set; }

        /// <summary>
        /// 脂肪含量（克）
        /// </summary>
        public double Fat { get; set; }

        /// <summary>
        /// 膳食纤维（克）
        /// </summary>
        public double Fiber { get; set; }

        /// <summary>
        /// 记录创建时间
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// 获取营养素占比描述
        /// </summary>
        /// <returns>营养素占比字符串</returns>
        public string GetNutritionRatio()
        {
            double total = Protein + Carbohydrates + Fat;
            if (total == 0) return "无数据";

            double proteinPct = Protein / total * 100;
            double carbPct = Carbohydrates / total * 100;
            double fatPct = Fat / total * 100;

            return $"蛋白质:{proteinPct:F1}% 碳水:{carbPct:F1}% 脂肪:{fatPct:F1}%";
        }
    }
}
