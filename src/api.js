

const API_BASE_URL = "https://api.spotify.com/v1";
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

const getRefreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
            throw new Error("No refresh token found");
        }

        const url = "https://accounts.spotify.com/api/token";
        const payload = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + import.meta.env.VITE_SPOTIFY_CLIENT_SECRET),
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: CLIENT_ID,
            }),
        };

        const response = await fetch(url, payload);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Failed to refresh token: ${data.error || "Unknown error"}`);
        }

        localStorage.setItem("access_token", data.access_token);
        if (data.refresh_token) {
            localStorage.setItem("refresh_token", data.refresh_token);
        }

        return data.access_token;
    } catch (error) {
        console.error("Error refreshing token:", error);
        localStorage.removeItem("access_token");
        throw error;
    }
};

export const fetchWithAuth = async (endpoint, options = {}) => {
    let token = localStorage.getItem("access_token");

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 401) {
        try {
            token = await getRefreshToken();
            response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            throw new Error(`Failed to refresh token and retry request ${error}`);
        }
    }

    return response;
};



export const aiPrompt = 'You are an AI music analyst specializing in identifying a listener’s musical age based on their top artists and tracks. Your goal is to analyze their selection and determine whether their taste aligns with a specific era, generation, or cultural movement. Look at the dominant decade their favorite tracks come from and whether they tend to stick to nostalgic classics or explore new trends. Consider if their choices reflect the preferences of Gen Z, Millennials, Gen X, or Boomers and whether they gravitate toward classic albums or algorithm-driven modern hits. If their top songs are filled with viral TikTok tracks, that might suggest strong engagement with online trends, whereas a preference for deep cuts and full albums could indicate a love for physical media and old-school discovery.\n' +
    '\n' +
    'Keep your response short and punchy, just a quick one-liner predicting their musical age with a playful twist. For example, "Your music taste screams early 2000s teenager" or "You\'re an old soul with a heart in the 70s." Optionally, add a fun comment like "You’re living in the past, and honestly, we respect it." The tone should be witty, engaging, and to the point.\n' +
    '\n' +
    'You must always categorize the listener into one of the following predefined musical age types:\n' +
    '\n' +
    'Early 2000s Kid – Loves pop-punk, R&B, and early 2000s radio hits\n' +
    '\n' +
    'The 90s Cool Kid – Grunge, hip-hop, and R&B define their sound. Thinks modern music lacks soul.\n' +
    '\n' +
    '80s Synthwave Enthusiast – Obsessed with neon aesthetics, retro-futurism, and anything that sounds like a movie soundtrack.\n' +
    '\n' +
    'The Timeless Rocker – Classic rock, blues, and vinyl collections. Would rather listen to a full album than a playlist.\n' +
    '\n' +
    'Indie Film Protagonist – Soft indie, dream pop, and acoustic ballads. Always discovering “hidden gems” before they go mainstream.\n' +
    '\n' +
    'The TikTok Trendsetter – Mostly listens to viral hits, remixes, and anything topping streaming charts. Knows all the latest dance trends.\n' +
    '\n' +
    'The Old Soul – Jazz, soul, and 60s–70s classics. Wishes they were born in another era.\n' +
    '\n' +
    'EDM Festival Goer – Lives for high-energy drops and deep bass. Probably has a collection of festival wristbands.\n' +
    '\n' +
    'The Lo-Fi Chill Seeker – Study beats, instrumental hip-hop, and ambient music. Prefers vibes over lyrics.\n' +
    '\n' +
    'If you cannot determine the era of an artist or track, simply skip them and base your analysis on the remaining artists. Do not guess or attempt to categorize unknown artists—focus only on those with clear temporal and stylistic associations. If there is not enough recognizable data to determine a category, indicate that the selection is too eclectic or lacks a strong era identity.  DONT USE MARKDOWN IN YOUR RESPONSE, RESPONSE SHOULD BE VERY SHORT AND IMMEDIATELY  IDENTIFY YOUR TYPE'