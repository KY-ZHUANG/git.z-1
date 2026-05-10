import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Recommendation, Recipe } from '../types';
import { RecommendationDisplay, InitialState, LoadingState } from '../components/recommendation/RecommendationCard';
import { formatDate } from '../utils/format';
import { loadRecipes, saveRecommendation, getRecommendationHistory, deleteRecommendation } from '../utils/storage';
import { LOADING_MESSAGES } from '../utils/constants';

const RecommendationPage: React.FC = () => {
  const [state, setState] = useState<'initial' | 'loading' | 'result'>('initial');
  const [currentRecommendation, setCurrentRecommendation] = useState<Recommendation | null>(null);
  const [history, setHistory] = useState<Recommendation[]>([]);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [rerollCount, setRerollCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setHistory(getRecommendationHistory());
  }, []);

  const generateRecommendation = useCallback(() => {
    setState('loading');
    setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);

    const recipes = loadRecipes();
    const meatRecipes = recipes.filter((r: Recipe) => r.category === 'meat');
    const vegRecipes = recipes.filter((r: Recipe) => r.category === 'vegetable');

    if (meatRecipes.length < 1 || vegRecipes.length < 2) {
      alert('菜谱库食材不足，请先添加更多菜谱！');
      setState('initial');
      return;
    }

    setTimeout(() => {
      const shuffledMeat = [...meatRecipes].sort(() => Math.random() - 0.5);
      const shuffledVeg = [...vegRecipes].sort(() => Math.random() - 0.5);

      const pick1 = shuffledVeg[0];
      const pick2 = shuffledVeg[1];
      const pick3 = shuffledMeat[0];

      const combo = [pick1, pick2, pick3].sort(() => Math.random() - 0.5);
      const hour = new Date().getHours();
      const mealType = hour >= 5 && hour < 10 ? 'breakfast' : hour >= 10 && hour < 14 ? 'lunch' : hour >= 17 && hour < 21 ? 'dinner' : 'lunch';

      const recommendation: Recommendation = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        date: Date.now(),
        recipes: [combo[0], combo[1], combo[2]],
        isFavorite: false,
        note: '',
        mealType: mealType as 'breakfast' | 'lunch' | 'dinner',
      };

      setCurrentRecommendation(recommendation);
      setState('result');
      setRerollCount(0);
    }, 1500);
  }, []);

  const handleReroll = () => {
    setRerollCount((prev) => prev + 1);
    generateRecommendation();
  };

  const handleFavorite = () => {
    if (currentRecommendation) {
      const updated = {
        ...currentRecommendation,
        isFavorite: !currentRecommendation.isFavorite,
      };
      setCurrentRecommendation(updated);
      saveRecommendation(updated);
      setHistory(getRecommendationHistory());
    }
  };

  const handleDeleteHistory = (id: string) => {
    deleteRecommendation(id);
    setHistory(getRecommendationHistory());
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-orange-50 to-background">
      <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 pt-12 pb-8">
        <h1 className="text-2xl font-bold mb-1">今日推荐</h1>
        <p className="text-white/80 text-sm">
          {state === 'result' ? '为你精心搭配的三餐' : '点击按钮，帮你决定今天吃什么'}
        </p>
      </div>

      <div className="px-4 -mt-4">
        <AnimatePresence mode="wait">
          {state === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <InitialState onStart={generateRecommendation} loading={false} />
            </motion.div>
          )}

          {state === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState message={loadingMessage} />
            </motion.div>
          )}

          {state === 'result' && currentRecommendation && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {rerollCount >= 3 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-card p-3 text-sm text-yellow-800 text-center">
                  已经推荐了{rerollCount + 1}次啦，要不要换个口味试试？
                </div>
              )}

              <RecommendationDisplay
                recommendation={currentRecommendation}
                onReroll={handleReroll}
                onFavorite={handleFavorite}
                isFavorite={currentRecommendation.isFavorite}
              />

              <div className="pt-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full py-2 text-center text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  {showHistory ? '收起历史记录' : '查看历史推荐'}
                </button>

                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 mt-4"
                  >
                    {history.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">暂无历史记录</div>
                    ) : (
                      history.slice(0, 5).map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-white rounded-card p-3 card-shadow flex items-center gap-3"
                        >
                          <div className="flex-1 cursor-pointer" onClick={() => {
                            setCurrentRecommendation(rec);
                            setState('result');
                          }}>
                            <p className="text-sm text-gray-500">{formatDate(rec.date)}</p>
                            <p className="text-gray-800 font-medium truncate">
                              {rec.recipes.map((r: Recipe) => r.name).join(' + ')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteHistory(rec.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            删除
                          </button>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecommendationPage;
