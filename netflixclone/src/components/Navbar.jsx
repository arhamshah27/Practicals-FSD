import React, { useEffect, useState } from "react";

export default function Navbar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 70);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "10px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "background 0.3s",
        background: show ? "rgba(0,0,0,0.9)" : "transparent",
      }}
    >
      {/* Left side: logo + sections */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ fontWeight: 700, color: "#e50914", fontSize: 22 }}>
          NetClone
        </div>
        <span style={{ color: "#fff", cursor: "pointer" }}>Home</span>
        <span style={{ color: "#fff", cursor: "pointer" }}>Movies</span>
        <span style={{ color: "#fff", cursor: "pointer" }}>Webseries</span>
        <span style={{ color: "#fff", cursor: "pointer" }}>Genres</span>
      </div>

      {/* Right side: Logout button + profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        <button
          style={{
            backgroundColor: "#e50914",
            color: "#fff",
            border: "none",
            padding: "6px 14px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          Logout
        </button>
       <img
  src="/profile.png"
  alt="profile"
  style={{ width: 32, height: 32, borderRadius: "50%" }}
/>

      </div>
    </nav>
  );
}
