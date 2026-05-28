import { motion } from "framer-motion";

export function ThinkingAnimation() {
  return (
    <div className="flex items-center gap-3">
      {/* Dots being eaten */}
      <div className="flex gap-1.5 items-center">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-yellow-300"
            animate={{
              opacity: [1, 0],
              scale: [1, 0],
              x: [0, -20],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeIn",
            }}
          />
        ))}

        {/* Mini Pac-Man eating */}
        <motion.svg
          viewBox="0 0 100 100"
          className="w-5 h-5"
          animate={{ x: [0, 40, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <motion.path
            d="M 50 50 L 75 25 A 35 35 0 1 0 75 75 Z"
            fill="#FFD700"
            animate={{
              d: [
                "M 50 50 L 75 25 A 35 35 0 1 0 75 75 Z",
                "M 50 50 L 85 40 A 35 35 0 1 0 85 60 Z",
              ],
            }}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse" }}
          />
        </motion.svg>
      </div>

      <motion.span
        className="text-sm text-yellow-400 font-bold"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        WAKA WAKA...
      </motion.span>
    </div>
  );
}
