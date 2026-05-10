import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NutritionCarousel, PrinciplesGrid, FoodLibrary, WeeklyPlanViewer } from '../components/health/HealthComponents';
import { BMICalculator, CalorieCalculator } from '../components/health/HealthTools';
import { nutritionTips, healthyFoods, weeklyPlan } from '../data/healthyFoods';

type TabType = 'knowledge' | 'foods' | 'plan' | 'tools';

const HealthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('knowledge');
  const [selectedPrinciple, setSelectedPrinciple] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'knowledge', label: '知识科普', icon: '📖' },
    { id: 'foods', label: '食材库', icon: '🥗' },
    { id: 'plan', label: '食谱示例', icon: '📅' },
    { id: 'tools', label: '工具箱', icon: '🧮' },
  ];

  const handleFavoriteToggle = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const getPrincipleContent = (id: string | null) => {
    if (!id) return null;
    const contents: Record<string, { title: string; tips: string[] }> = {
      oil: { title: '少油饮食建议', tips: ['每日烹调油摄入量不超过25-30克', '多采用蒸、煮、炖、拌等烹调方式', '减少煎、炸等高温烹调', '选择植物油如橄榄油、菜籽油', '避免反复使用同一锅油'] },
      salt: { title: '少盐饮食建议', tips: ['每日食盐用量不超过5克', '少放酱油、蚝油等含盐调味品', '使用限盐勺控制用量', '多吃新鲜蔬菜水果', '避免咸菜、腌制品等高盐食物'] },
      sugar: { title: '少糖饮食建议', tips: ['每日添加糖摄入量不超过25克', '少喝含糖饮料和果汁', '烹调时少放糖', '选择无糖或低糖食品', '多吃天然甜味水果代替甜食'] },
      fiber: { title: '高纤维饮食建议', tips: ['每日膳食纤维摄入量应大于25克', '多吃全谷物和杂粮', '每天吃够500克蔬菜', '水果连皮一起吃', '可适当补充膳食纤维制剂'] },
      protein: { title: '优质蛋白摄入建议', tips: ['蛋白质占总能量的15%-20%', '每天适量摄入鱼、禽、蛋、瘦肉', '每天喝300ml牛奶或等量奶制品', '大豆及其制品是优质植物蛋白', '注意蛋白质的合理搭配'] },
      gi: { title: '低GI主食选择', tips: ['优选全谷物如燕麦、荞麦、糙米', '杂粮替代部分精白米面', '注意食物的烹饪方式', '搭配蔬菜和蛋白质一起吃', '避免加工过细的谷物食品'] },
    };
    return contents[id] || null;
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 pt-12 pb-8">
        <h1 className="text-2xl font-bold mb-1">健康饮食</h1>
        <p className="text-white/80 text-sm">参考《成人糖尿病食养指南》</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        <div className="bg-white rounded-card p-1 card-shadow flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-green-500 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'knowledge' && (
            <motion.div key="knowledge" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <NutritionCarousel tips={nutritionTips} />
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">饮食原则</h2>
                <PrinciplesGrid onSelect={(id) => setSelectedPrinciple(id)} />
              </div>
              <AnimatePresence>
                {selectedPrinciple && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white rounded-card p-4 card-shadow">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-800">{getPrincipleContent(selectedPrinciple)?.title}</h3>
                      <button onClick={() => setSelectedPrinciple(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    <ul className="space-y-2">
                      {getPrincipleContent(selectedPrinciple)?.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-green-500 mt-0.5">✓</span>{tip}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="bg-yellow-50 border border-yellow-200 rounded-card p-4 text-sm text-yellow-800">
                <p className="font-medium mb-1">⚠️ 免责声明</p>
                <p className="text-yellow-700/80">本内容仅供参考，不能替代专业医疗建议。如有健康问题，请咨询医生或营养师。</p>
              </div>
            </motion.div>
          )}
          {activeTab === 'foods' && (
            <motion.div key="foods" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <FoodLibrary foods={healthyFoods} favorites={favorites} onFavoriteToggle={handleFavoriteToggle} />
            </motion.div>
          )}
          {activeTab === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <WeeklyPlanViewer plan={weeklyPlan} />
            </motion.div>
          )}
          {activeTab === 'tools' && (
            <motion.div key="tools" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <BMICalculator />
              <CalorieCalculator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HealthPage;
