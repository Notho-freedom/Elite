import clsx from 'clsx';
import React from 'react';
import { motion } from 'framer-motion';
import AnimatedHaloLogo from './AnimatedHaloLogo';

const LoadingChat = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <AnimatedHaloLogo size={{w:'w-[16vh]',h:'h-[16vh]',t:'top-[25vh]'}} />


        {/* Text with subtle animation */}
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center z-10"
        >
            <h3 className={clsx(
            "text-2xl sm:text-3xl font-bold mb-2",
            "bg-clip-text text-transparent",
            "bg-gradient-to-r from-purple-400 to-pink-400"
            )}>
            Sélectionnez une conversation
            </h3>
            <p className={clsx(
            "text-sm sm:text-base max-w-md mx-auto",
            "text-gray-500 dark:text-gray-400"
            )}>
            Choisissez une discussion existante ou démarrez une nouvelle conversation
            </p>
        </motion.div>

        {/* Floating particles */}
        {[...Array(16)].map((_, i) => (
            <motion.div
            key={i}
            initial={{
                opacity: 0,
                scale: 0,
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50
            }}
            animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0],
                x: Math.random() * 200 - 100,
                y: Math.random() * 200 - 100
            }}
            transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                delay: Math.random() * 5
            }}
            className={clsx(
                "absolute rounded-full",
                i % 3 === 0 ? "bg-purple-400" : 
                i % 3 === 1 ? "bg-pink-400" : "bg-indigo-400",
                "w-2 h-2 sm:w-3 sm:h-3",
                "blur-[1px]"
            )}
            style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
            }}
            />
        ))}

        {/* Halo effect */}
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [0.9, 1.1, 0.9]
            }}
            transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
            }}
            className={clsx(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "rounded-full pointer-events-none",
            "w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]",
            "bg-gradient-to-tr from-purple-500/30 via-pink-500/30 to-rose-500/30",
            "filter blur-[70px] sm:blur-[90px] saturate-200",
            "z-0"
            )}
        />
        </div>
    );
}

export default LoadingChat;
