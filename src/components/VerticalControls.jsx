import { useState } from 'react';
import { FaLightbulb, FaStopwatch, FaUser } from 'react-icons/fa';
import { useTheme } from './Context/ThemeContext';

const VerticalControls = () => {
  const [active, setActive] = useState(null);
  const { theme } = useTheme();

  const toggle = (btn) => {
    setActive(active === btn ? null : btn);
  };

  return (
    <div
      className={`absolute top-1/2 right-0 -translate-y-1/2 flex flex-col space-y-6 
        ${theme.bgColor} rounded-l-lg p-4 ${theme.borderColor} ${theme.shadow || 'shadow-lg'} 
        w-12 h-40 z-20 transition-colors duration-300`}
    >
      <button
        aria-label="Toggle lightbulb"
        onClick={() => toggle('lightbulb')}
        className={`text-2xl flex items-center justify-center transition-transform hover:scale-110 focus:scale-110 focus:outline-none ${
          active === 'lightbulb' ? 'text-yellow-400' : theme.secondaryText
        }`}
      >
        <FaLightbulb />
      </button>
      <button
        aria-label="Toggle stopwatch"
        onClick={() => toggle('stopwatch')}
        className={`text-2xl flex items-center justify-center transition-transform hover:scale-110 focus:scale-110 focus:outline-none ${
          active === 'stopwatch' ? 'text-blue-400' : theme.secondaryText
        }`}
      >
        <FaStopwatch />
      </button>
      <button
        aria-label="Toggle user"
        onClick={() => toggle('user')}
        className={`text-2xl flex items-center justify-center transition-transform hover:scale-110 focus:scale-110 focus:outline-none ${
          active === 'user' ? 'text-blue-400' : theme.secondaryText
        }`}
      >
        <FaUser />
      </button>
    </div>
  );
};

export default VerticalControls;
