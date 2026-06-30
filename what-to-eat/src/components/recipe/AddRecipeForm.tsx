import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import type { Recipe, Ingredient } from '../../types';
import { addRecipe, generateId } from '../../utils/storage';
import { getRecipeImage } from '../../utils/image';

const CATEGORIES = [
  { id: 'meat', name: '荤菜', icon: '🥩' },
  { id: 'vegetable', name: '素菜', icon: '🥬' },
  { id: 'dessert', name: '甜品', icon: '🍰' },
] as const;

const DIFFICULTY_OPTIONS = [
  { id: 'easy', name: '简单', color: 'text-green-500' },
  { id: 'medium', name: '中等', color: 'text-orange-500' },
  { id: 'hard', name: '困难', color: 'text-red-500' },
] as const;

const SUGGESTED_TAGS = ['快手菜', '下饭菜', '宴客菜', '家常菜', '减脂餐', '宝宝爱吃', '懒人必备'];

const AddRecipeForm: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'meat' | 'vegetable' | 'dessert'>('meat');
  const [image, setImage] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [time, setTime] = useState(30);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [tags, setTags] = useState<string[]>([]);
  const [calories, setCalories] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('请输入菜名');
      return;
    }

    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) {
      alert('请至少添加一种食材');
      return;
    }

    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length === 0) {
      alert('请至少添加一个步骤');
      return;
    }

    setIsSubmitting(true);

    const newId = generateId();
    const newRecipe: Recipe = {
      id: newId,
      name: name.trim(),
      category,
      image: image.trim() || getRecipeImage(newId, name.trim()),
      ingredients: validIngredients,
      steps: validSteps,
      time,
      difficulty,
      tags,
      calories,
      isFavorite: false,
      createdAt: Date.now(),
    };

    addRecipe(newRecipe);
    
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 pt-12 pb-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">添加菜谱</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* 基本信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-800">基本信息</h2>
          
          {/* 菜名 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              菜名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：红烧肉"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          {/* 分类 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                    category === cat.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl mr-1">{cat.icon}</span>
                  <span className="text-sm">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 图片URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              图片链接（可选）
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="留空将自动生成图片"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            {image && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <img src={image} alt="预览" className="w-full h-32 object-cover" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
              </div>
            )}
          </div>

          {/* 烹饪时间和难度 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                烹饪时间（分钟）
              </label>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                卡路里（可选）
              </label>
              <input
                type="number"
                value={calories ?? ''}
                onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : undefined)}
                min={0}
                placeholder="kcal"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* 难度 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">难度</label>
            <div className="flex gap-3">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDifficulty(opt.id)}
                  className={`flex-1 py-2 rounded-xl border-2 transition-all ${
                    difficulty === opt.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${difficulty === opt.id ? opt.color : 'text-gray-600'}`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* 标签 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    tags.includes(tag)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 食材 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              食材 <span className="text-red-500">*</span>
            </h2>
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center gap-1 text-primary text-sm font-medium hover:text-primary-light transition-colors"
            >
              <Plus size={18} />
              添加
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  placeholder="食材名称"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-sm"
                />
                <input
                  type="text"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                  placeholder="用量"
                  className="w-24 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-sm"
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* 步骤 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              步骤 <span className="text-red-500">*</span>
            </h2>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-1 text-primary text-sm font-medium hover:text-primary-light transition-colors"
            >
              <Plus size={18} />
              添加
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-2 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center mt-2">
                  {index + 1}
                </span>
                <textarea
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  placeholder={`第${index + 1}步`}
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-sm resize-none"
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors mt-1"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* 提交按钮 */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-lg transition-all ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary to-primary-light hover:shadow-xl active:scale-[0.98]'
          }`}
        >
          {isSubmitting ? '保存中...' : '保存菜谱'}
        </motion.button>
      </form>
    </div>
  );
};

export default AddRecipeForm;
