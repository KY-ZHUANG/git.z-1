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
        return 'text-blue-500';
      case '正常':
        return 'text-green-500';
      case '偏胖':
        return 'text-yellow-500';
      case '肥胖':
        return 'text-red-500';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-card p-4 card-shadow">
      <h3 className="font-semibold text-gray-800 mb-4">BMI计算器</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">身高 (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="请输入身高"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">体重 (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="请输入体重"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <button
          onClick={calculate}
          className="w-full btn-primary"
        >
          计算BMI
        </button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-4 bg-gray-50 rounded-lg"
            >
              <div className={`text-4xl font-bold mb-2 ${getBMIColor(result.category)}`}>
                {result.bmi}
              </div>
              <div className="text-gray-600">{result.category}</div>
              <div className="text-xs text-gray-400 mt-2">
                正常范围：18.5 - 23.9
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
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
      setResult(calories);
    }
  };

  return (
    <div className="bg-white rounded-card p-4 card-shadow">
      <h3 className="font-semibold text-gray-800 mb-4">每日热量需求</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">身高 (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">体重 (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">年龄</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-2">性别</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={gender === 'male'}
                onChange={() => setGender('male')}
                className="accent-primary"
              />
              <span>男</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={gender === 'female'}
                onChange={() => setGender('female')}
                className="accent-primary"
              />
              <span>女</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-2">活动水平</label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as 'low' | 'moderate' | 'high')}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
          >
            <option value="low">久坐（很少运动）</option>
            <option value="moderate">适度（每周运动3-5次）</option>
            <option value="high">活跃（每天运动）</option>
          </select>
        </div>
        <button onClick={calculate} className="w-full btn-primary">
          计算
        </button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-4 bg-orange-50 rounded-lg"
            >
              <div className="text-2xl font-bold text-primary">{result} kcal</div>
              <div className="text-sm text-gray-500 mt-1">每日所需热量</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BMICalculator;
