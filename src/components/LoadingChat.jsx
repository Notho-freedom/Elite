import clsx from 'clsx';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GoldenParticles } from './Particles/GoldenParticles';
import { useTheme } from './Context/ThemeContext';

const LoadingChat = () => {
    const { theme } = useTheme();
    const [onWeb, setOnWeb] = useState(false);
    
    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-col items-center justify-center flex-grow p-4 relative overflow-hidden">
                {/* Animated Background Elements */}
                <img src="/logoo.png" alt="Logo" className='w-[30vh]' />

                {/* Conditional Content */}
                {onWeb ? (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-center z-10 max-w-md"
                    >
                        <h3 className={clsx(
                            "text-[2.2vh] font-bold mb-4",
                            "bg-clip-text",
                            `${theme.baccentText}`
                        )}>
                            Télécharger l'application pour Windows
                        </h3>
                        <p className={clsx(
                            "text-[1.5vh] mb-6",
                            `${theme.accentText}`
                        )}>
                            Passez des appels, partagez votre écran et profitez d'une expérience plus fluide.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={clsx(
                                "px-6 py-3 rounded-lg font-medium",
                                "transition-all duration-200",
                                `${theme.accentBg} ${theme.accentText}`
                            )}
                        >
                            Télécharger
                        </motion.button>
                    </motion.div>
                ) : (
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
                            Sélectionnez une conversation
                        </h3>
                        <p className={clsx(
                            "text-[1.5vh] max-w-md mx-auto",
                            `${theme.accentText}`
                        )}>
                            Choisissez une discussion existante ou démarrez une nouvelle conversation
                        </p>
                    </motion.div>
                )}

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

export default LoadingChat;