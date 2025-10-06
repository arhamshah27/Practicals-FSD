import React, { useEffect } from "react";
import YouTube from "react-youtube";

export default function TrailerModal({ open, videoKey, onClose, movie }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        zIndex: 3000,
        overflowY: "auto",
        paddingTop: "50px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "90%",
          maxWidth: 1100,
          backgroundColor: "#111",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            fontSize: 18,
            cursor: "pointer",
            zIndex: 4000,
          }}
        >
          ✕
        </button>

        {/* Trailer */}
        <div style={{ width: "100%", aspectRatio: "16/9", background: "#000" }}>
          {videoKey ? (
            <YouTube
              videoId={videoKey}
              opts={{
                width: "100%",
                height: "100%",
                playerVars: {
                  autoplay: 1,
                  modestbranding: 1,
                  rel: 0,
                  controls: 1,
                },
              }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <div
              style={{
                color: "#fff",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              No trailer available
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div style={{ padding: "20px 30px", color: "#fff" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: "1.8rem" }}>
            {movie?.title || movie?.name}
          </h2>
          <p style={{ fontSize: "1rem", lineHeight: "1.5", color: "#ccc" }}>
            {movie?.overview || "No description available."}
          </p>

          {/* Action buttons */}
          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <button
              style={{
                background: "#e50914",
                border: "none",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ▶ Play
            </button>
            <button
              style={{
                background: "rgba(109,109,110,0.7)",
                border: "none",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              + My List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
