import { useEffect, useRef } from "react";
import WebGLView from "./WebGLView";
import { createSampleCanvas, defaultSamples } from "./samples";
import "./interactive-particles.css";

interface Props {
  /** Placeholder labels rendered to canvases and turned into particles. */
  samples?: string[];
  title?: string;
  hint?: string;
}

export function InteractiveParticles({
  samples = defaultSamples,
  title = "Interactive Particles",
  hint = "Move the cursor through the particles — click to change",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sources = samples.map((label) => createSampleCanvas(label));
    const webgl = new WebGLView(sources);
    container.appendChild(webgl.renderer.domElement);

    let raf = 0;
    const animate = () => {
      webgl.update();
      webgl.draw();
      raf = requestAnimationFrame(animate);
    };

    const onResize = () => webgl.resize();
    const onKeyUp = () => {};
    const onClick = () => webgl.next();

    window.addEventListener("resize", onResize);
    window.addEventListener("keyup", onKeyUp);
    webgl.renderer.domElement.addEventListener("click", onClick);

    animate();
    webgl.resize();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keyup", onKeyUp);
      webgl.renderer.domElement.removeEventListener("click", onClick);
      webgl.destroy();
    };
  }, [samples]);

  return (
    <div className="ip-root">
      <div ref={containerRef} className="ip-container" />
      <div className="ip-frame">
        <h1 className="ip-title">{title}</h1>
        <p className="ip-hint">{hint}</p>
      </div>
    </div>
  );
}
