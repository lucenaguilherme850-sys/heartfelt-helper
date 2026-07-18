import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Overlay } from "./overlay";
import "./pixel-transition.css";

export interface PixelItem {
  /** background for the intro tile & the content hero (CSS value: gradient or url()) */
  background: string;
  title: string;
  number: string;
  meta: [string, string, string];
  /** optional font style: 1 = thin narrow, 2 = bold wide, 3 = regular wide */
  fontStyle?: 1 | 2 | 3;
  /** intro word before this tile (kept for the rhythm of the original) */
  word?: string;
}

interface Props {
  items: PixelItem[];
}

export function PixelTransition({ items }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const overlayEl = overlayRef.current;
    if (!root || !overlayEl) return;

    const intro = root.querySelector<HTMLDivElement>(".pt-intro");
    const images = Array.from(
      root.querySelectorAll<HTMLDivElement>(".pt-intro__image"),
    );
    const contentElements = Array.from(
      root.querySelectorAll<HTMLDivElement>(".pt-content-wrap > .pt-content"),
    );
    if (!intro) return;

    const overlay = new Overlay(overlayEl, { rows: 9, columns: 17 });
    let isAnimating = false;

    const openHandlers: Array<() => void> = [];
    const closeHandlers: Array<() => void> = [];

    images.forEach((image, position) => {
      const handler = () => {
        if (isAnimating) return;
        isAnimating = true;

        gsap.to(intro, {
          duration: 0.7,
          ease: "power2.in",
          scale: 0.75,
          opacity: 0,
        });

        overlay
          .show({
            duration: 0.25,
            ease: "power1.in",
            stagger: {
              grid: [overlay.options.rows, overlay.options.columns],
              from: "edges",
              each: 0.025,
            },
          })
          .then(() => {
            intro.classList.add("pt-intro--closed");
            contentElements[position]?.classList.add("pt-content--open");

            overlay
              .hide({
                duration: 0.25,
                ease: "power1",
                stagger: {
                  grid: [overlay.options.rows, overlay.options.columns],
                  from: "center",
                  each: 0.025,
                },
              })
              .then(() => {
                isAnimating = false;
              });

            const contentImg = contentElements[position]?.querySelector(
              ".pt-content__img",
            );
            if (contentImg) {
              gsap.fromTo(
                contentImg,
                { scale: 0.5, opacity: 0 },
                { duration: 0.8, ease: "power4", scale: 1, opacity: 1 },
              );
            }
          });
      };
      image.addEventListener("click", handler);
      openHandlers.push(() => image.removeEventListener("click", handler));
    });

    contentElements.forEach((content) => {
      const back = content.querySelector<HTMLButtonElement>(".pt-content__back");
      if (!back) return;
      const handler = () => {
        if (isAnimating) return;
        isAnimating = true;

        gsap.to(content.querySelector(".pt-content__img"), {
          duration: 0.7,
          ease: "power2.in",
          scale: 0.75,
          opacity: 0,
        });

        overlay
          .show({
            duration: 0.25,
            ease: "power1.in",
            stagger: {
              grid: [overlay.options.rows, overlay.options.columns],
              from: "edges",
              each: 0.025,
            },
          })
          .then(() => {
            intro.classList.remove("pt-intro--closed");
            content.classList.remove("pt-content--open");

            overlay
              .hide({
                duration: 0.25,
                ease: "power1",
                stagger: {
                  grid: [overlay.options.rows, overlay.options.columns],
                  from: "center",
                  each: 0.025,
                },
              })
              .then(() => {
                isAnimating = false;
              });

            gsap.to(intro, {
              duration: 0.8,
              ease: "power4",
              scale: 1,
              opacity: 1,
            });
          });
      };
      back.addEventListener("click", handler);
      closeHandlers.push(() => back.removeEventListener("click", handler));
    });

    return () => {
      openHandlers.forEach((fn) => fn());
      closeHandlers.forEach((fn) => fn());
      overlayEl.innerHTML = "";
    };
  }, [items]);

  return (
    <div ref={rootRef} className="pt-root">
      <main className="pt-main">
        <div className="pt-frame">
          <h1 className="pt-frame__title">Pixel Transition</h1>
        </div>

        <div className="pt-intro">
          {items.map((item, i) => (
            <span key={i} className="pt-intro__group">
              {item.word && (
                <span
                  className={`pt-intro__text${
                    item.fontStyle ? ` pt-font-${item.fontStyle}` : ""
                  }`}
                >
                  {item.word}
                </span>
              )}
              <div
                className="pt-intro__image"
                style={{ background: item.background }}
                role="button"
                tabIndex={0}
                aria-label={`Open ${item.title}`}
              />
            </span>
          ))}
        </div>

        <section className="pt-content-wrap">
          {items.map((item, i) => (
            <div className="pt-content" key={i}>
              <div className="pt-content__img">
                <div
                  className="pt-content__img-inner"
                  style={{ background: item.background }}
                />
              </div>
              <div className="pt-content__text">
                <h2 className="pt-content__title">{item.title}</h2>
                <span className="pt-content__number">{item.number}</span>
                <button className="pt-content__back" aria-label="Back">
                  <svg viewBox="0 0 562 980" aria-hidden="true">
                    <path d="M561.4 0H421.2v138.7h140.2zM421.2 138.7H281v140.2h140.2zM281 278.9H140.8v140.2H281zM281 559.4H140.8v140.2H281zM421.2 699.6H281v140.2h140.2zM561.4 839.8H421.2V980h140.2zM140.8 419.1H.6v140.2h140.2z" />
                  </svg>
                </button>
                <div className="pt-content__meta">
                  <span>{item.meta[0]}</span>
                  <span>{item.meta[1]}</span>
                  <span>{item.meta[2]}</span>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div ref={overlayRef} className="pt-overlay" />
      </main>
    </div>
  );
}
