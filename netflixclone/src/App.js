// src/App.js
import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import Row from "./components/Row";
import TrailerModal from "./components/TrailerModal";
import { fetchMovies, fetchVideos } from "./api/tmdb";
import "./index.css";

function App() {
  const [popular, setPopular] = useState([]);
  const [top, setTop] = useState([]);
  const [trending, setTrending] = useState([]);
  const [selected, setSelected] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchMovies("/movie/popular").then(setPopular).catch(()=>{});
    fetchMovies("/movie/top_rated").then(setTop).catch(()=>{});
    fetchMovies("/trending/all/week").then(setTrending).catch(()=>{});
  }, []);

  const handleSelect = async (item) => {
    setSelected(item);
    const type = item.media_type || "movie";
    const videos = await fetchVideos(type, item.id).catch(()=>[]);
    const trailer = videos.find(v => v.site === "YouTube" && v.type === "Trailer");
    setTrailerKey(trailer?.key || null);
    setOpen(true);
  };

  return (
    <div style={{ background: "#111", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ paddingTop: 70 }}>
        <Banner movie={popular[0]} />
        <Row title="Popular" movies={popular} onSelect={handleSelect} />
        <Row title="Top Rated" movies={top} onSelect={handleSelect} />
        <Row title="Trending" movies={trending} onSelect={handleSelect} />
      </div>
      <TrailerModal
  open={open}
  videoKey={trailerKey}
  onClose={() => setOpen(false)}
  movie={selected}   // <-- pass selected movie here
/>

    </div>
  );
}

export default App;
