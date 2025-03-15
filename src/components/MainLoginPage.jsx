import { useEffect, useCallback } from "react";
import SpotifyLogo from "../assets/SpotifyLogo.png";
import { useNavigate } from "react-router-dom";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_DOMAIN;
const AUTH_URL = "https://accounts.spotify.com/authorize";
const SCOPES = "user-top-read";

export const MainLoginPage = () => {
    const navigate = useNavigate();
    const access_token = localStorage.getItem("access_token");

    // Генерация случайного state (безопасность)
    const generateRandomString = (length) => {
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from({ length }, () => possible.charAt(Math.floor(Math.random() * possible.length))).join("");
    };

    // Перенаправление на Spotify для входа
    const handleLogin = () => {
        if (access_token) {
            navigate("/logined");
            return;
        }
        const state = generateRandomString(16);
        window.location.href = `${AUTH_URL}?${new URLSearchParams({
            response_type: "code",
            client_id: CLIENT_ID,
            scope: SCOPES,
            redirect_uri: REDIRECT_URI,
            state: state,
        })}`;
    };

    const GetAccessRefreshTokens = useCallback(async (code) => {
        const url = "https://accounts.spotify.com/api/token";


        const body = new URLSearchParams({
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: "authorization_code",
        });

        const encodedCredentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${encodedCredentials}`,
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                body: body,
            });

            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            const data = await response.json();
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);
            navigate("/logined");
        } catch (error) {
            console.error("Error fetching access token:", error);
        }
    }, [navigate]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        // Проверяем, есть ли уже токен, чтобы избежать повторного запроса
        if (code && !access_token) {
            console.log("Authorization Code:", code);
            GetAccessRefreshTokens(code);
        }
    }, [access_token, GetAccessRefreshTokens]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
            <div className="mt-4 flex flex-col gap-4 bg-black items-center justify-center p-4 text-center">
                <h1 className="text-3xl font-bold text-center">
                    <span
                        className="text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text animate-gradient">
                        Welcome to your
                    </span>

                    <span className="inline-flex items-center gap-2 ml-2">
                        <span className="text-green-500 glow-green">Spotify</span>
                        <img src={SpotifyLogo} className="h-8 glow-green mr-2" alt="Spotify Logo"/>
                    </span>

                    <span
                        className="text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text animate-gradient">
                        statistic!
                    </span>
                </h1>

                <p className="text-lg font-semibold text-gray-500">Please login to view your statistic</p>

                <button
                    onClick={handleLogin}
                    className="px-4 py-2 bg-green-500 text-white text-center font-bold rounded-lg shadow-md hover:bg-green-600 transition"
                >
                    Login with Spotify
                </button>
            </div>

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

                    .glow-green {
                        text-shadow: 0 0 10px rgba(34, 197, 94, 0.8), 0 0 15px rgba(34, 197, 94, 0.7);
                    }
                `}
            </style>
        </div>
    );
};
