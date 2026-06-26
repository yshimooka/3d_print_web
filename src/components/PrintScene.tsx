"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const LAYERS = 32;
const LAYER_H = 0.072;
const LAYER_INTERVAL = 0.10; // seconds per layer reveal

// Vase profile: normalized height t ∈ [0,1] → radius
function radius(t: number): number {
  if (t < 0.06) return 0.28 + t * 6.0; // wide base
  if (t > 0.88) return 0.58 + (t - 0.88) * 3.0; // flared rim
  const body = 0.72 - 0.18 * Math.sin(t * Math.PI * 0.85);
  return body;
}

export default function PrintScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Renderer ─────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // ── Camera ───────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(2.5, 2.0, 3.4);
    camera.lookAt(0, 1.15, 0);

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    // ── Scene ────────────────────────────────────────────────
    const scene = new THREE.Scene();

    // Lighting
    scene.add(new THREE.AmbientLight(0xfff4e8, 0.55));
    const sun = new THREE.DirectionalLight(0xffd090, 1.5);
    sun.position.set(3, 5, 3);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x7aaec8, 0.35);
    fill.position.set(-3, 2, -2);
    scene.add(fill);

    // Print bed — subtle grid
    const grid = new THREE.GridHelper(3.8, 10, 0x3a3530, 0x272220);
    scene.add(grid);

    // ── Object group (rotates after build) ────────────────────
    const group = new THREE.Group();
    scene.add(group);

    // Build layers
    const baseColor = new THREE.Color(0xd4702a);
    const tipColor = new THREE.Color(0xf0a858);
    const layerMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < LAYERS; i++) {
      const t = i / LAYERS;
      const r = radius(t);
      const geo = new THREE.CylinderGeometry(r, r, LAYER_H, 40, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: baseColor.clone().lerp(tipColor, t * 0.7),
        metalness: 0.18,
        roughness: 0.6,
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = i * LAYER_H + LAYER_H / 2;
      group.add(mesh);
      layerMeshes.push(mesh);
    }

    // ── Nozzle (glowing tip that traces the current layer) ────
    const nozzle = new THREE.Mesh(
      new THREE.SphereGeometry(0.038, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffb040 })
    );
    const nozzleLight = new THREE.PointLight(0xff8020, 2.5, 0.55);
    nozzle.add(nozzleLight);
    scene.add(nozzle);
    nozzle.visible = false;

    // Small trailing dot to make nozzle path visible
    const trail = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xff9030, transparent: true, opacity: 0.5 })
    );
    scene.add(trail);
    trail.visible = false;

    // ── Animation state ───────────────────────────────────────
    type Phase = "build" | "rotate" | "fadeout";
    let phase: Phase = "build";
    let phaseTime = 0;
    let nozzleAngle = 0;

    const clock = new THREE.Clock();
    let rafId: number;

    function tick() {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      phaseTime += dt;

      if (phase === "build") {
        const layerIdx = Math.floor(phaseTime / LAYER_INTERVAL);

        // Reveal each layer with smooth fade-in
        for (let i = 0; i < LAYERS; i++) {
          const mat = layerMeshes[i].material as THREE.MeshStandardMaterial;
          if (i < layerIdx) {
            mat.opacity = Math.min(1, mat.opacity + dt * 12);
          } else if (i === layerIdx) {
            // Current printing layer fades in faster
            mat.opacity = Math.min(1, mat.opacity + dt * 18);
          }
        }

        // Move nozzle around the perimeter of current layer
        if (layerIdx < LAYERS) {
          nozzle.visible = true;
          trail.visible = true;
          nozzleAngle += dt * 9;
          const t = layerIdx / LAYERS;
          const r = radius(t);
          const y = layerIdx * LAYER_H + LAYER_H * 0.9;
          nozzle.position.set(Math.cos(nozzleAngle) * r, y, Math.sin(nozzleAngle) * r);
          // Trail lags slightly behind
          const trailAngle = nozzleAngle - 0.4;
          trail.position.set(Math.cos(trailAngle) * r, y, Math.sin(trailAngle) * r);
        } else {
          nozzle.visible = false;
          trail.visible = false;
          phase = "rotate";
          phaseTime = 0;
        }
      } else if (phase === "rotate") {
        group.rotation.y += dt * 0.52;
        if (phaseTime > 5.5) {
          phase = "fadeout";
          phaseTime = 0;
        }
      } else {
        // Smooth fade-out then restart
        let allFaded = true;
        for (const mesh of layerMeshes) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.opacity = Math.max(0, mat.opacity - dt * 1.8);
          if (mat.opacity > 0.01) allFaded = false;
        }
        if (allFaded) {
          group.rotation.y = 0;
          nozzleAngle = 0;
          phase = "build";
          phaseTime = 0;
        }
      }

      renderer.render(scene, camera);
    }
    tick();

    // ── Responsive resize ─────────────────────────────────────
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={mountRef} className="w-full h-full" />
  );
}
