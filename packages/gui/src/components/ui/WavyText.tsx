import { motion } from "framer-motion";

interface WavyTextProps {
  text: string;
  className?: string;
}

export function WavyText({ text, className = "" }: WavyTextProps) {
  return (
    <span className={`inline-flex ${className}`}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          animate={{
            y: [0, -3, 0, 3, 0],
            rotate: [0, -2, 0, 2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
