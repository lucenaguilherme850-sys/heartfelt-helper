import { createFileRoute } from "@tanstack/react-router";
import { InteractiveParticles } from "@/components/interactive-particles/InteractiveParticles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Interactive Particles — WebGL" },
      {
        name: "description",
        content:
          "A WebGL particle field driven by image brightness, with a cursor-reactive touch trail and shader displacement.",
      },
      { property: "og:title", content: "Interactive Particles — WebGL" },
      {
        property: "og:description",
        content: "Cursor-reactive WebGL particle field built with Three.js and GLSL.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
  ssr: false,
});

function Index() {
  return <InteractiveParticles />;
}
