import { motion } from "framer-motion";

interface GridPatternProps {
  className?: string;
}

export const GridPattern = ({ className }: GridPatternProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Main grid pattern */}
      <div className="absolute inset-0 grid-pattern grid-pattern-fade opacity-30" />
      
      {/* Animated glow orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Top gradient fade */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      
      {/* Bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};
