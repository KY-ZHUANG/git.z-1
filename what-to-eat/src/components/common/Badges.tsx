import React from 'react';
import { DIFFICULTY_LABELS } from '../../utils/constants';

interface DifficultyBadgeProps {
  level: 'easy' | 'medium' | 'hard';
  className?: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ level, className = '' }) => {
  const config = DIFFICULTY_LABELS[level];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      {config.text}
    </span>
  );
};

interface TagProps {
  text: string;
  color?: string;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  text,
  color,
  active = false,
  onClick,
  onRemove,
  className = '',
}) => {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-200 cursor-pointer ${
        active ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
      } ${onClick ? 'hover:opacity-80' : ''} ${className}`}
      style={color && !active ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {text}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-red-500"
        >
          ×
        </button>
      )}
    </span>
  );
};

interface EmptyStateProps {
  type: 'search' | 'favorite' | 'history' | 'recipe';
  message?: string;
  action?: { text: string; onClick: () => void };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  message,
  action,
  className = '',
}) => {
  const getContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: '🔍',
          title: message || '没找到相关菜品',
          subtitle: '换个关键词试试吧~',
        };
      case 'favorite':
        return {
          icon: '❤️',
          title: '还没有收藏',
          subtitle: '点击心形按钮收藏喜欢的菜品',
        };
      case 'history':
        return {
          icon: '📅',
          title: '暂无推荐历史',
          subtitle: '开始今天的美食探索吧~',
        };
      case 'recipe':
        return {
          icon: '🍳',
          title: '菜谱库为空',
          subtitle: '快来添加第一道菜谱吧',
        };
    }
  };

  const content = getContent();

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="text-6xl mb-4">{content.icon}</div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">{content.title}</h3>
      <p className="text-sm text-gray-500 mb-6">{content.subtitle}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
        >
          {action.text}
        </button>
      )}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
}

export const RecipeCardSkeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`bg-white rounded-card overflow-hidden ${className}`}>
    <div className="aspect-card skeleton-shimmer" />
    <div className="p-4 space-y-3">
      <div className="h-5 w-3/4 skeleton-shimmer rounded" />
      <div className="h-4 w-1/2 skeleton-shimmer rounded" />
      <div className="flex gap-2">
        <div className="h-6 w-16 skeleton-shimmer rounded-full" />
        <div className="h-6 w-16 skeleton-shimmer rounded-full" />
      </div>
    </div>
  </div>
);

interface RecipeListSkeletonProps {
  count?: number;
}

export const RecipeListSkeleton: React.FC<RecipeListSkeletonProps> = ({ count = 6 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <RecipeCardSkeleton key={i} />
    ))}
  </div>
);

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, className = '' }) => (
  <div
    className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${className}`}
    style={{ width: size, height: size }}
  />
);

interface GIBadgeProps {
  gi: number | undefined;
  level: 'low' | 'medium' | 'high' | 'unknown';
  className?: string;
}

export const GIBadge: React.FC<GIBadgeProps> = ({ gi, level, className = '' }) => {
  const colors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
    unknown: 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[level]} ${className}`}
    >
      GI: {gi ?? '?'}
    </span>
  );
};
