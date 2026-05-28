import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function MrGobble() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mouthAngle, setMouthAngle] = useState(30);
  const navigate = useNavigate();

  const quickActions = [
    { label: "New Chat", action: () => navigate("/") },
    { label: "Agents", action: () => navigate("/agents") },
    { label: "Settings", action: () => navigate("/settings") },
    { label: "Toggle Sound", action: () => {} },
  ];

  // Pac-Man mouth animation
  useEffect(() => {
    const interval = setInterval(() => {
      setMouthAngle((prev) => (prev === 30 ? 5 : 30));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Create Pac-Man mouth path
  const createPacmanPath = (angle: number) => {
    const r = 45;
    const mouthRad = (angle * Math.PI) / 180;
    const startAngle = mouthRad;
    const endAngle = 2 * Math.PI - mouthRad;

    const x1 = 50 + r * Math.cos(startAngle);
    const y1 = 50 - r * Math.sin(startAngle);
    const x2 = 50 + r * Math.cos(endAngle);
    const y2 = 50 + r * Math.sin(endAngle);

    return `M 50 50 L ${x1} ${y1} A ${r} ${r} 0 1 0 ${x2} ${y2} Z`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Dots/Pellets */}
      <div className="absolute bottom-16 right-20 flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-yellow-300"
            animate={{
              opacity: [1, 0.3, 1],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-20 right-0 w-48 glass rounded-xl p-2 mb-2"
          >
            {quickActions.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                {item.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-16 h-16"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Pac-Man Body */}
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          animate={{
            x: isOpen ? [0, -3, 3, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Yellow Pac-Man with mouth */}
          <path
            d={createPacmanPath(mouthAngle)}
            fill="#FFD700"
            stroke="#FFA500"
            strokeWidth="2"
          />

          {/* Eye */}
          <circle cx="55" cy="30" r="5" fill="white" />
          <circle cx="56" cy="29" r="2.5" fill="black" />

          {/* Ghost pellet/power-up indicator */}
          {isHovered && (
            <motion.circle
              cx="85"
              cy="50"
              r="8"
              fill="#FF0000"
              animate={{
                opacity: [1, 0.5, 1],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </motion.svg>

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: isHovered
              ? "0 0 30px rgba(255, 215, 0, 0.6)"
              : "0 0 15px rgba(255, 215, 0, 0.3)",
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Waka waka text on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <motion.span
                className="text-xs font-bold text-yellow-400"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                WAKA WAKA
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
