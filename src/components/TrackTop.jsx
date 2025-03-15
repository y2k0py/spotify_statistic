import { motion } from "framer-motion";
import {useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";

export const Tracks = () => {
    const navigate = useNavigate();
    const [headerBlur, setHeaderBlur] = useState(0);
    const rafId = useRef(null);
    const containerRef = useRef(null);
    const handleScroll = () => {
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
        }
        rafId.current = requestAnimationFrame(() => {
            if (!containerRef.current) return;
            const scrollTop = containerRef.current.scrollTop;
            // Рассчитываем блюр: при прокрутке на 20px — 1px блюра, максимум 10px
            const newBlur = Math.min(scrollTop / 20, 10);
            setHeaderBlur(newBlur);
        });
    };
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll, { passive: true });
        }
        return () => {
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

    return (
        <div className='h-screen w-screen bg-black text-white font-bold'>
            <motion.header
                initial={{opacity: 0, filter: "blur(10px)"}}
                animate={{opacity: 1, filter: "blur(0px)"}}
                transition={{duration: 1, ease: "easeOut", delay: 0.5}}
                className="fixed top-0 left-0 mt-3 right-0 flex items-center px-4"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    backdropFilter: `blur(${headerBlur}px)`,
                    transition: "backdrop-filter 0.3s ease, background-color 0.3s ease",
                    height: "60px",
                    zIndex: 1000,
                }}
            >
                <button onClick={() => navigate(-1)} className="text-white mr-4">
                    &#8592;
                </button>
                <h1 className="text-white text-3xl font-bold text-center">IN DEVELOPMENT</h1>

            </motion.header>

        </div>
    )
}