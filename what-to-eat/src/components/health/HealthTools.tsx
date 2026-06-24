import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateBMI, getBMICategory, calculateDailyCalories } from '../../utils/format';

export const BMICalculator: React.FC = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<{ bmi: number; category: string } | null>(null);

  const calculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const bmi = calculateBMI(w, h);
      setResult({ bmi: Math.round(bmi * 10) / 10, category: getBMICategory(bmi) });
    }
  };

  const getBMIColor = (category: string) => {
    switch (category) {
      case '偏瘦':
        return { text: 'text-blue-600', bg: 'from-blue-50 to-indigo-50', bar: 'bg-blue-500' };
      case '正常':
        return { text: 'text-emerald-600', bg: 'from-emerald-50 to-teal-50', bar: 'bg-emerald-500' };
      case '偏胖':
        return { text: 'text-amber-600', bg: 'from-amber-50 to-orange-50', bar: 'bg-amber-500' };
      case '肥胖':
        return { text: 'text-rose-600', bg: 'from-rose-50 to-pink-50', bar: 'bg-rose-500' };
      default:
        return { text: 'text-gray-600', bg: 'from-gray-50 to-gray-100', bar: 'bg-gray-500' };
    }
  };

  const getBMIProgress = (bmi: number) => {
    if (bmi < 15) return 0;
    if (bmi > 35) return 100;
    return ((bmi - 15) / 20) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl">
          📏
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">BMI计算器</h3>
          <p className="text-xs text-gray-400">身体质量指数计算</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">身高 (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="请输入身高"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">体重 (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="请输入体重"
            className="input-field"
          />
        </div>
        
        <motion.button
          onClick={calculate}
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -1 }}
          className="w-full btn-primary"
        >
          计算BMI
        </motion.button>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl p-5 bg-gradient-to-br ${getBMIColor(result.category).bg}`}
            >
              <div className="text-center">
                <div className={`text-5xl font-bold mb-2 ${getBMIColor(result.category).text}`}>
                  {result.bmi}
                </div>
                <div className={`text-lg font-semibold ${getBMIColor(result.category).text}`}>
                  {result.category}
                </div>
                
                {/* BMI进度条 */}
                <div className="mt-4 px-2">
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getBMIProgress(result.bmi)}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className={`absolute top-0 left-0 h-full rounded-full ${getBMIColor(result.category).bar}`}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                    <span>15</span>
                    <span>18.5</span>
                    <span>24</span>
                    <span>28</span>
                    <span>35</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/50">
                  <p className="text-xs text-gray-500">
                    正常范围：<span className="font-medium text-gray-700">18.5 - 23.9</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export const CalorieCalculator: React.FC = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age);
    if (h > 0 && w > 0 && a > 0) {
      const calories = calculateDailyCalories(w, h, a, gender, activity);
      setResult(Math.round(calories));
    }
  };

  const activityOptions = [
    { value: 'low', label: '久坐', desc: '很少运动' },
    { value: 'moderate', label: '适度', desc: '每周3-5次' },
    { value: 'high', label: '活跃', desc: '每天运动' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card p-5"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-xl">
          🔥
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">每日热量需求</h3>
          <p className="text-xs text-gray-400">估算每日所需卡路里</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">身高 (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="身高"
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">体重 (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="体重"
              className="input-field text-sm"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">年龄</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="请输入年龄"
            className="input-field"
          />
        </div>
        
        {/* 性别选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">性别</label>
          <div className="flex gap-2">
            {['male', 'female'].map((g) => {
              const isActive = gender === g;
              return (
                <motion.button
                  key={g}
                  onClick={() => setGender(g as 'male' | 'female')}
                  whileTap={{ scale: 0.97 }}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-glow'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {g === 'male' ? '👨 男' : '👩 女'}
                </motion.button>
              );
            })}
          </div>
        </div>
        
        {/* 活动水平 */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">活动水平</label>
          <div className="grid grid-cols-3 gap-2">
            {activityOptions.map((opt) => {
              const isActive = activity === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  onClick={() => setActivity(opt.value as 'low' | 'moderate' | 'high')}
                  whileTap={{ scale: 0.97 }}
                  className={`py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-sm font-semibold">{opt.label}</div>
                  <div className={`text-[10px] mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                    {opt.desc}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
        
        <motion.button
          onClick={calculate}
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -1 }}
          className="w-full btn-primary"
        >
          计算热量需求
        </motion.button>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl p-5 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/50"
            >
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">每日所需热量</div>
                <div className="text-4xl font-bold text-gradient">
                  {result}
                </div>
                <div className="text-sm text-gray-500 mt-1">千卡 / kcal</div>
                
                <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-white/50">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-800">{Math.round(result * 0.8)}</p>
                    <p className="text-xs text-gray-400">减脂</p>
                  </div>
                  <div className="w-px bg-gray-200" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{result}</p>
                    <p className="text-xs text-gray-400">维持</p>
                  </div>
                  <div className="w-px bg-gray-200" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-800">{Math.round(result * 1.2)}</p>
                    <p className="text-xs text-gray-400">增肌</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BMICalculator;
