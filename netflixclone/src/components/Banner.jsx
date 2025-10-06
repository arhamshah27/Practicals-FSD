// src/components/Banner.jsx
import React from "react";

export default function Banner({ movie }) {
  if (!movie) return null;
  const bg = `https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`;
  return (
    <header style={{
      height: "60vh",
      backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.7)), url(${bg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: "#fff",
      padding: "90px 40px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }}>
      <h1 style={{ fontSize: "3rem", margin: 0 }}>{movie.title || movie.name}</h1>
      <p style={{ maxWidth: 700 }}>{movie.overview?.slice(0, 200)}...</p>
    </header>
  );
}
