"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * ファーストビュー背景: three.js による淡い3Dオブジェクトのアニメーションレイヤー。
 * ローポリ多面体(マットな樹脂質感) + 銅色のワイヤー稜線 + 奥で周回する小さなリング。
 */
export default function Hero3DBackground({ offsetX = 2.2 }: { offsetX?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let raf = 0;

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 600;

    // WebGL 非対応環境では背景なしで静かに劣化させる
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.opacity = "0";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    camera.position.set(0, 0, 10);

    // 柔らかいライティング(明るいトーンを維持)
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xfff4ea, 0.9);
    key.position.set(4, 6, 8);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xdfe8ff, 0.35);
    fill.position.set(-6, -2, 4);
    scene.add(fill);

    const group = new THREE.Group();

    const geo = new THREE.IcosahedronGeometry(2.5, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xe9e4d8,
      roughness: 0.62,
      metalness: 0.04,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    const edgesGeo = new THREE.EdgesGeometry(geo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0xc86b3a,
      transparent: true,
      opacity: 0.28,
    });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    edges.scale.setScalar(1.002);
    group.add(edges);

    const ringGeo = new THREE.TorusGeometry(0.55, 0.18, 12, 36);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd9d3c5,
      roughness: 0.8,
      metalness: 0.0,
      flatShading: true,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(-3.4, 1.9, -2);
    group.add(ring);

    group.position.x = offsetX;
    group.position.y = 0.3;
    scene.add(group);

    // 初期化時に clientWidth が 0 の場合があるため、実寸で再設定
    requestAnimationFrame(() => {
      const rw = container.clientWidth;
      const rh = container.clientHeight;
      if (rw && rh) {
        camera.aspect = rw / rh;
        camera.updateProjectionMatrix();
        renderer.setSize(rw, rh);
      }
    });

    // 登場アニメーション(フェード + スケール)
    const intro = { s: 0.6 };
    group.scale.setScalar(intro.s);
    (async () => {
      const anime = (await import("animejs")).default;
      if (disposed) return;
      anime({
        targets: renderer.domElement,
        opacity: [0, 1],
        duration: 1100,
        easing: "easeOutQuad",
        delay: 150,
      });
      anime({
        targets: intro,
        s: 1,
        duration: 1400,
        easing: "easeOutQuart",
        delay: 150,
        update: () => group.scale.setScalar(intro.s),
      });
    })();

    // マウスに応じたごく弱いパララックス
    let targetRX = 0;
    let targetRY = 0;
    const onMouse = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetRY = nx * 0.3;
      targetRX = ny * 0.2;
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    const startTime = performance.now();
    const animate = () => {
      if (disposed) return;
      const t = (performance.now() - startTime) / 1000;
      mesh.rotation.y += 0.0022;
      mesh.rotation.x += 0.0008;
      edges.rotation.copy(mesh.rotation);
      group.position.y = 0.3 + Math.sin(t * 0.6) * 0.18;
      ring.rotation.x = t * 0.4;
      ring.rotation.y = t * 0.25;
      group.rotation.y += (targetRY - group.rotation.y) * 0.03;
      group.rotation.x += (targetRX - group.rotation.x) * 0.03;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const resizeObs = new ResizeObserver(() => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (!nw || !nh) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    resizeObs.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObs.disconnect();
      window.removeEventListener("mousemove", onMouse);
      geo.dispose();
      mat.dispose();
      edgesGeo.dispose();
      edgesMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [offsetX]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
    />
  );
}
