import { useState, useEffect } from "react";
import { fetchWithAuth } from "../api.js";
import { motion } from "framer-motion";
import { BsFillPeopleFill } from "react-icons/bs";

const starGlowStyles = `
@keyframes starPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}
.star-glow-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: starPulse 8s infinite alternate ease-in-out;
  z-index: 0;
}
`;

const generateStarPoints = (cx, cy) => {
    const spikes = 5; // Фиксируем 5 лучей для простоты и стабильности
    const results = [];
    const step = Math.PI / spikes;

    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? 50 : 20; // Чёткие длинные (50) и короткие (20) лучи
        const angle = i * step;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        results.push(`${x},${y}`);
    }

    return results.join(" ");
};

export const ArtistTop = () => {
    const token = localStorage.getItem("access_token");
    const [artists, setArtists] = useState([]);

    const fetchArtists = async () => {
        const response = await fetchWithAuth("/me/top/artists");
        const data = await response.json();
        setArtists(data.items);
    };

    useEffect(() => {
        fetchArtists();
    }, []);

    if (!token) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                Пожалуйста, войдите в систему
            </div>
        );
    }

    return (
        <>
            <style>{`
        ${starGlowStyles}
        .glass-block {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          padding: 16px;
          margin-bottom: 35px;
          z-index: 10;
        }
        .noise-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          background-image: url('https://evtifeev.com/wp-content/uploads/2018/05/photon.jpg');
          background-size: cover;
          opacity: 0.1;
          z-index: 15;
        }
        @keyframes gradient {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s infinite ease-in-out;
        }
      `}</style>

            <div className="min-h-screen bg-black flex flex-col items-center p-4">
                <motion.h1
                    className='text-4xl bg-gradient-to-r from-green-300 via-green-500 to-green-800 bg-clip-text text-transparent animate-gradient font-bold text-center mt-5 absolute top-2 left-1/2 transform -translate-x-1/2'
                    initial={{ opacity: 0, filter: "blur(5px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    <div className='flex items-center justify-center'>
                        <BsFillPeopleFill className='text-green-500 h-9 mr-3' />
                        Artists
                    </div>
                </motion.h1>
                <div className="w-full max-w-md mt-20">
                    {artists.map((artist, index) => {
                        const imageUrl = artist.images?.[0]?.url || "";
                        const glowColors = ["gold", "silver", "#cd7f32"];

                        return (
                            <motion.div
                                key={artist.id}
                                initial={{ opacity: 0, filter: "blur(10px)" }}
                                animate={{ opacity: 1, filter: "blur(0px)" }}
                                transition={{ duration: 1, delay: index * 0.2 }}
                                className="relative"
                            >
                                {index < 3 && (
                                    <div className="star-glow-container">
                                        <div style={{ width: "100px", height: "100px" }}>
                                            <svg
                                                viewBox="0 0 100 100"
                                                preserveAspectRatio="none"
                                                style={{ width: "100%", height: "100%", filter: "blur(10px)" }}
                                            >
                                                <defs>
                                                    <filter id={`glow-${index}`}>
                                                        <feGaussianBlur stdDeviation="3" result="blurred" />
                                                        <feMerge>
                                                            <feMergeNode in="blurred" />
                                                            <feMergeNode in="SourceGraphic" />
                                                        </feMerge>
                                                    </filter>
                                                </defs>
                                                <polygon
                                                    filter={`url(#glow-${index})`}
                                                    fill={glowColors[index]}
                                                    opacity="1"
                                                    points={generateStarPoints(50, 50)}
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                )}

                                <div className="glass-block">
                                    <a href={artist.external_urls.spotify}>
                                        <div className="noise-overlay"></div>
                                        <div className="columns-2">
                                            <div className="z-20 flex justify-left">
                                                <img
                                                    src={imageUrl}
                                                    alt={artist.name}
                                                    className="w-35 h-35 rounded-full"
                                                />
                                            </div>
                                            <div className="text-white font-bold">
                                                <h1
                                                    className={
                                                        index === 0
                                                            ? "text-5xl"
                                                            : index === 1
                                                                ? "text-4xl"
                                                                : index === 2
                                                                    ? "text-3xl"
                                                                    : "text-2xl"
                                                    }
                                                >
                                                    #{index + 1}
                                                </h1>
                                                <div className="rounded-2xl">
                                                    <p className="text-2xl">{artist.name}</p>
                                                    <span className="font-normal text-gray-300">
                            <p>Popularity: {artist.popularity}%</p>
                            <p>Followers: {artist.followers.total}</p>
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};
