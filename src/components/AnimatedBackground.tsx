import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';

const FloatingSymbol = ({ delay = 0, duration = 15, x = "0%", y = "0%", size = 24 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x, y, scale: 0.5, rotate: 0 }}
      animate={{ 
        opacity: [0, 0.2, 0.2, 0],
        x: [x, `${parseFloat(x) + (Math.random() * 20 - 10)}%`, `${parseFloat(x) + (Math.random() * 40 - 20)}%`],
        y: [y, `${parseFloat(y) - 20}%`, `${parseFloat(y) - 40}%`],
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
      <DollarSign size={size} />
    </motion.div>
  );
};

export const AnimatedBackground = () => {
  const symbols = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    delay: i * 2,
    duration: 15 + Math.random() * 10,
    x: `${Math.random() * 100}%`,
    y: `${80 + Math.random() * 20}%`,
    size: 20 + Math.random() * 40
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50">
      {/* Soft gradient blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/30 blur-3xl"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-100/30 blur-3xl"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-sky-100/20 blur-3xl"
      />

      {/* Floating symbols */}
      {symbols.map(s => (
        <FloatingSymbol 
          key={s.id} 
          delay={s.delay} 
          duration={s.duration} 
          x={s.x} 
          y={s.y} 
          size={s.size} 
        />
      ))}

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `radial-gradient(#3b82f6 0.5px, transparent 0.5px)`, 
          backgroundSize: '24px 24px' 
        }}
      />
    </div>
  );
};
