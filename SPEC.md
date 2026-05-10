# 今天吃什么 - 饮食App规范文档

## 1. Concept & Vision

"今天吃什么"是一款温暖的饮食决策助手，帮助选择困难症用户快速找到今日三餐。整体风格温馨治愈，以橙色系营造食欲感，通过智能推荐解决"吃什么"的世纪难题，同时提供健康饮食指导。

## 2. Design Language

### 2.1 Aesthetic Direction
温暖治愈系：参考厨房的温馨氛围，结合现代卡片式UI，传递"家的味道"。

### 2.2 Color Palette
- **Primary**: `#FF8C42` (暖橙色 - 食欲感)
- **Secondary**: `#FFB347` (浅橙 - 柔和过渡)
- **Accent**: `#E85D04` (深橙 - 强调)
- **Background**: `#FFF8F0` (米白 - 温暖底色)
- **Surface**: `#FFFFFF` (纯白卡片)
- **Text Primary**: `#2D2D2D` (深灰 - 主文字)
- **Text Secondary**: `#6B7280` (中灰 - 副文字)
- **Success**: `#4CAF50` (健康绿)
- **Warning**: `#FF9800` (警示橙)
- **Error**: `#F44336` (错误红)

### 2.3 Typography
- **Display/Title**: `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`
- **Body**: `"PingFang SC", "Helvetica Neue", sans-serif`
- **Weight**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### 2.4 Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 48, 64
- Card border-radius: 16px
- Button border-radius: 12px (pill for primary)
- Input border-radius: 24px (pill search)

### 2.5 Motion Philosophy
- **Entrance**: fadeIn + slideUp, 300ms ease-out
- **Card hover**: translateY(-4px) + shadow deepen, 200ms
- **Button press**: scale(0.95), 100ms
- **Page transition**: slide horizontal, 250ms
- **Loading**: skeleton shimmer, pulse 1.5s infinite

## 3. Layout & Structure

### 3.1 Navigation
- **Bottom Tab Bar**: 固定底部，高度56px + safe-area
- **3个Tab**: 菜谱大全 | 今日推荐 | 健康饮食
- **Tab Item**: Icon + Label，激活态带动画下划线

### 3.2 Page Structure

**菜谱大全页面**:
```
┌─────────────────────────┐
│  🔍 搜索栏（固定顶部）   │
├─────────────────────────┤
│  分类Tab（全部|荤|素|甜）│
├─────────────────────────┤
│  标签筛选（横向滚动）    │
├─────────────────────────┤
│                         │
│  网格布局 2列/3列       │
│  ┌─────┐  ┌─────┐      │
│  │卡片1 │  │卡片2 │      │
│  └─────┘  └─────┘      │
│  ┌─────┐  ┌─────┐      │
│  │卡片3 │  │卡片4 │      │
│  └─────┘  └─────┘      │
│                         │
└─────────────────────────┘
```

**今日推荐页面**:
```
┌─────────────────────────┐
│                         │
│      "今天吃什么？"      │
│                         │
│     [ 🎲 开始推荐 ]      │
│                         │
│  ┌─────┐┌─────┐┌─────┐ │
│  │素菜1││素菜2││荤菜 │ │
│  └─────┘└─────┘└─────┘ │
│                         │
│  [重新推荐] [收藏组合]   │
│                         │
└─────────────────────────┘
```

**健康饮食页面**:
```
┌─────────────────────────┐
│  教育轮播卡片（可滑动）  │
├─────────────────────────┤
│  ┌───┐ ┌───┐ ┌───┐     │
│  │少油│ │少盐│ │少糖│   │
│  └───┘ └───┘ └───┘     │
├─────────────────────────┤
│  食材库（搜索+筛选）    │
│  ┌─────┐  ┌─────┐      │
│  │     │  │     │      │
│  └─────┘  └─────┘      │
└─────────────────────────┘
```

### 3.3 Responsive Strategy
- **Mobile (<640px)**: 2列网格，单卡片布局
- **Tablet (640-1024px)**: 3列网格
- **Desktop (>1024px)**: 4列网格，最大宽度1200px

## 4. Features & Interactions

