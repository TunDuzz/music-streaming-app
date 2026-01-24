import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './contexts/PlayerContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Library from './pages/Library';
import Search from './pages/Search';
import './App.css';

function App() {
  return (
    <PlayerProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </Layout>
      </Router>
    </PlayerProvider>
  );
}

export default App;

