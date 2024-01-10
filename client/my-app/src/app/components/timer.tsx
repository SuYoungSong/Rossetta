import React, {memo, useEffect, useState} from "react";
import "@/app/styles/timer.css";
interface TimerProps{
    min_num?:number;
    sec_num:number;
    classname: string;
}

export const Timer: React.FC<TimerProps> = memo(({min_num, sec_num, classname}) => {
    const MINUTES_IN_MS = (min_num ? min_num * 60 * 1000 : sec_num * 1000);
    const INTERVAL = 1000;
    const [timeLeft, setTimeLeft] = useState<number>(MINUTES_IN_MS);

    const minutes = String(Math.floor((timeLeft / (1000 * 60)) % 60)).padStart(2, '0');
    const second = String(Math.floor((timeLeft / 1000) % 60)).padStart(2, '0');
    const milliseconds = String(Math.floor(timeLeft % 1000)).padStart(2, '0');


    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - INTERVAL);
        }, INTERVAL);

        if (timeLeft <= 0) {
            clearInterval(timer);
        }

        return () => {
            clearInterval(timer);
        };
    }, [timeLeft]);

    return (
        <>
            {timeLeft <= 0 ?
                (<>
                    <div className={classname}>인증 만료</div>
                </>) :
                (<>
                    {min_num ? (
                            <div className={classname}>
                                {minutes} : {second}
                            </div>
                        ) : (
                            <div className={classname}>
                                {second}초
                            </div>
                        )}
                </>)}
        </>
        )
    ;
});