### 4.1 菜谱大全
- **搜索**: 实时搜索（300ms防抖），支持菜名/食材/标签模糊匹配
- **分类筛选**: Tab切换，平滑过渡动画
- **标签筛选**: 多选叠加，横向滚动
- **收藏**: 点击心形切换，持久化到localStorage
- **详情页**: 图片可缩放，食材checkbox，步骤编号
- **最近浏览**: localStorage记录最近10道菜

### 4.2 今日推荐
- **初始状态**: 中央大按钮，脉冲动画
- **加载状态**: 趣味文案 + 跳动图标
- **结果展示**: 三卡片飞入动画（弹性缓动）
- **重新推荐**: 防重复机制（7天历史排除）
- **收藏组合**: 存储完整推荐组合
- **历史记录**: 按日期分组，可再次使用

### 4.3 健康饮食
- **教育轮播**: 自动5秒轮播，手动滑动
- **原则导航**: 宫格布局，点击展开详情sheet
- **食材库**: GI值可视化，分类筛选
- **食谱示例**: 周一到周日，可展开查看详情
- **工具箱**: BMI计算器、热量估算

## 5. Component Inventory

### 5.1 Navigation
- **BottomTab**: 图标+标签，激活态带动画
- **Header**: 可选返回按钮+标题+操作按钮

### 5.2 Cards
- **RecipeCard**:
  - Default: 白色卡片，圆角16px，阴影
  - Hover: 上浮4px，阴影加深
  - Loading: skeleton骨架屏
- **FoodCard**: 圆形头像+信息区+收藏按钮
- **RecommendationCard**: 大图+标题+翻转动画

### 5.3 Inputs
- **SearchInput**: 圆角24px，搜索图标
- **Checkbox**: 自定义样式，动画反馈

### 5.4 Feedback
- **Toast**: 顶部弹出，自动消失
- **Skeleton**: shimmer动画
- **EmptyState**: 插画+提示+操作按钮

### 5.5 Modals & Sheets
- **BottomSheet**: 底部弹出，支持拖拽
- **Modal**: 居中弹窗，背景遮罩

## 6. Technical Approach

### 6.1 Framework
- React 18 + TypeScript
- React Router v6 (路由管理)
- Tailwind CSS (样式)
- Framer Motion (动画)

### 6.2 State Management
- React Context (全局状态)
- React Hooks (组件状态)
- localStorage (持久化)

### 6.3 Data Structure
```typescript
interface Recipe {
  id: string;
  name: string;
  category: 'meat' | 'vegetable' | 'dessert';
  image: string;
  ingredients: Ingredient[];
  steps: string[];
  time: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  calories?: number;
  isFavorite: boolean;
  createdAt: number;
}

interface Recommendation {
  id: string;
  date: number;
  recipes: [Recipe, Recipe, Recipe];
  isFavorite: boolean;
  note: string;
}

interface HealthyFood {
  id: string;
  name: string;
  category: 'grain' | 'protein' | 'vegetable' | 'fruit' | 'other';
  image: string;
  gi?: number;
  giLevel: 'low' | 'medium' | 'high';
  calories: number;
  protein: number;
  carbs: number;
  fiber?: number;
  benefits: string[];
  suitable: string[];
  tips: string;
}
```

### 6.4 Storage Keys
- `whatToEat_recipes`: 所有菜谱
- `whatToEat_favorites`: 收藏ID列表
- `whatToEat_history`: 推荐历史
- `whatToEat_healthyFoods`: 健康食材
- `whatToEat_lastVisit`: 最近浏览

## 7. Mock Data

### 7.1 菜谱数据 (30道)
- 荤菜12道：红烧肉、糖醋排骨、可乐鸡翅、番茄炒蛋、鱼香肉丝、宫保鸡丁、清蒸鲈鱼、黑椒牛柳、蒜蓉粉丝虾、回锅肉、啤酒鸭、土豆炖牛腩
- 素菜12道：地三鲜、麻婆豆腐、蒜蓉西兰花、干煸四季豆、凉拌黄瓜、醋溜白菜、红烧茄子、干锅花菜、清炒时蔬、香菇油菜、凉拌木耳
- 甜品6道：蛋挞、芒果班戟、红豆沙、双皮奶、提拉米苏、杨枝甘露

### 7.2 健康食材 (40+种)
- 主食类10种（低GI）
- 蛋白质类10种
- 蔬菜类12种
- 水果类8种

### 7.3 一周食谱示例
- 7天×3餐完整搭配
- 标注热量和营养素
