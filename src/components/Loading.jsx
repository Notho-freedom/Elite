import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GoldenParticles } from './Particles/GoldenParticles';
import { useTheme } from './Context/ThemeContext';
import Logo from './Logo';

const Loading = ({title='E . L . I . T . E', text="Profitez d'une experience sans egale!"}) => {
    const { theme } = useTheme();

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-col items-center justify-center flex-grow p-4 relative overflow-hidden">
                <Logo />

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-center z-10"
                    >
                        <h3 className={clsx(
                            "text-[2.2vh] font-bold mb-4",
                            "bg-clip-text",
                            `${theme.baccentText}`
                        )}>
                            {title}
                        </h3>
                        <p className={clsx(
                            "text-[1.5vh] max-w-md mx-auto font-normal",
                            `${theme.accentText}`
                        )}>
                            {text}
                        </p>
                    </motion.div>

                <GoldenParticles />
            </div>

            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 1, duration: 0.5 }}
                className={clsx(
                    "text-xs text-center w-full py-3 px-4",
                    theme.accentText,
                    "sticky bottom-0 bg-opacity-90 backdrop-blur-sm bg-trensparent"
                )}
                whileHover={{ opacity: 1 }}
            >
                <p>
                Vos messages sont chiffrés de bout en bout
                </p>
            </motion.footer>
        </div>
    );
}

export default Loading;