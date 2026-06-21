import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface RiskGaugeProps {
  score: number;
}

export function RiskGauge({ score }: RiskGaugeProps) {
  // Clamp score between 0 and 100
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  
  // Setup SVG circle parameters
  const size = 280;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // The gauge is an arc (e.g., 270 degrees out of 360)
  const arcPercentage = 0.75; // 75% of a full circle
  const arcLength = circumference * arcPercentage;
  const offset = circumference - arcLength;
  
  // Calculate progress on the arc
  const progressLength = (normalizedScore / 100) * arcLength;
  const dashoffset = circumference - progressLength;
  
  // Color determination based on score
  let colorClass = "text-green-500";
  let statusText = "Low Risk";
  let Icon = CheckCircle;
  let bgGradient = "from-green-500/20 to-transparent";

  if (normalizedScore >= 80) {
    colorClass = "text-red-500";
    statusText = "Critical Risk";
    Icon = AlertTriangle;
    bgGradient = "from-red-500/20 to-transparent";
  } else if (normalizedScore >= 60) {
    colorClass = "text-orange-500";
    statusText = "High Risk";
    Icon = AlertTriangle;
    bgGradient = "from-orange-500/20 to-transparent";
  } else if (normalizedScore >= 40) {
    colorClass = "text-yellow-500";
    statusText = "Moderate Risk";
    Icon = Info;
    bgGradient = "from-yellow-500/20 to-transparent";
  }

  // Rotate SVG so the gap is at the bottom
  const rotation = 90 + ((1 - arcPercentage) * 360) / 2;

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* Background glow */}
      <div className={`absolute inset-0 bg-gradient-radial ${bgGradient} blur-3xl rounded-full opacity-50 transform scale-150 pointer-events-none`} />
      
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Background Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-100"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset="0"
          />
          
          {/* Foreground Progress Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className={colorClass}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        {/* Inner Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 font-medium text-sm mb-1 uppercase tracking-wider"
          >
            Risk Score
          </motion.span>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className={`font-display text-7xl font-bold tracking-tighter ${colorClass}`}
          >
            {Math.round(score)}
          </motion.div>
          <div className={`flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur shadow-sm border border-gray-100 ${colorClass}`}>
            <Icon size={14} />
            <span className="text-xs font-bold">{statusText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
