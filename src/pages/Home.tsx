import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Clock, Navigation, Anchor, Calculator, ChevronRight } from 'lucide-react';

// 问题数据
const PROBLEM_DATA = {
  waterSpeed: 2,
  shipA_Speed: 18,
  shipB_Speed: 12,
  startTime: '8:00',
  turnTime: '9:00',
};

// 计算两船位置
function calculatePositions(t: number) {
  // t: 从8:00开始经过的小时数
  const waterSpeed = PROBLEM_DATA.waterSpeed;
  const shipA_Speed = PROBLEM_DATA.shipA_Speed;
  const shipB_Speed = PROBLEM_DATA.shipB_Speed;
  
  // 甲船: 0-1小时向东顺水，1小时后向西逆水
  let shipA_Position: number;
  let shipA_Direction: 'east' | 'west';
  let shipA_Velocity: number;
  
  if (t <= 1) {
    // 顺水向东
    shipA_Velocity = shipA_Speed + waterSpeed;
    shipA_Position = shipA_Velocity * t;
    shipA_Direction = 'east';
  } else {
    // 1小时时的位置
    const posAt1Hour = (shipA_Speed + waterSpeed) * 1;
    // 逆水向西
    shipA_Velocity = -(shipA_Speed - waterSpeed);
    shipA_Position = posAt1Hour + shipA_Velocity * (t - 1);
    shipA_Direction = 'west';
  }
  
  // 乙船: 始终向东顺水
  const shipB_Velocity = shipB_Speed + waterSpeed;
  const shipB_Position = shipB_Velocity * t;
  const shipB_Direction: 'east' | 'west' = 'east';
  
  return {
    shipA: { position: shipA_Position, direction: shipA_Direction, velocity: shipA_Velocity },
    shipB: { position: shipB_Position, direction: shipB_Direction, velocity: shipB_Velocity },
    distance: Math.abs(shipA_Position - shipB_Position),
  };
}

// 格式化时间
function formatTime(t: number): string {
  const hour = 8 + Math.floor(t);
  const minute = Math.round((t % 1) * 60);
  return `${hour}:${minute.toString().padStart(2, '0')}`;
}

