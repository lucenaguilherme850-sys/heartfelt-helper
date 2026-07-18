import { createFileRoute } from "@tanstack/react-router";
import { PixelTransition, type PixelItem } from "@/components/pixel-transition/PixelTransition";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pixel Transition" },
      {
        name: "description",
        content:
          "Pixel grid page transitions — click a tile to reveal its content through an animated cell overlay.",
      },
      { property: "og:title", content: "Pixel Transition" },
      {
        property: "og:description",
        content: "Animated pixel grid transitions between intro tiles and content.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// Neutral placeholders — swap `title`, `word`, `background`, `meta`, `number` later.
const items: PixelItem[] = [
  { word: "Section", fontStyle: 3, background: "linear-gradient(135deg,#4cfa68,#1b35ea)", title: "Placeholder title one.", number: "01", meta: ["Author", "Year", "Label"] },
  { word: "one",    fontStyle: 1, background: "linear-gradient(135deg,#97d6c5,#308c2c)", title: "Placeholder title two.", number: "02", meta: ["Author", "Year", "Label"] },
  { word: "and",    fontStyle: 2, background: "linear-gradient(135deg,#c4b478,#815615)", title: "Placeholder title three.", number: "03", meta: ["Author", "Year", "Label"] },
  { word: "two",    fontStyle: 1, background: "linear-gradient(135deg,#81e2c6,#e7613c)", title: "Placeholder title four.", number: "04", meta: ["Author", "Year", "Label"] },
  { word: "three",  fontStyle: 2, background: "linear-gradient(135deg,#ba9978,#df6b47)", title: "Placeholder title five.", number: "05", meta: ["Author", "Year", "Label"] },
  { word: "four",                 background: "linear-gradient(135deg,#1cf191,#4b7872)", title: "Placeholder title six.", number: "06", meta: ["Author", "Year", "Label"] },
  { word: "five",   fontStyle: 2, background: "linear-gradient(135deg,#957235,#394235)", title: "Placeholder title seven.", number: "07", meta: ["Author", "Year", "Label"] },
  { word: "six",                  background: "linear-gradient(135deg,#c0c8c2,#7f837f)", title: "Placeholder title eight.", number: "08", meta: ["Author", "Year", "Label"] },
  { word: "seven",  fontStyle: 2, background: "linear-gradient(135deg,#d23636,#df6b47)", title: "Placeholder title nine.", number: "09", meta: ["Author", "Year", "Label"] },
];

function Index() {
  return <PixelTransition items={items} />;
}
