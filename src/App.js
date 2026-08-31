import { useState, useEffect, useRef } from "react";
import lottie from "lottie-web";
import "./App.css";

const DAILY_LIMIT = 4;
const DAY_MS = 24 * 60 * 60 * 1000;

function App() {
  const [advice, setAdvice] = useState("");
  const [remaining, setRemaining] = useState(DAILY_LIMIT);
  const [resetTime, setResetTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shouldShowAnimationOnLoad, setShouldShowAnimationOnLoad] =
    useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const savedRemaining = localStorage.getItem("remaining");
    const savedResetTime = Number(localStorage.getItem("resetTime"));

    const now = Date.now();
    if (!savedResetTime || now > savedResetTime || savedRemaining === null) {
      resetDailyLimit();
    } else {
      const loaded = Number(savedRemaining);
      setRemaining(loaded);
      setResetTime(savedResetTime);

      // If loaded remaining is 1 or 0, show animation on load
      if (loaded <= 1) {
        setShouldShowAnimationOnLoad(true);
      }
    }
    hasLoadedRef.current = true;
  }, []);

  function resetDailyLimit() {
    const nextReset = Date.now() + DAY_MS;
    setRemaining(DAILY_LIMIT);
    setResetTime(nextReset);
    localStorage.setItem("remaining", DAILY_LIMIT);
    localStorage.setItem("resetTime", nextReset);
  }

  async function getAdvice() {
    if (remaining <= 0) return;

    setIsLoading(true);
    setError("");

    try {
      const adviceEndpoint =
        process.env.REACT_APP_ADVICE_ENDPOINT || "/api/advice";
      const res = await fetch(adviceEndpoint);
      if (!res.ok) throw new Error("Unable to reach the advice service");
      const data = await res.json();

      setAdvice(data.advice);

      const newRemaining = remaining - 1;
      setRemaining(newRemaining);
      localStorage.setItem("remaining", newRemaining);
    } catch (requestError) {
      setError("We couldn't find a new thought right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const resetLabel = resetTime
    ? new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "2-digit",
      }).format(resetTime)
    : "tomorrow";

  return (
    <div className="App">
      <main className="container">
        <header className="topbar">
          <div className="brand">
            <span className="brandMark">
              <Icon name="bulb" />
            </span>
            <span>advisor</span>
          </div>
          <div className="dateLabel">
            <Icon name="calendar" /> Daily practice
          </div>
        </header>

        <header className="hero">
          <p className="eyebrow">A moment of perspective</p>
          <h1 className="title">Make room for a better thought.</h1>
          <p className="subtitle">
            A small piece of wisdom, ready when you are.
          </p>
        </header>

        <section className="card">
          <div className="cardHeader">
            <div>
              <p className="sectionLabel">Today's reflection</p>
              <p className="sectionMeta">
                Personal guidance, one thought at a time
              </p>
            </div>
            <span className="statusIcon">
              <Icon name="quote" />
            </span>
          </div>

          <div
            className={`adviceBox${advice && remaining > 0 ? " hasAdvice" : ""}`}
          >
            {remaining <= 0 || (shouldShowAnimationOnLoad && remaining <= 1) ? (
              <LimitReachedAnimation />
            ) : advice ? (
              <blockquote className="advice">
                <span className="quoteMark">“</span>
                {advice}
                <span className="quoteMark closing">”</span>
              </blockquote>
            ) : (
              <div className="emptyState">
                <span className="emptyIcon">
                  <Icon name="compass" />
                </span>
                <p className="hint">Your next insight is just a moment away.</p>
              </div>
            )}
          </div>

          {error && (
            <p className="errorMessage">
              <Icon name="alert" /> {error}
            </p>
          )}

          <div className="controls">
            <button
              className="btn"
              onClick={getAdvice}
              disabled={
                remaining <= 0 ||
                (shouldShowAnimationOnLoad && remaining <= 1) ||
                isLoading
              }
            >
              {isLoading
                ? "Finding a thought..."
                : remaining <= 0 ||
                    (shouldShowAnimationOnLoad && remaining <= 1)
                  ? "Daily limit reached"
                  : "Give me perspective"}
              {!isLoading && (
                <Icon
                  name={
                    remaining <= 0 ||
                    (shouldShowAnimationOnLoad && remaining <= 1)
                      ? "sad"
                      : "arrow"
                  }
                />
              )}
            </button>
            <div className="meta">
              <Message remaining={remaining} />
            </div>
          </div>

          {(remaining <= 0 ||
            (shouldShowAnimationOnLoad && remaining <= 1)) && (
            <p className="limitNotice">
              <Icon name="warning" /> You've reached today's limit. New thoughts
              arrive at {resetLabel}.
            </p>
          )}
        </section>

        <footer className="footer">
          <Icon name="lock" /> Three considered thoughts, every day
        </footer>
      </main>
    </div>
  );
}

