import './App.css'
import {MainLoginPage} from "./components/MainLoginPage.jsx";
import {SuccessfullyLogin} from "./components/SuccsessfullyLogin.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {ArtistTop} from "./components/ArtistTop.jsx";
import {Stats} from "./components/Stats.jsx";

export const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLoginPage />} />
                <Route path="/logined" element={<SuccessfullyLogin />} />
                <Route path="/stats/artists" element={<ArtistTop />} />
                <Route path="/stats" element={<Stats/>} />
            </Routes>
        </Router>
    );
};

export default App
