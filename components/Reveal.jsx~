"use client";
import { motion } from 'framer-motion';

// The Slow Animation Logic
const slowFadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 1.2, // Slow duration
      ease: "easeOut" 
    } 
  }
};

export default function Reveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      variants={slowFadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.1 }} // false = animates every time you scroll
      transition={{ delay: delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
