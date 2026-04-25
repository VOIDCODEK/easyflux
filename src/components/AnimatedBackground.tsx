import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, BarChart2 } from 'lucide-react';

const FloatingSymbol = ({ delay = 0, duration = 15, x = "0%", y = "0%", size = 24, icon: Icon = DollarSign }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x, y, scale: 0.5, rotate: 0 }}
      animate={{ 
        opacity: [0, 0.25, 0.25, 0],
        x: [x, `${parseFloat(x) + (Math.random() * 20 - 10)}%`, `${parseFloat(x) + (Math.random() * 40 - 20)}%`],
        y: [y, `${parseFloat(y) - 30}%`, `${parseFloat(y) - 60}%`],
        rotate: [0, 45, 90, 180],
        scale: [0.5, 1, 1.2, 0.8]
      }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        delay,
        ease: "linear"
      }}
      className="absolute pointer-events-none text-blue-500/20"
      style={{ left: x, top: y }}
    >
      <Icon size={size} />
    </motion.div>
  );
};

export const AnimatedBackground = () => {
  const symbols = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    delay: i * 1.5,
    duration: 15 + Math.random() * 15,
    x: `${Math.random() * 100}%`,
    y: `${80 + Math.random() * 25}%`,
    size: 16 + Math.random() * 40,
    icon: i % 3 === 0 ? TrendingUp : i % 3 === 1 ? BarChart2 : DollarSign
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#f8fafc]">
      {/* Decorative Blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, -50, 0],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[10%] -right-[10%] w-[70%] h-[70%] rounded-full bg-indigo-100/40 blur-[120px]"
      />
      
      {/* Abstract Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Floating Financial Symbols */}
      {symbols.map(s => (
        <FloatingSymbol 
          key={s.id} 
          delay={s.delay} 
          duration={s.duration} 
          x={s.x} 
          y={s.y} 
          size={s.size} 
          icon={s.icon}
        />
      ))}
      
      {/* Bottom fade for better contrast with footer info */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/80 to-transparent" />
    </div>
  );
};
