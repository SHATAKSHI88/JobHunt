import React, { useEffect, useState } from 'react'

// A thin bar that flashes across the top on every navigation, giving the
// app a sense of speed/responsiveness even though there's no real async
// page load happening (each route in this app renders instantly — this is
// purely a perceived-performance cue, like YouTube/GitHub's nav bar).
const RouteProgressBar = () => {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        setVisible(true);
        setProgress(20);

        const t1 = setTimeout(() => setProgress(70), 80);
        const t2 = setTimeout(() => setProgress(100), 220);
        const t3 = setTimeout(() => setVisible(false), 420);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    if (!visible) return null;

    return (
        <div className='fixed top-0 left-0 right-0 z-[60] h-0.5 bg-transparent'>
            <div
                className='h-full bg-primary transition-all ease-out'
                style={{
                    width: `${progress}%`,
                    transitionDuration: progress === 100 ? '150ms' : '250ms',
                    opacity: progress === 100 ? 0 : 1,
                }}
            />
        </div>
    )
}

export default RouteProgressBar