export default function Home() {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  const MAX_TIME = 1.5; // 演示到1.5小时
  const SCALE = 15; // 1km = 15px
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 280;
  const RIVER_Y = 140;
  
  const positions = calculatePositions(currentTime);
  
  // 动画循环
  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;
    
    setCurrentTime(prev => {
      const newTime = prev + deltaTime * 0.3; // 播放速度
      if (newTime >= MAX_TIME) {
        setIsPlaying(false);
        return MAX_TIME;
      }
      return newTime;
    });
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying]);
  
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate]);
  
  // 根据时间确定当前步骤
  useEffect(() => {
    if (currentTime < 1) {
      setActiveStep(0);
    } else if (currentTime === 1 || (currentTime > 0.95 && currentTime < 1.05)) {
      setActiveStep(1);
    } else if (currentTime < 1.2) {
      setActiveStep(2);
    } else {
      setActiveStep(3);
    }
  }, [currentTime]);
  
  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveStep(0);
  };
  
  // 计算船只在画布上的位置
  const getShipX = (position: number) => {
    const centerX = CANVAS_WIDTH / 2;
    return centerX + position * SCALE;
  };
  
  const shipAX = getShipX(positions.shipA.position);
  const shipBX = getShipX(positions.shipB.position);
  
  // 步骤数据
  const steps = [
    {
      title: '第一阶段：同时顺水航行',
      time: '8:00 - 9:00',
      content: `甲船速度: ${PROBLEM_DATA.shipA_Speed}+${PROBLEM_DATA.waterSpeed}=${PROBLEM_DATA.shipA_Speed + PROBLEM_DATA.waterSpeed} km/h\n乙船速度: ${PROBLEM_DATA.shipB_Speed}+${PROBLEM_DATA.waterSpeed}=${PROBLEM_DATA.shipB_Speed + PROBLEM_DATA.waterSpeed} km/h\n1小时后，甲船领先乙船 ${(PROBLEM_DATA.shipA_Speed - PROBLEM_DATA.shipB_Speed) * 1} km`,
    },
    {
      title: '第二阶段：甲船调头',
      time: '9:00',
      content: `甲船位置: ${(PROBLEM_DATA.shipA_Speed + PROBLEM_DATA.waterSpeed) * 1} km\n乙船位置: ${(PROBLEM_DATA.shipB_Speed + PROBLEM_DATA.waterSpeed) * 1} km\n两船相距: ${(PROBLEM_DATA.shipA_Speed - PROBLEM_DATA.shipB_Speed) * 1} km`,
    },
    {
      title: '第三阶段：相向而行',
      time: '9:00 - 9:12',
      content: `甲船调头后速度: ${PROBLEM_DATA.shipA_Speed}-${PROBLEM_DATA.waterSpeed}=${PROBLEM_DATA.shipA_Speed - PROBLEM_DATA.waterSpeed} km/h (向西)\n乙船继续: ${PROBLEM_DATA.shipB_Speed + PROBLEM_DATA.waterSpeed} km/h (向东)\n相对速度: ${(PROBLEM_DATA.shipA_Speed - PROBLEM_DATA.waterSpeed) + (PROBLEM_DATA.shipB_Speed + PROBLEM_DATA.waterSpeed)} km/h`,
    },
    {
      title: '第四阶段：相遇',
      time: '9:12',
      content: `相遇时间: 6÷30=0.2小时=12分钟\n相遇位置: 距离O点 ${(PROBLEM_DATA.shipB_Speed + PROBLEM_DATA.waterSpeed) * 1 + (PROBLEM_DATA.shipB_Speed + PROBLEM_DATA.waterSpeed) * 0.2} km`,
    },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            🚢 船行问题解题助手
          </h1>
          <p className="text-slate-600">通过动态可视化理解相对运动问题</p>
        </header>
        
        <div className="grid lg:grid-cols-5 gap-6">
          {/* 左侧：动画和控制 */}
          <div className="lg:col-span-3 space-y-4">
            {/* 题目卡片 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Anchor className="w-5 h-5 text-blue-600" />
                题目
              </h2>
              <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                在一条笔直的河道中，水流方向自西向东，水流速度为
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">2km/h</span>。
                上午8:00，甲船和乙船同时从河道上的同一点O出发，均向东顺水航行。
                甲船在静水中的速度为
                <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">18km/h</span>，
                乙船在静水中的速度为
                <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium">12km/h</span>。
                上午9:00，甲船立即调头，改为向西逆水航行，去追赶乙船。
                问：甲船调头后，经过多长时间能与乙船相遇？相遇地点距离出发点O多远？
              </p>
            </div>
            
            {/* 动画画布 */}
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  动态演示
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">当前时间:</span>
                  <span className="text-lg font-bold text-blue-600">{formatTime(currentTime)}</span>
                </div>
              </div>
              
              {/* SVG 画布 */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-sky-100 to-blue-200" style={{ height: CANVAS_HEIGHT }}>
                <svg width="100%" height="100%" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} preserveAspectRatio="xMidYMid meet">
                  {/* 水面波纹 */}
                  <defs>
                    <pattern id="waves" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M0,10 Q10,5 20,10 T40,10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#waves)" />
                  
                  {/* 河道中线 */}
                  <line x1="0" y1={RIVER_Y} x2={CANVAS_WIDTH} y2={RIVER_Y} stroke="#94a3b8" strokeWidth="2" strokeDasharray="8,4" />
                  
                  {/* O点标记 */}
                  <line x1={CANVAS_WIDTH/2} y1={RIVER_Y-15} x2={CANVAS_WIDTH/2} y2={RIVER_Y+15} stroke="#475569" strokeWidth="3" />
                  <text x={CANVAS_WIDTH/2} y={RIVER_Y+35} textAnchor="middle" className="fill-slate-600 text-sm font-bold">O点</text>
                  
                  {/* 方向指示 */}
                  <text x={CANVAS_WIDTH-60} y={RIVER_Y-20} className="fill-slate-500 text-xs">→ 东 (顺水方向)</text>
                  <text x={20} y={RIVER_Y-20} className="fill-slate-500 text-xs">西 ←</text>
                  
                  {/* 距离刻度 */}
                  {[-20, -10, 0, 10, 20, 30].map(km => {
                    const x = getShipX(km);
                    if (x < 0 || x > CANVAS_WIDTH) return null;
                    return (
                      <g key={km}>
                        <line x1={x} y1={RIVER_Y-8} x2={x} y2={RIVER_Y+8} stroke="#cbd5e1" strokeWidth="1" />
                        <text x={x} y={RIVER_Y+25} textAnchor="middle" className="fill-slate-400 text-xs">{km}km</text>
                      </g>
                    );
                  })}
                  
                  {/* 甲船轨迹 */}
                  {currentTime > 0 && (
                    <path
                      d={`M ${getShipX(0)} ${RIVER_Y-20} L ${shipAX} ${RIVER_Y-20}`}
                      fill="none"
                      stroke="#fca5a5"
                      strokeWidth="4"
                      strokeDasharray="4,2"
                      opacity="0.6"
                    />
                  )}
                  
                  {/* 乙船轨迹 */}
                  {currentTime > 0 && (
                    <path
                      d={`M ${getShipX(0)} ${RIVER_Y+20} L ${shipBX} ${RIVER_Y+20}`}
                      fill="none"
                      stroke="#93c5fd"
                      strokeWidth="4"
                      strokeDasharray="4,2"
                      opacity="0.6"
                    />
                  )}
                  
                  {/* 甲船 */}
                  <g transform={`translate(${shipAX}, ${RIVER_Y-20})`}>
                    <polygon
                      points={positions.shipA.direction === 'east' ? "-12,-8 12,0 -12,8" : "12,-8 -12,0 12,8"}
                      fill="#ef4444"
                      stroke="#dc2626"
                      strokeWidth="2"
                    />
                    <text y={-15} textAnchor="middle" className="fill-red-600 text-xs font-bold">甲船</text>
                    <text y={22} textAnchor="middle" className="fill-red-500 text-xs">{positions.shipA.position.toFixed(1)}km</text>
                  </g>
                  
                  {/* 乙船 */}
                  <g transform={`translate(${shipBX}, ${RIVER_Y+20})`}>
                    <polygon
                      points="-12,-8 12,0 -12,8"
                      fill="#3b82f6"
                      stroke="#2563eb"
                      strokeWidth="2"
                    />
                    <text y={-15} textAnchor="middle" className="fill-blue-600 text-xs font-bold">乙船</text>
                    <text y={22} textAnchor="middle" className="fill-blue-500 text-xs">{positions.shipB.position.toFixed(1)}km</text>
                  </g>
                  
                  {/* 两船距离标注 */}
                  {positions.distance > 0.5 && (
                    <g>
                      <line
                        x1={Math.min(shipAX, shipBX)}
                        y1={RIVER_Y-45}
                        x2={Math.max(shipAX, shipBX)}
                        y2={RIVER_Y-45}
                        stroke="#64748b"
                        strokeWidth="1"
                        strokeDasharray="3,2"
                      />
                      <line x1={shipAX} y1={RIVER_Y-25} x2={shipAX} y2={RIVER_Y-45} stroke="#64748b" strokeWidth="1" />
                      <line x1={shipBX} y1={RIVER_Y-25} x2={shipBX} y2={RIVER_Y-45} stroke="#64748b" strokeWidth="1" />
                      <text
                        x={(shipAX + shipBX) / 2}
                        y={RIVER_Y-52}
                        textAnchor="middle"
                        className="fill-slate-600 text-xs font-medium"
                      >
                        相距 {positions.distance.toFixed(1)} km
                      </text>
                    </g>
                  )}
                  
                  {/* 9:00调头标记 */}
                  {currentTime >= 1 && (
                    <g>
                      <circle cx={getShipX((PROBLEM_DATA.shipA_Speed + PROBLEM_DATA.waterSpeed) * 1)} cy={RIVER_Y-20} r="8" fill="none" stroke="#f59e0b" strokeWidth="2">
                        <animate attributeName="r" values="8;12;8" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                      <text x={getShipX((PROBLEM_DATA.shipA_Speed + PROBLEM_DATA.waterSpeed) * 1)} y={RIVER_Y-50} textAnchor="middle" className="fill-amber-600 text-xs font-bold">调头</text>
                    </g>
                  )}
                  
                  {/* 相遇标记 */}
                  {currentTime >= 1.2 && (
                    <g>
                      <circle cx={getShipX(16.8)} cy={RIVER_Y} r="10" fill="none" stroke="#10b981" strokeWidth="3">
                        <animate attributeName="r" values="10;16;10" dur="1s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
                      </circle>
                      <text x={getShipX(16.8)} y={RIVER_Y-60} textAnchor="middle" className="fill-emerald-600 text-sm font-bold">相遇!</text>
                    </g>
                  )}
                </svg>
              </div>
              
              {/* 控制栏 */}
              <div className="mt-4 space-y-4">
                {/* 播放控制 */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePlay}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? '暂停' : '播放'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重置
                  </button>
                </div>
                
                {/* 时间轴滑块 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>8:00</span>
                    <span>9:00</span>
                    <span>9:30</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={MAX_TIME}
                    step="0.01"
                    value={currentTime}
                    onChange={(e) => {
                      setCurrentTime(parseFloat(e.target.value));
                      setIsPlaying(false);
                    }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>
            
            {/* 实时数据面板 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                实时数据
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <div className="text-xs text-red-600 mb-1">甲船位置</div>
                  <div className="text-2xl font-bold text-red-700">{positions.shipA.position.toFixed(1)}<span className="text-sm font-normal">km</span></div>
                  <div className="text-xs text-red-500 mt-1">
                    {positions.shipA.direction === 'east' ? '→ 向东' : '← 向西'}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="text-xs text-blue-600 mb-1">乙船位置</div>
                  <div className="text-2xl font-bold text-blue-700">{positions.shipB.position.toFixed(1)}<span className="text-sm font-normal">km</span></div>
                  <div className="text-xs text-blue-500 mt-1">→ 向东</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <div className="text-xs text-amber-600 mb-1">两船距离</div>
                  <div className="text-2xl font-bold text-amber-700">{positions.distance.toFixed(1)}<span className="text-sm font-normal">km</span></div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="text-xs text-emerald-600 mb-1">已过时间</div>
                  <div className="text-2xl font-bold text-emerald-700">{currentTime.toFixed(2)}<span className="text-sm font-normal">h</span></div>
                  <div className="text-xs text-emerald-500 mt-1">{Math.round(currentTime * 60)}分钟</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 右侧：解题步骤 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                解题步骤
              </h2>
              
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`rounded-xl p-4 border-2 transition-all cursor-pointer ${
                      activeStep === index
                        ? 'bg-blue-50 border-blue-400 shadow-md'
                        : 'bg-slate-50 border-transparent hover:border-slate-200'
                    }`}
                    onClick={() => {
                      const times = [0, 1, 1.1, 1.2];
                      setCurrentTime(times[index]);
                      setIsPlaying(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        activeStep === index ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm ${activeStep === index ? 'text-blue-800' : 'text-slate-700'}`}>
                          {step.title}
                        </h3>
                        <p className={`text-xs mt-1 ${activeStep === index ? 'text-blue-600' : 'text-slate-500'}`}>
                          {step.time}
                        </p>
                        <div className={`mt-2 text-sm whitespace-pre-line ${activeStep === index ? 'text-slate-700' : 'text-slate-600'}`}>
                          {step.content}
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 shrink-0 ${activeStep === index ? 'text-blue-500' : 'text-slate-300'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 答案卡片 */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                最终答案
              </h2>
              <div className="space-y-3">
                <div className="bg-white/20 rounded-xl p-4">
                  <div className="text-sm text-emerald-100 mb-1">甲船调头后经过</div>
                  <div className="text-3xl font-bold">12分钟</div>
                  <div className="text-sm text-emerald-100">(0.2小时)</div>
                </div>
                <div className="bg-white/20 rounded-xl p-4">
                  <div className="text-sm text-emerald-100 mb-1">相遇地点距离O点</div>
                  <div className="text-3xl font-bold">16.8 km</div>
                  <div className="text-sm text-emerald-100">(在O点东侧)</div>
                </div>
              </div>
            </div>
            
            {/* 公式推导 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">关键公式</h2>
              <div className="space-y-3 text-sm">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-slate-500 mb-1">顺水速度</div>
                  <div className="font-mono text-slate-700">v = v静 + v水</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-slate-500 mb-1">逆水速度</div>
                  <div className="font-mono text-slate-700">v = v静 - v水</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-slate-500 mb-1">相遇方程</div>
                  <div className="font-mono text-slate-700">20 - 16t = 14 + 14t</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
