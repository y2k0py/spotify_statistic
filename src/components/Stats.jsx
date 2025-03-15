import {useEffect, useState} from "react";
import {aiPrompt, fetchWithAuth} from "../api.js";
import {HfInference} from "@huggingface/inference";
import { motion } from "framer-motion";
import {useNavigate} from "react-router-dom";
import { TbMusic } from "react-icons/tb";
import seeya from "../assets/seeya.png";

export const Stats = () => {
    const [topArtists, setTopArtists] = useState([]);
    const [topTracks, setTopTracks] = useState([]);
    const [AIText, setAIText] = useState(localStorage.getItem("aiResponse") || "");
    const [visibleText, setVisibleText] = useState([]);
    const navigate = useNavigate();


    const fetchTopArtistsTracks = async () => {
        try {
            const artists = await fetchWithAuth('/me/top/artists');
            const artists_data = await artists.json();

            const tracks = await fetchWithAuth('/me/top/tracks' );
            const tracks_data = await tracks.json();

            setTopArtists(artists_data.items);
            setTopTracks(tracks_data.items);

            const artistsListText = artists_data.items
                .map((artist, index) => `${index + 1}. ${artist.name}`)
                .join('\n');

            const tracksListText = tracks_data.items
                .map((track, index) => `${index + 1}. ${track.name} - ${track.artists[0].name}`)
                .join('\n');


            return {
                top_artists: "Top Artists:\n" + artistsListText,
                top_tracks: "Top Tracks:\n" + tracksListText
            };
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchAIResponse = async (data) => {
        const cachedResponse = localStorage.getItem("aiResponse");
        if (cachedResponse) {
            setAIText(cachedResponse);
            setVisibleText(cachedResponse.split(""));
            return;
        }

        const client = new HfInference(import.meta.env.VITE_DEEPSEEK_API_KEY);
        let out = "";
        let tempVisibleText = [];

        const stream = client.chatCompletionStream({
            model: "meta-llama/Meta-Llama-3-8B-Instruct",
            messages: [
                { role: 'system', content: aiPrompt },
                { role: "user", content: `Here are my top artists and tracks:\n${data.top_tracks}\n${data.top_artists}` },
            ],
            temperature: 0.5,
            max_tokens: 256,
            top_p: 0.5
        });

        for await (const chunk of stream) {
            if (chunk.choices && chunk.choices.length > 0) {
                const newContent = chunk.choices[0].delta.content;
                out += newContent;
                console.log(out)
                setAIText(out);
                tempVisibleText.push(newContent);
                setVisibleText([...tempVisibleText]);
            }
        }

        localStorage.setItem("aiResponse", out);
    };

    const TopButton = (top, isTracks = false, onClick) => {
        if (!top || top.length === 0) return null;

        return (
            <button
                className="relative px-25 py-10 text-white text-center font-bold rounded-3xl shadow-md transition items-center overflow-hidden mt-3 group"
                onClick={onClick}
            >
                <div
                    className="absolute inset-0 flex flex-wrap gap-0 blur-xs opacity-40 rounded-2xl transition-transform duration-300 scale-100 group-hover:scale-110 group-active:scale-95 pointer-events-none"
                >
                    {top.slice(0, 3).map((artist, index) => (
                        <img
                            key={index}
                            src={isTracks
                                ? artist.album?.images?.[0]?.url
                                : artist.images?.[0]?.url}
                            alt={artist.name}
                            className="w-1/3 h-full object-cover transition-transform duration-300"
                        />
                    ))}
                </div>

                <div className="absolute inset-0 bg-opacity-50 pointer-events-none"></div>

                <span className="relative z-10 text-2xl">
                {isTracks ? 'Top Tracks' : 'Top Artists'}
            </span>
            </button>
        );
    };

    const generateAIRecommendations = async () => {
        const data = await fetchTopArtistsTracks();
        await fetchAIResponse(data);
    };

    useEffect(() => {
        generateAIRecommendations();
    }, []);

    return (
        <div
            className='flex flex-col items-center min-h-screen bg-black p-5 w-full h-full overflow-hidden'>
            <motion.header className="fixed top-0 left-25 mt-3 mb-4 right-0 flex items-center flex content-center px-4"
                           initial={{opacity: 0, filter: "blur(5px)"}}
                           animate={{opacity: 1, filter: "blur(0px)"}}
                           transition={{duration: 1, delay: 0.3}}><img
                src={seeya} alt="seeya" className='h-20'/></motion.header>

            <div className="flex flex-col items-center justify-center text-center mt-18 ">
                <motion.div
                    className="items-center"
                    initial={{opacity: 0, filter: "blur(10px)"}}
                    animate={{opacity: 1, filter: "blur(0px)"}}
                    transition={{duration: 1, delay: 0.3}}
                >
                    {TopButton(topArtists, false, () => navigate('/stats/artists'))}
                    {TopButton(topTracks, true, () => navigate('/stats/tracks'))}
                </motion.div>

                <motion.div
                    className='rounded-2xl p-2 mt-5 mb-0'
                    initial={{opacity: 0, filter: "blur(10px)"}}
                    animate={{opacity: 1, filter: "blur(0px)"}}
                    transition={{duration: 1, delay: 0.3}}
                >
                    <motion.h1
                        className='text-3xl font-bold text-center'
                        initial={{opacity: 0, filter: "blur(10px)"}}
                        animate={{opacity: 1, filter: "blur(0px)"}}
                        transition={{duration: 1, delay: 0.3}}>
                        <div className='flex items-center justify-center gap-1'>
                            <TbMusic className='text-purple-500'/>
                            <span
                                className='bg-gradient-to-r from-white via-purple-500 to-white bg-clip-text text-transparent animate-gradient'>
                                Your AI-Gen Type:
                            </span>
                        </div>
                    </motion.h1>

                    <p className='text-lg text-gray-500 text-center pt-3'>
                        {AIText.split(" ").map((word, index) => (
                            <motion.span
                                key={index}
                                initial={{opacity: 0, filter: "blur(10px)"}}
                                animate={{opacity: 1, filter: "blur(0px)"}}
                                transition={{
                                    duration: 0.8,
                                    delay: 0.8 + index * 0.05
                                }}
                                className='text-white font-bold inline-block mr-1'
                            >
                                {word}
                            </motion.span>
                        ))}
                    </p>
                </motion.div>
                <motion.span
                    className='text-gray-700 font-bold'
                    initial={{opacity: 0, filter: "blur(10px)"}}
                    animate={{opacity: 1, filter: "blur(0px)"}}
                    transition={{
                        duration: 0.8,
                        delay: 0.8 + (AIText.split(" ").length - 1) * 0.05
                    }}
                >
                    This is AI generated response based on your top artists and tracks, it might not be right.
                </motion.span>
            </div>
            <style>
                {`
        @keyframes gradient {
            0% { background-position: 0% 0%; }
            50% { background-position: 100% 100%; }
            100% { background-position: 0% 0%; }
        }

        .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 6s infinite ease-in-out;
        }
    `}
            </style>
        </div>)
        ;

};