function LimitReachedAnimation() {
  const animationRef = useRef(null);

  useEffect(() => {
    const animation = lottie.loadAnimation({
      container: animationRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/limitReached.json",
    });

    return () => animation.destroy();
  }, []);

  return (
    <div
      ref={animationRef}
      className="limitAnimation"
      role="img"
      aria-label="Daily advice limit reached"
    />
  );
}

function Message({ remaining }) {
  const displayCount = Math.max(0, remaining - 1);
  return (
    <p>
      <span className="counter">{displayCount}</span>
      <span>
        {displayCount === 1 ? " thought" : " thoughts"} remaining today
      </span>
    </p>
  );
}

function Icon({ name }) {
  const paths = {
    alert: (
      <>
        <path
          d="M10 2.5 18.5 17H1.5L10 2.5Z"
          fill="currentColor"
          stroke="none"
        />
        <path d="M10 7.5v4.5M10 14.5h.01" stroke="#fff" strokeWidth="1.7" />
      </>
    ),
    arrow: (
      <>
        <path d="M3 12h13" />
        <path d="m11 6 6 6-6 6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4.5" width="14" height="14" rx="2" />
        <path d="M6.5 2.5v4M13.5 2.5v4M3 8.5h14" />
      </>
    ),
    compass: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="m12.8 7.2-1.7 3.9-3.9 1.7 1.7-3.9 3.9-1.7Z" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="8" width="12" height="9" rx="2" />
        <path d="M6.5 8V6a3.5 3.5 0 0 1 7 0v2" />
      </>
    ),
    bulb: (
      <>
        <path d="M7 13.5c-1.1-.8-1.8-2.1-1.8-3.6a4.8 4.8 0 1 1 9.6 0c0 1.5-.7 2.8-1.8 3.6-.6.5-.9.9-1 1.5H8c-.1-.6-.4-1-1-1.5Z" />
        <path d="M8.2 17h4.4M8.8 19h3.2" />
      </>
    ),
    quote: (
      <>
        <path d="M4 13.5h3.5V9H4v4.5ZM12.5 13.5H16V9h-3.5v4.5Z" />
        <path d="M4 9c0-2 1.2-3.5 3.5-4M12.5 9c0-2 1.2-3.5 3.5-4" />
      </>
    ),
    sad: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="M7 8.5h.01M13 8.5h.01" />
        <path d="M7 14c.8-1.1 1.8-1.6 3-1.6s2.2.5 3 1.6" />
      </>
    ),
    spark: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="m13.5 6.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z" />
        <circle cx="10" cy="10" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    warning: (
      <>
        <path
          d="M10 2.5 18.5 17H1.5L10 2.5Z"
          fill="currentColor"
          stroke="none"
        />
        <path d="M10 7.5v4.5M10 14.5h.01" stroke="#fff" strokeWidth="1.7" />
      </>
    ),
  };

  return (
    <svg
      className={`icon${name === "alert" ? " icon-alert" : ""}${
        name === "warning" ? " icon-warning" : ""
      }`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default App;
