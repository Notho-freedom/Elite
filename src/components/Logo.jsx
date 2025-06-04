import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

const Logo = () => {
    const [unit, setUnit]=useState('30vh')
    useEffect(() => {
        window.innerHeight > window.innerWidth ? setUnit('30vw'):setUnit('30vh');
    }, [window.innerHeight, window.innerWidth])
    
    return (
        <div className="flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <img src="/logoo.png" alt="Logo" className={clsx(unit)} />
        </div>
    );
}

export default Logo;
