import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Heart } from 'lucide-react';

const tabs = [
  { path: '/', icon: BookOpen, label: '菜谱大全' },
  { path: '/recommend', icon: Sparkles, label: '今日推荐' },
  { path: '/health', icon: Heart, label: '健康饮食' },
];

export const BottomTab: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-t border-gray-100/50" />
      <div className="relative flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary/10"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                className="relative z-10 flex flex-col items-center"
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span
                  className={`text-xs mt-1 transition-all duration-300 ${
                    isActive ? 'font-semibold' : 'font-normal'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTab;
