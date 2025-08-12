import { motion } from 'framer-motion';

export const GameOfThronesBanner = ({title, text}) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, type: "spring" }}
    className="got-banner text-center py-4 mb-8 mx-auto max-w-3xl rounded-sm relative"
  >
  
    <div className="relative z-10">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="flex justify-center items-center"
      >
      
        <svg className="w-8 h-8 mr-2 fill-current text-amber-400" viewBox="0 0 24 24">
          <path d="M12 2L4 12l8 10 8-10z" />
        </svg>
        <h2 className="text-[2vw] font-bold text-amber-300 tracking-widest">
          {title}
        </h2>
        <svg className="w-8 h-8 ml-2 fill-current text-amber-400" viewBox="0 0 24 24">
          <path d="M12 22L4 12l8-10 8 10z" />
        </svg>
      </motion.div>
      <p className="text-amber-100 mt-2 text-[1vw] tracking-wide">
      {text}
      </p>
    </div>
    
    {/* Effets métalliques */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
      {[...Array(10)].map((_, i) => (
        <div 
          key={i}
          className="absolute bg-amber-400"
          style={{
            width: `${Math.random() * 30 + 10}px`,
            height: '1px',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
    </div>
  </motion.div>
);