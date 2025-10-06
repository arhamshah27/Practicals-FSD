// src/components/MovieCard.jsx
import React from "react";

export default function MovieCard({ movie, onClick }) {
  const poster = `https://image.tmdb.org/t/p/w300${movie.poster_path || movie.backdrop_path}`;
  return (
    <div onClick={onClick} style={{
      minWidth: 180, cursor: "pointer", transition: "transform 0.2s",
    }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
      <img src={poster} alt={movie.title || movie.name} style={{ width: "100%", borderRadius: 6 }} />
      <div style={{ color: "#fff", marginTop: 6, fontSize: 14 }}>{movie.title || movie.name}</div>
    </div>
  );
}
