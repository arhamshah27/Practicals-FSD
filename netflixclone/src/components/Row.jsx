// src/components/Row.jsx
import React, { useRef } from "react";
import MovieCard from "./MovieCard";

export default function Row({ title, movies = [], onSelect }) {
  const sc = useRef();
  const scroll = (dir = 1) => {
    sc.current.scrollBy({ left: dir * 600, behavior: "smooth" });
  };

  return (
    <section style={{ padding: "20px 40px" }}>
      <h3 style={{ color: "#fff", margin: "6px 0" }}>{title}</h3>
      <div style={{ position: "relative" }}>
        {/* Left Button */}
        <button
          onClick={() => scroll(-1)}
          className="row-btn left"
        >
          ◀
        </button>

        {/* Movie Cards */}
        <div
          ref={sc}
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            padding: "10px 40px",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
          }}
        >
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} onClick={() => onSelect(m)} />
          ))}
        </div>

        {/* Right Button */}
        <button
          onClick={() => scroll(1)}
          className="row-btn right"
        >
          ▶
        </button>
      </div>
    </section>
  );
}
