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
    <div className="min-h-screen pb-20 bg-background">
      {/* 头部区域 */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400" />
        <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-12 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute top-20 right-12 w-20 h-20 rounded-full bg-white/10 blur-xl" />
        
        <div className="relative px-4 pt-12 pb-24">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 mb-1"
          >
            <span className="text-2xl">🥗</span>
            <span className="text-white/70 text-sm font-medium">健康生活</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl font-bold text-white tracking-tight"
          >
            健康饮食
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/70 text-sm mt-1"
          >
            参考《成人糖尿病食养指南》科学饮食
          </motion.p>
        </div>
        
        {/* 底部弧形装饰 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 text-background">
            <path
              d="M0 48H1440V0C1440 0 1080 48 720 48C360 48 0 0 0 0V48Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-10 space-y-4">
        {/* Tab导航 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="card p-1.5 flex gap-1"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.97 }}
                className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="healthTabBg"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/30"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'knowledge' && (
            <motion.div key="knowledge" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <NutritionCarousel tips={nutritionTips} />
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3">饮食原则</h2>
                <PrinciplesGrid onSelect={(id) => setSelectedPrinciple(id)} />
              </div>
              <AnimatePresence>
                {selectedPrinciple && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }} 
                    animate={{ opacity: 1, height: 'auto', y: 0 }} 
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="card p-5 overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800 text-lg">{getPrincipleContent(selectedPrinciple)?.title}</h3>
                      <button 
                        onClick={() => setSelectedPrinciple(null)} 
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <ul className="space-y-3">
                      {getPrincipleContent(selectedPrinciple)?.tips.map((tip, i) => (
                        <motion.li 
                          key={i} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3 text-sm text-gray-600"
                        >
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                            {i + 1}
                          </span>
                          <span className="pt-0.5">{tip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* 免责声明 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600">!</span>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">免责声明</p>
                    <p className="text-amber-700/70 text-xs mt-1 leading-relaxed">
                      本内容仅供参考，不能替代专业医疗建议。如有健康问题，请咨询医生或营养师。
                    </p>
                  </div>
                </div>
              </motion.div>
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
