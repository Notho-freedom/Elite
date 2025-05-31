import { useMediaQuery } from 'react-responsive';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const LoadingLogoWithHalo = () => {
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const haloSize = isDesktop ? 'w-[20rem] h-[20rem]' : 'w-48 h-48'; // Smaller halo
  const logoSize = 'w-12 h-12'; // Even smaller logo

  return (
    <div className="relative flex items-center justify-center h-screen bg-gray-900 text-white w-full overflow-hidden">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        className={clsx(
          "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center",
          haloSize,
          "bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 shadow-[0_0_30px_10px_rgba(139,92,246,0.6)]",
          "z-10"
        )}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-white/30"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-white/20"
        />
        <div className="rounded-full flex items-center justify-center shadow-lg w-full h-full z-20">
          <svg className={clsx(logoSize, "text-white drop-shadow-lg")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
            />
          </svg>
        </div>
        <div
          aria-hidden="true"
          className={clsx(
            "absolute -top-20 left-1/2 transform -translate-x-1/2 rounded-full pointer-events-none",
            haloSize,
            "bg-gradient-to-tr from-purple-400 via-pink-500 to-pink-400 opacity-40",
            "filter blur-[80px] saturate-150"
          )}
          style={{ zIndex: 0 }}
        />
      </motion.div>
    </div>
  );
};

export default LoadingLogoWithHalo;
