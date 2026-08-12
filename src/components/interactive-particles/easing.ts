export const easeInQuad = (t: number, b: number, c: number, d: number) => {
  t /= d;
  return c * t * t + b;
};

export const easeOutQuad = (t: number, b: number, c: number, d: number) => {
  t /= d;
  return -c * t * (t - 2) + b;
};

export const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

export const easeInOutQuart = (t: number, b: number, c: number, d: number) => {
  if ((t /= d / 2) < 1) {
    return (c / 2) * t * t * t * t + b;
  }
  return (-c / 2) * ((t -= 2) * t * t * t - 2) + b;
};

export const easeInSine = (t: number, b: number, c: number, d: number) =>
  -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;

export const easeOutSine = (t: number, b: number, c: number, d: number) =>
  c * Math.sin((t / d) * (Math.PI / 2)) + b;

export const easeInOutSine = (t: number, b: number, c: number, d: number) =>
  (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
