import * as THREE from "three";
import { gsap } from "gsap";

import TouchTexture from "./TouchTexture";
import { particleFrag, particleVert } from "./shaders";
import type WebGLView from "./WebGLView";

export type ParticleSource = HTMLCanvasElement | HTMLImageElement;

export default class Particles {
  webgl: WebGLView;
  container = new THREE.Object3D();

  texture!: THREE.Texture;
  width = 0;
  height = 0;
  numPoints = 0;

  object3D: THREE.Mesh | null = null;
  hitArea: THREE.Mesh | null = null;
  touch?: TouchTexture;

  private handlerInteractiveMove!: (e: any) => void;

  constructor(webgl: WebGLView) {
    this.webgl = webgl;
  }

  init(source: ParticleSource) {
    const texture = new THREE.Texture(source);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    this.texture = texture;
    this.width = source.width;
    this.height = source.height;

    this.initPoints(true);
    this.initHitArea();
    this.initTouch();
    this.resize();
    this.show();
  }

  initPoints(discard: boolean) {
    this.numPoints = this.width * this.height;

    let numVisible = this.numPoints;
    let threshold = 0;
    let originalColors: Float32Array | undefined;

    if (discard) {
      // discard pixels darker than threshold #22
      numVisible = 0;
      threshold = 34;

      const img = this.texture.image as ParticleSource;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      canvas.width = this.width;
      canvas.height = this.height;
      ctx.scale(1, -1);
      ctx.drawImage(img, 0, 0, this.width, this.height * -1);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      originalColors = Float32Array.from(imgData.data);

      for (let i = 0; i < this.numPoints; i++) {
        if (originalColors[i * 4 + 0] > threshold) numVisible++;
      }
    }

    const uniforms = {
      uTime: { value: 0 },
      uRandom: { value: 1.0 },
      uDepth: { value: 2.0 },
      uSize: { value: 0.0 },
      uTextureSize: { value: new THREE.Vector2(this.width, this.height) },
      uTexture: { value: this.texture },
      uTouch: { value: null as THREE.Texture | null },
    };

    const material = new THREE.RawShaderMaterial({
      uniforms,
      vertexShader: particleVert,
      fragmentShader: particleFrag,
      depthTest: false,
      transparent: true,
    });

    const geometry = new THREE.InstancedBufferGeometry();

    // positions
    const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
    positions.setXYZ(0, -0.5, 0.5, 0.0);
    positions.setXYZ(1, 0.5, 0.5, 0.0);
    positions.setXYZ(2, -0.5, -0.5, 0.0);
    positions.setXYZ(3, 0.5, -0.5, 0.0);
    geometry.setAttribute("position", positions);

    // uvs
    const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
    uvs.setXY(0, 0.0, 0.0);
    uvs.setXY(1, 1.0, 0.0);
    uvs.setXY(2, 0.0, 1.0);
    uvs.setXY(3, 1.0, 1.0);
    geometry.setAttribute("uv", uvs);

    // index
    geometry.setIndex(
      new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1),
    );

    const indices = new Uint16Array(numVisible);
    const offsets = new Float32Array(numVisible * 3);
    const angles = new Float32Array(numVisible);

    for (let i = 0, j = 0; i < this.numPoints; i++) {
      if (discard && originalColors![i * 4 + 0] <= threshold) continue;

      offsets[j * 3 + 0] = i % this.width;
      offsets[j * 3 + 1] = Math.floor(i / this.width);

      indices[j] = i;

      angles[j] = Math.random() * Math.PI;

      j++;
    }

    geometry.setAttribute(
      "pindex",
      new THREE.InstancedBufferAttribute(indices, 1, false),
    );
    geometry.setAttribute(
      "offset",
      new THREE.InstancedBufferAttribute(offsets, 3, false),
    );
    geometry.setAttribute(
      "angle",
      new THREE.InstancedBufferAttribute(angles, 1, false),
    );

    this.object3D = new THREE.Mesh(geometry, material);
    this.object3D.frustumCulled = false;
    this.container.add(this.object3D);
  }

  initTouch() {
    // create only once
    if (!this.touch) this.touch = new TouchTexture();
    (this.object3D!.material as THREE.RawShaderMaterial).uniforms.uTouch.value =
      this.touch.texture;
  }

  initHitArea() {
    const geometry = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      depthTest: false,
    });
    material.visible = false;
    this.hitArea = new THREE.Mesh(geometry, material);
    this.container.add(this.hitArea);
  }

  addListeners() {
    this.handlerInteractiveMove = this.onInteractiveMove.bind(this);

    this.webgl.interactive.addListener(
      "interactive-move",
      this.handlerInteractiveMove,
    );
    this.webgl.interactive.objects.push(this.hitArea!);
    this.webgl.interactive.enable();
  }

  removeListeners() {
    this.webgl.interactive.removeListener(
      "interactive-move",
      this.handlerInteractiveMove,
    );

    const index = this.webgl.interactive.objects.findIndex(
      (obj) => obj === this.hitArea,
    );
    if (index > -1) this.webgl.interactive.objects.splice(index, 1);
    this.webgl.interactive.disable();
  }

  // -------------------------------------------------------------------------
  // PUBLIC
  // -------------------------------------------------------------------------

  update(delta: number) {
    if (!this.object3D) return;
    if (this.touch) this.touch.update();

    (this.object3D.material as THREE.RawShaderMaterial).uniforms.uTime.value +=
      delta;
  }

  show(time = 1.0) {
    const u = (this.object3D!.material as THREE.RawShaderMaterial).uniforms;
    // reset
    gsap.fromTo(u.uSize, { value: 0.5 }, { value: 1.5, duration: time });
    gsap.to(u.uRandom, { value: 2.0, duration: time });
    gsap.fromTo(
      u.uDepth,
      { value: 40.0 },
      { value: 4.0, duration: time * 1.5 },
    );

    this.addListeners();
  }

  hide(_destroy?: boolean, time = 0.8): Promise<void> {
    return new Promise((resolve) => {
      const u = (this.object3D!.material as THREE.RawShaderMaterial).uniforms;
      gsap.to(u.uRandom, {
        value: 5.0,
        duration: time,
        onComplete: () => {
          if (_destroy) this.destroy();
          resolve();
        },
      });
      gsap.to(u.uDepth, { value: -20.0, duration: time, ease: "power2.in" });
      gsap.to(u.uSize, { value: 0.0, duration: time * 0.8 });

      this.removeListeners();
    });
  }

  destroy() {
    if (!this.object3D) return;

    this.object3D.parent?.remove(this.object3D);
    this.object3D.geometry.dispose();
    (this.object3D.material as THREE.Material).dispose();
    this.object3D = null;

    if (!this.hitArea) return;

    this.hitArea.parent?.remove(this.hitArea);
    this.hitArea.geometry.dispose();
    (this.hitArea.material as THREE.Material).dispose();
    this.hitArea = null;
  }

  // -------------------------------------------------------------------------
  // EVENT HANDLERS
  // -------------------------------------------------------------------------

  resize() {
    if (!this.object3D) return;

    const scale = this.webgl.fovHeight / this.height;
    this.object3D.scale.set(scale, scale, 1);
    this.hitArea!.scale.set(scale, scale, 1);
  }

  onInteractiveMove(e: { intersectionData: THREE.Intersection }) {
    const uv = e.intersectionData.uv;
    if (this.touch && uv) this.touch.addTouch(uv);
  }
}
