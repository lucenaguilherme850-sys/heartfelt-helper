import * as THREE from "three";
import { EventEmitter } from "./emitter";

const passiveEvent: AddEventListenerOptions = { passive: true };

const isMobile = () =>
  typeof navigator !== "undefined" &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );

export default class InteractiveControls extends EventEmitter {
  private _enabled = false;
  get enabled() {
    return this._enabled;
  }

  camera: THREE.Camera;
  el: HTMLElement | Window;

  plane = new THREE.Plane();
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  offset = new THREE.Vector3();
  intersection = new THREE.Vector3();

  objects: THREE.Object3D[] = [];
  hovered: THREE.Object3D | null = null;
  selected: THREE.Object3D | null = null;
  isDown = false;
  mobile = isMobile();

  rect = { x: 0, y: 0, width: 1, height: 1 };
  intersectionData: THREE.Intersection | null = null;

  private handlerDown!: (e: any) => void;
  private handlerMove!: (e: any) => void;
  private handlerUp!: (e: any) => void;
  private handlerLeave!: (e: any) => void;

  constructor(camera: THREE.Camera, el?: HTMLElement) {
    super();
    this.camera = camera;
    this.el = el || window;
    this.enable();
  }

  enable() {
    if (this.enabled) return;
    this.addListeners();
    this._enabled = true;
  }

  disable() {
    if (!this.enabled) return;
    this.removeListeners();
    this._enabled = false;
  }

  addListeners() {
    this.handlerDown = this.onDown.bind(this);
    this.handlerMove = this.onMove.bind(this);
    this.handlerUp = this.onUp.bind(this);
    this.handlerLeave = this.onLeave.bind(this);

    const el = this.el as HTMLElement;
    if (this.mobile) {
      el.addEventListener("touchstart", this.handlerDown, passiveEvent);
      el.addEventListener("touchmove", this.handlerMove, passiveEvent);
      el.addEventListener("touchend", this.handlerUp, passiveEvent);
    } else {
      el.addEventListener("mousedown", this.handlerDown);
      el.addEventListener("mousemove", this.handlerMove);
      el.addEventListener("mouseup", this.handlerUp);
      el.addEventListener("mouseleave", this.handlerLeave);
    }
  }

  removeListeners() {
    const el = this.el as HTMLElement;
    if (this.mobile) {
      el.removeEventListener("touchstart", this.handlerDown);
      el.removeEventListener("touchmove", this.handlerMove);
      el.removeEventListener("touchend", this.handlerUp);
    } else {
      el.removeEventListener("mousedown", this.handlerDown);
      el.removeEventListener("mousemove", this.handlerMove);
      el.removeEventListener("mouseup", this.handlerUp);
      el.removeEventListener("mouseleave", this.handlerLeave);
    }
  }

  resize(x?: number, y?: number, width?: number, height?: number) {
    if (x || y || width || height) {
      this.rect = { x: x!, y: y!, width: width!, height: height! };
    } else if (this.el === window) {
      this.rect = {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    } else {
      const r = (this.el as HTMLElement).getBoundingClientRect();
      this.rect = { x: r.x, y: r.y, width: r.width, height: r.height };
    }
  }

  onMove(e: MouseEvent | TouchEvent) {
    const t = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0]
      : (e as MouseEvent);
    if (!t) return;
    const touch = { x: t.clientX, y: t.clientY };

    this.mouse.x = ((touch.x + this.rect.x) / this.rect.width) * 2 - 1;
    this.mouse.y = -((touch.y + this.rect.y) / this.rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.objects);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.intersectionData = intersects[0];

      this.plane.setFromNormalAndCoplanarPoint(
        this.camera.getWorldDirection(this.plane.normal),
        object.position,
      );

      if (this.hovered !== object) {
        this.emit("interactive-out", { object: this.hovered });
        this.emit("interactive-over", { object });
        this.hovered = object;
      } else {
        this.emit("interactive-move", {
          object,
          intersectionData: this.intersectionData,
        });
      }
    } else {
      this.intersectionData = null;

      if (this.hovered !== null) {
        this.emit("interactive-out", { object: this.hovered });
        this.hovered = null;
      }
    }
  }

  onDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.onMove(e);

    this.emit("interactive-down", {
      object: this.hovered,
      previous: this.selected,
      intersectionData: this.intersectionData,
    });
    this.selected = this.hovered;

    if (this.selected) {
      if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
        this.offset.copy(this.intersection).sub(this.selected.position);
      }
    }
  }

  onUp() {
    this.isDown = false;
    this.emit("interactive-up", { object: this.hovered });
  }

  onLeave() {
    this.onUp();
    this.emit("interactive-out", { object: this.hovered });
    this.hovered = null;
  }
}
