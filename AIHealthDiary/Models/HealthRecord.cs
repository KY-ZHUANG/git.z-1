namespace AIHealthDiary.Models
{
    /// <summary>
    /// 健康记录实体类，存储每日健康数据
    /// </summary>
    public class HealthRecord
    {
        /// <summary>
        /// 记录唯一标识ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// 关联的用户ID
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// 记录日期
        /// </summary>
        public DateTime RecordDate { get; set; }

        /// <summary>
        /// 当日体重（单位：千克）
        /// </summary>
        public double Weight { get; set; }

        /// <summary>
        /// 睡眠时间（单位：小时）
        /// </summary>
        public double SleepHours { get; set; }

        /// <summary>
        /// 收缩压（高压）
        /// </summary>
        public int SystolicPressure { get; set; }

        /// <summary>
        /// 舒张压（低压）
        /// </summary>
        public int DiastolicPressure { get; set; }

        /// <summary>
        /// 心率（次/分钟）
        /// </summary>
        public int HeartRate { get; set; }

        /// <summary>
        /// 备注信息
        /// </summary>
        public string? Notes { get; set; }

        /// <summary>
        /// 记录创建时间
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// 获取血压状态描述
        /// </summary>
        /// <returns>血压状态文字描述</returns>
        public string GetBloodPressureStatus()
        {
            if (SystolicPressure < 90 || DiastolicPressure < 60)
                return "低血压";
            if (SystolicPressure <= 120 && DiastolicPressure <= 80)
                return "正常";
            if (SystolicPressure <= 140 && DiastolicPressure <= 90)
                return "正常高值";
            return "高血压";
        }

        /// <summary>
        /// 获取睡眠质量评价
        /// </summary>
        /// <returns>睡眠质量文字描述</returns>
        public string GetSleepQuality()
        {
            return SleepHours switch
            {
                < 6 => "睡眠不足",
                < 7 => "偏少",
                <= 9 => "良好",
                _ => "过多"
            };
        }
    }
}
