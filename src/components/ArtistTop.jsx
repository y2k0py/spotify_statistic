import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { fetchWithAuth } from "../api.js";
import { useNavigate } from "react-router-dom";
import star_wink from "../assets/star_wink.gif";

export const ArtistTop = () => {
    const token = localStorage.getItem("access_token");
    const [artists, setArtists] = useState([]);
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const rafId = useRef(null);
    const [headerBlur, setHeaderBlur] = useState(0); // состояние для блюра в хедере

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }
        const fetchArtists = async () => {
            const response = await fetchWithAuth("/me/top/artists");
            const data = await response.json();
            setArtists(data.items);
        };
        fetchArtists();
    }, [token, navigate]);

    // Функция для обновления масштаба блоков артистов
    const updateScales = () => {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerCenterY = containerRect.top + containerRect.height / 2;
        const blocks = containerRef.current.querySelectorAll(".artist-block");

        blocks.forEach((block) => {
            const blockRect = block.getBoundingClientRect();
            const blockCenterY = blockRect.top + blockRect.height / 2;
            const distance = Math.abs(containerCenterY - blockCenterY);
            const maxScale = 1.2;
            const minScale = 0.8;
            const threshold = containerRect.height;
            let scale = maxScale - (distance / threshold) * (maxScale - minScale);
            scale = Math.min(Math.max(scale, minScale), maxScale);
            block.style.transform = `scale(${scale})`;
        });
    };

    // Обработчик прокрутки: обновляет и масштабы блоков, и блюр в хедере
    const handleScroll = () => {
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
        }
        rafId.current = requestAnimationFrame(() => {
            updateScales();
            if (!containerRef.current) return;
            const scrollTop = containerRef.current.scrollTop;
            // Рассчитываем блюр: при прокрутке на 20px — 1px блюра, максимум 10px
            const newBlur = Math.min(scrollTop / 20, 10);
            setHeaderBlur(newBlur);
        });
    };

    useEffect(() => {
        updateScales();
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
    }, [artists]);

    return (
        <div className="bg-black h-screen w-screen relative overflow-hidden">
            <motion.header
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                className="fixed top-0 left-0 right-0 flex items-center px-4"
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
                <h1 className="text-white text-3xl font-bold text-center">Artists TOP</h1>
            </motion.header>

            {/* Звезда на заднем фоне */}
            <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            >
                <img src={star_wink} alt="My GIF" width="300" height="200" />
            </motion.div>

            {/* Прокручиваемый контейнер с карточками артистов */}
            <div
                ref={containerRef}
                className="flex flex-col overflow-y-scroll h-full items-center py-10 snap-y transform-gpu z-10"
            >
                {artists.map((artist, index) => (
                    <motion.div
                        key={artist.id}
                        className="artist-block snap-center flex flex-col rounded-xl p-5 m-6 transition-[transform] duration-300 ease-out transform-gpu"
                        style={{
                            backgroundColor: "rgba(0, 0, 0, 0.2)",
                            backdropFilter: "blur(10px)",
                        }}
                        initial={{ opacity: 0, filter: "blur(10px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.9, ease: "easeOut", delay: index * 0.2 }}
                    >
                        <div className="flex items-center mb-4">
                            {artist.images && artist.images[0] && (
                                <img
                                    src={artist.images[0].url}
                                    alt={artist.name}
                                    className="w-28 h-28 rounded-full mr-6 border-4 transform-gpu"
                                />
                            )}
                            <div>
                                <h2 className="text-white text-1xl font-bold">{artist.name}</h2>
                                <h1 className='text-white text-3xl font-bold'>{index + 1}</h1>
                            </div>
                        </div>

                    </motion.div>
                ))}
            </div>
        </div>
    );
};
