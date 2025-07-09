import React, { useEffect, useState } from "react";
import "./BubbleBackground.css";

const BubbleBackground = () => {
  const bubbleCount = 50;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 0); // Force quick render
    return () => clearTimeout(timer);
  }, []);

  const bubbles = Array.from({ length: bubbleCount });

  if (!loaded) return null;

  return (
    <div className="bubbles">
      {bubbles.map((_, i) => {
        const left = `${Math.random() * 100}vw`;
        const radius = `${1 + Math.random() * 9}vw`;
        const floatDuration = `${6 + Math.random() * 6}s`; // 6–12s
        const swayDuration = `${4 + Math.random() * 2}s`;  // 4–6s
        const floatDelay = "0s"; // Immediate
        const swayDelay = `${Math.random()}s`;

        const swayType = Math.random() > 0.5 ? "sway-left-to-right" : "sway-right-to-left";

        return (
          <div
            className="bubble"
            key={i}
            style={{
              "--bubble-left-offset": left,
              "--bubble-radius": radius,
              "--bubble-float-duration": floatDuration,
              "--bubble-sway-duration": swayDuration,
              "--bubble-float-delay": floatDelay,
              "--bubble-sway-delay": swayDelay,
              "--bubble-sway-type": swayType,
            }}
          />
        );
      })}
    </div>
  );
};

export default BubbleBackground;
