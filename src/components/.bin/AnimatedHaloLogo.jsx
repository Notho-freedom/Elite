import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

const AnimatedHaloLogo = ({size={w:'w-[25vh]',h:'h-[25vh]', t:' top-[5vh]'}}) => {
  return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
            scale: 1, 
            opacity: 1,
            boxShadow: "0 0 7px 7px rgba(139, 92, 246, 0.4)"
            }}

            className={clsx(
          "absolute transform -translate-x-1/2",
          "rounded-full flex items-center justify-center",
          "bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600",
          "z-10",
          size.t,
          size.w,
          size.h
        )}
        >

            <div className="rounded-full flex items-center justify-center w-full h-full z-20">
            <svg 
                className="w-full h-full text-white drop-shadow-lg" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
            </svg>
            </div>
        </motion.div>
  );
};

export default AnimatedHaloLogo;
