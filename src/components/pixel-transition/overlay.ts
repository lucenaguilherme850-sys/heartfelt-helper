import { gsap } from "gsap";

class Cell {
  DOM: { el: HTMLDivElement } = { el: null as unknown as HTMLDivElement };
  row: number;
  column: number;

  constructor(row: number, column: number) {
    this.DOM.el = document.createElement("div");
    gsap.set(this.DOM.el, { willChange: "opacity, transform" });
    this.row = row;
    this.column = column;
  }
}

export interface OverlayOptions {
  rows: number;
  columns: number;
}

export interface CellAnimConfig {
  transformOrigin?: string;
  duration?: number;
  ease?: string;
  stagger?: gsap.StaggerVars;
}

export class Overlay {
  DOM: { el: HTMLElement };
  cells: Cell[][] = [];
  options: OverlayOptions = { rows: 10, columns: 10 };

  constructor(el: HTMLElement, customOptions?: Partial<OverlayOptions>) {
    this.DOM = { el };
    this.options = Object.assign({}, this.options, customOptions);
    this.DOM.el.style.setProperty("--columns", String(this.options.columns));

    // clear any previous children (StrictMode double-mount safety)
    this.DOM.el.innerHTML = "";

    this.cells = new Array(this.options.rows);
    for (let i = 0; i < this.options.rows; ++i) {
      this.cells[i] = new Array(this.options.columns);
    }
    for (let i = 0; i < this.options.rows; ++i) {
      for (let j = 0; j < this.options.columns; ++j) {
        const cell = new Cell(i, j);
        this.cells[i][j] = cell;
        this.DOM.el.appendChild(cell.DOM.el);
      }
    }
  }

  show(customConfig: CellAnimConfig = {}): Promise<void> {
    return new Promise((resolve) => {
      const defaultConfig: CellAnimConfig = {
        transformOrigin: "50% 50%",
        duration: 0.5,
        ease: "none",
        stagger: {
          grid: [this.options.rows, this.options.columns],
          from: 0,
          each: 0.05,
          ease: "none",
        },
      };
      const config = Object.assign({}, defaultConfig, customConfig);

      gsap.set(this.DOM.el, { opacity: 1 });
      gsap.fromTo(
        this.cells.flat().map((c) => c.DOM.el),
        { scale: 0, opacity: 0, transformOrigin: config.transformOrigin },
        {
          duration: config.duration,
          ease: config.ease,
          scale: 1.03,
          opacity: 1,
          stagger: config.stagger,
          onComplete: () => resolve(),
        },
      );
    });
  }

  hide(customConfig: CellAnimConfig = {}): Promise<void> {
    return new Promise((resolve) => {
      const defaultConfig: CellAnimConfig = {
        transformOrigin: "50% 50%",
        duration: 0.5,
        ease: "none",
        stagger: {
          grid: [this.options.rows, this.options.columns],
          from: 0,
          each: 0.05,
          ease: "none",
        },
      };
      const config = Object.assign({}, defaultConfig, customConfig);

      gsap.fromTo(
        this.cells.flat().map((c) => c.DOM.el),
        { transformOrigin: config.transformOrigin },
        {
          duration: config.duration,
          ease: config.ease,
          scale: 0,
          opacity: 0,
          stagger: config.stagger,
          onComplete: () => resolve(),
        },
      );
    });
  }
}
