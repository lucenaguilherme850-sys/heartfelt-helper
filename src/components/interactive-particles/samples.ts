/**
 * Neutral placeholder "samples".
 * The particle system reads pixel brightness from these canvases: bright pixels
 * become particles, dark pixels (<= threshold 34) are discarded.
 * Swap this for real images later by passing image URLs to WebGLView.
 */
export function createSampleCanvas(label: string): HTMLCanvasElement {
  const width = 480;
  const height = 240;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);

  // soft radial glow behind the type for depth in the particle field
  const grd = ctx.createRadialGradient(
    width / 2,
    height / 2,
    10,
    width / 2,
    height / 2,
    width * 0.55,
  );
  grd.addColorStop(0, "rgba(255,255,255,0.35)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let size = 150;
  ctx.font = `700 ${size}px ui-sans-serif, system-ui, sans-serif`;
  while (ctx.measureText(label).width > width * 0.86 && size > 20) {
    size -= 4;
    ctx.font = `700 ${size}px ui-sans-serif, system-ui, sans-serif`;
  }
  ctx.fillText(label, width / 2, height / 2);

  return canvas;
}

export const defaultSamples = ["ONE", "TWO", "THREE", "FOUR", "FIVE"];
