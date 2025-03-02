import {useEffect, useState} from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const SuccessfullyLogin = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        confetti({
            particleCount: 300,
            spread: 400,
            origin: { y: 0.5 },
        });

        const interval = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        // Навигация после 3 секунд
        const timeout = setTimeout(() => {
            navigate("/stats");
        }, 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black">
            <motion.div className="flex flex-col items-center justify-center h-screen bg-black"
                initial={{opacity: 0, filter: "blur(10px)"}}
                animate={{opacity: 1, filter: "blur(0px)"}}
                transition={{duration: 1, delay: 0.01}}>
                <h1 className="text-3xl font-bold text-center leading-normal text-transparent bg-gradient-to-r from-green-400 via-green-600 to-green-300 bg-clip-text animate-gradient">
                    You have successfully logged in!
                </h1>
                <p className="text-lg text-gray-500 mt-4">Redirecting to stats in {countdown} seconds...</p>
            </motion.div>

            <style>
                {`
                    @keyframes gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }

                    .animate-gradient {
                        background-size: 200% 200%;
                        animation: gradient 3s infinite linear;
                    }
                `}
            </style>
        </div>
    );
};