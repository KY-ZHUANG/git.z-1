namespace AIHealthDiary.Models
{
    /// <summary>
    /// 运动记录实体类，存储每日运动信息
    /// </summary>
    public class Exercise
    {
        /// <summary>
        /// 运动记录唯一标识ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// 关联的用户ID
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// 运动记录日期
        /// </summary>
        public DateTime RecordDate { get; set; }

        /// <summary>
        /// 运动项目名称
        /// </summary>
        public string ExerciseName { get; set; } = string.Empty;

        /// <summary>
        /// 运动类型（有氧运动/力量训练/柔韧性/其他）
        /// </summary>
        public string ExerciseType { get; set; } = string.Empty;

        /// <summary>
        /// 运动持续时间（分钟）
        /// </summary>
        public int Duration { get; set; }

        /// <summary>
        /// 消耗热量（千卡）
        /// </summary>
        public double CaloriesBurned { get; set; }

        /// <summary>
        /// 运动强度（低/中/高）
        /// </summary>
        public string Intensity { get; set; } = string.Empty;

        /// <summary>
        /// 运动时心率（次/分钟）
        /// </summary>
        public int? HeartRate { get; set; }

        /// <summary>
        /// 运动备注
        /// </summary>
        public string? Notes { get; set; }

        /// <summary>
        /// 记录创建时间
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// 计算运动效率（每分钟消耗热量）
        /// </summary>
        /// <returns>每分钟消耗热量</returns>
        public double GetEfficiency()
        {
            if (Duration <= 0) return 0;
            return CaloriesBurned / Duration;
        }

        /// <summary>
        /// 获取运动强度等级数值（用于计算）
        /// </summary>
        /// <returns>强度等级 1-3</returns>
        public int GetIntensityLevel()
        {
            return Intensity.ToLower() switch
            {
                "低" or "low" => 1,
                "中" or "medium" => 2,
                "高" or "high" => 3,
                _ => 2
            };
        }
    }
}
