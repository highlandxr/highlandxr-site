"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  ClampToEdgeWrapping,
  Color,
  DataTexture,
  Group,
  LinearFilter,
  Mesh,
  Points,
  RGBAFormat,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2
} from "three";

const BASE_DARKEN = 0.3;
const SKY_START = 0.56;
const SKY_SOFTNESS = 0.16;
const AURORA_INTENSITY = 0.42;
const WIREFRAME_OPACITY = 0.13;
const WIREFRAME_DISPLACE = 0.34;
const PARTICLE_COUNT = 120;

function supportsWebGL() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mediaQuery.matches);

    onChange();
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return reducedMotion;
}

function useDesktopParallaxEnabled(reducedMotion: boolean) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setEnabled(false);
      return;
    }

    const coarse = window.matchMedia("(pointer: coarse)");

    const onChange = () => {
      setEnabled(window.innerWidth >= 1024 && !coarse.matches);
    };

    onChange();
    coarse.addEventListener("change", onChange);
    window.addEventListener("resize", onChange);

    return () => {
      coarse.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, [reducedMotion]);

  return enabled;
}

function createFallbackTexture() {
  const data = new Uint8Array([5, 10, 20, 255]);
  const texture = new DataTexture(data, 1, 1, RGBAFormat);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function useLochTexture() {
  const fallbackTexture = useMemo(() => createFallbackTexture(), []);
  const [texture, setTexture] = useState<Texture>(fallbackTexture);
  const [imageAspect, setImageAspect] = useState(16 / 9);

  useEffect(() => {
    let active = true;
    const loader = new TextureLoader();

    loader.load(
      "/loch.png",
      (loadedTexture) => {
        if (!active) {
          return;
        }

        loadedTexture.colorSpace = SRGBColorSpace;
        loadedTexture.minFilter = LinearFilter;
        loadedTexture.magFilter = LinearFilter;
        loadedTexture.wrapS = ClampToEdgeWrapping;
        loadedTexture.wrapT = ClampToEdgeWrapping;

        const image = loadedTexture.image as { width?: number; height?: number };
        if (image?.width && image?.height) {
          setImageAspect(image.width / image.height);
        }

        setTexture(loadedTexture);
      },
      undefined,
      () => {
        if (!active) {
          return;
        }
        setTexture(fallbackTexture);
      }
    );

    return () => {
      active = false;
    };
  }, [fallbackTexture]);

  return { texture, imageAspect };
}

function createParticles() {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const speeds = new Float32Array(PARTICLE_COUNT);

  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    const stride = index * 3;
    positions[stride] = (Math.random() - 0.5) * 4.6;
    positions[stride + 1] = -1.02 - Math.random() * 0.42;
    positions[stride + 2] = -0.2 + Math.random() * 0.36;
    speeds[index] = 0.18 + Math.random() * 0.22;
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSpeed", new BufferAttribute(speeds, 1));

  return { geometry, positions, speeds };
}

function createBaseMaterial(texture: Texture) {
  return new ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uDarken: { value: BASE_DARKEN },
      uSkyStart: { value: SKY_START },
      uSkySoftness: { value: SKY_SOFTNESS },
      uAuroraIntensity: { value: AURORA_INTENSITY },
      uImageAspect: { value: 16 / 9 },
      uViewportAspect: { value: 16 / 9 },
      uMotion: { value: 1 }
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;

      uniform sampler2D uTexture;
      uniform float uTime;
      uniform float uDarken;
      uniform float uSkyStart;
      uniform float uSkySoftness;
      uniform float uAuroraIntensity;
      uniform float uImageAspect;
      uniform float uViewportAspect;
      uniform float uMotion;

      vec2 coverUv(vec2 uv, float texAspect, float viewAspect) {
        vec2 centered = uv - 0.5;
        if (viewAspect > texAspect) {
          centered.y *= texAspect / viewAspect;
        } else {
          centered.x *= viewAspect / texAspect;
        }
        return centered + 0.5;
      }

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);

        float a = hash(i + vec2(0.0, 0.0));
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));

        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;

        for (int i = 0; i < 4; i++) {
          value += noise(p) * amplitude;
          p *= 2.05;
          amplitude *= 0.5;
        }

        return value;
      }

      void main() {
        vec2 texUv = coverUv(vUv, uImageAspect, uViewportAspect);
        vec3 photo = texture2D(uTexture, texUv).rgb;
        vec3 baseColor = photo * uDarken;

        float vignette = smoothstep(0.92, 0.22, distance(vUv, vec2(0.5, 0.44)));
        baseColor *= mix(0.65, 1.0, vignette);

        float skyMask = smoothstep(uSkyStart - uSkySoftness, uSkyStart + uSkySoftness, vUv.y);
        float skyDepth = smoothstep(uSkyStart - 0.02, 1.0, vUv.y);

        vec3 skyLower = vec3(0.02, 0.035, 0.08);
        vec3 skyUpper = vec3(0.004, 0.01, 0.03);
        vec3 nightSky = mix(skyLower, skyUpper, skyDepth);

        float drift = uTime * 0.07 * uMotion;
        float nA = fbm(vec2(vUv.x * 3.8, vUv.y * 4.7 + drift));
        float nB = fbm(vec2(vUv.x * 5.2 + 12.7, vUv.y * 6.4 - drift * 0.85));
        float nC = fbm(vec2(vUv.x * 2.6 - 4.3, vUv.y * 7.1 + drift * 0.5));

        float arcA = 0.74 + sin(vUv.x * 3.6 + drift * 1.4) * 0.07 + (nA - 0.5) * 0.18;
        float arcB = 0.66 + sin(vUv.x * 5.3 - drift * 1.2 + 1.7) * 0.05 + (nB - 0.5) * 0.14;
        float arcC = 0.8 + sin(vUv.x * 2.2 + drift * 0.8 + 3.4) * 0.04 + (nC - 0.5) * 0.1;

        float bandA = smoothstep(0.18, 0.0, abs(vUv.y - arcA));
        float bandB = smoothstep(0.16, 0.0, abs(vUv.y - arcB));
        float bandC = smoothstep(0.14, 0.0, abs(vUv.y - arcC));

        vec3 auroraA = mix(vec3(0.08, 0.2, 0.16), vec3(0.17, 0.44, 0.34), nA);
        vec3 auroraB = mix(vec3(0.07, 0.18, 0.2), vec3(0.14, 0.35, 0.33), nB);
        vec3 auroraC = vec3(0.18, 0.14, 0.28);

        vec3 auroraColor =
          auroraA * bandA * 0.72 +
          auroraB * bandB * 0.56 +
          auroraC * bandC * 0.24;

        float auroraAlpha = (bandA * 0.26 + bandB * 0.18 + bandC * 0.11) * uAuroraIntensity;
        nightSky += auroraColor * auroraAlpha;

        vec3 finalColor = mix(baseColor, nightSky, skyMask);
        float grain = (hash(vUv * vec2(900.0, 640.0) + uTime * 0.03) - 0.5) * 0.018;
        finalColor += grain;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  });
}

function createWireframeMaterial(texture: Texture) {
  return new ShaderMaterial({
    transparent: true,
    wireframe: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTexture: { value: texture },
      uColor: { value: new Color("#6eaab7") },
      uOpacity: { value: WIREFRAME_OPACITY },
      uSkyStart: { value: SKY_START },
      uSkySoftness: { value: SKY_SOFTNESS },
      uDisplace: { value: WIREFRAME_DISPLACE },
      uImageAspect: { value: 16 / 9 },
      uViewportAspect: { value: 16 / 9 }
    },
    vertexShader: `
      varying float vMask;
      varying vec2 vUv;

      uniform sampler2D uTexture;
      uniform float uSkyStart;
      uniform float uSkySoftness;
      uniform float uDisplace;
      uniform float uImageAspect;
      uniform float uViewportAspect;

      vec2 coverUv(vec2 uv, float texAspect, float viewAspect) {
        vec2 centered = uv - 0.5;
        if (viewAspect > texAspect) {
          centered.y *= texAspect / viewAspect;
        } else {
          centered.x *= viewAspect / texAspect;
        }
        return centered + 0.5;
      }

      void main() {
        vUv = uv;

        vec2 texUv = coverUv(uv, uImageAspect, uViewportAspect);
        vec3 color = texture2D(uTexture, texUv).rgb;
        float height = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        float skyMask = smoothstep(uSkyStart - uSkySoftness, uSkyStart + uSkySoftness, uv.y);
        float sideMask = smoothstep(0.12, 0.42, abs(uv.x - 0.5));
        float sideHills = smoothstep(0.28, 0.48, uv.y) * (1.0 - smoothstep(0.66, 0.82, uv.y)) * sideMask;
        float backHills = smoothstep(0.4, 0.58, uv.y) * (1.0 - smoothstep(0.74, 0.9, uv.y));
        float foreground = (1.0 - smoothstep(0.16, 0.32, uv.y)) * 0.64;
        float waterCenter = smoothstep(0.2, 0.34, uv.y) * (1.0 - smoothstep(0.34, 0.5, uv.y)) * (1.0 - smoothstep(0.2, 0.44, abs(uv.x - 0.5)));
        float terrainMask = clamp(sideHills + backHills * 0.7 + foreground - waterCenter * 0.95, 0.0, 1.0);

        float hillDisplace = clamp((height - 0.2) * uDisplace, 0.0, 0.3) * (sideHills + backHills * 0.7);
        float foregroundDisplace = clamp((height - 0.1) * uDisplace * 0.36, 0.0, 0.09) * foreground;

        vec3 pos = position;
        pos.z += (hillDisplace + foregroundDisplace) * (1.0 - skyMask);

        float edgeFade = smoothstep(0.02, 0.1, uv.y) * (1.0 - smoothstep(0.9, 0.99, uv.y));
        vMask = terrainMask * edgeFade * (1.0 - skyMask);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying float vMask;
      varying vec2 vUv;

      uniform vec3 uColor;
      uniform float uOpacity;

      void main() {
        float pulse = 0.88 + sin((vUv.x + vUv.y) * 22.0) * 0.04;
        float depthFade = mix(0.68, 1.0, smoothstep(0.22, 0.72, vUv.y));
        gl_FragColor = vec4(uColor, uOpacity * vMask * depthFade * pulse);
      }
    `
  });
}

interface HighlandSceneProps {
  texture: Texture;
  imageAspect: number;
  reducedMotion: boolean;
  parallaxEnabled: boolean;
}

function HighlandScene({ texture, imageAspect, reducedMotion, parallaxEnabled }: HighlandSceneProps) {
  const groupRef = useRef<Group>(null);
  const baseMaterialRef = useRef<ShaderMaterial>(null);
  const wireframeMaterialRef = useRef<ShaderMaterial>(null);
  const particlesRef = useRef<Points>(null);
  const baseMeshRef = useRef<Mesh>(null);
  const viewport = useThree((state) => state.viewport);
  const pointerTargetRef = useRef(new Vector2(0, 0));
  const pointerCurrentRef = useRef(new Vector2(0, 0));
  const particleData = useMemo(() => createParticles(), []);
  const baseMaterial = useMemo(() => createBaseMaterial(texture), [texture]);
  const wireframeMaterial = useMemo(() => createWireframeMaterial(texture), [texture]);

  useEffect(() => {
    if (!parallaxEnabled || reducedMotion) {
      pointerTargetRef.current.set(0, 0);
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      pointerTargetRef.current.set((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * -2 + 1);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [parallaxEnabled, reducedMotion]);

  useEffect(() => {
    baseMaterial.uniforms.uTexture.value = texture;
    baseMaterial.uniforms.uImageAspect.value = imageAspect;
    wireframeMaterial.uniforms.uTexture.value = texture;
    wireframeMaterial.uniforms.uImageAspect.value = imageAspect;
  }, [baseMaterial, imageAspect, texture, wireframeMaterial]);

  useEffect(() => {
    return () => {
      baseMaterial.dispose();
      wireframeMaterial.dispose();
      particleData.geometry.dispose();
    };
  }, [baseMaterial, particleData.geometry, wireframeMaterial]);

  useFrame((state, delta) => {
    const elapsed = reducedMotion ? 0 : state.clock.elapsedTime;
    const viewportAspect = viewport.width / Math.max(viewport.height, 0.0001);

    if (baseMaterialRef.current) {
      baseMaterialRef.current.uniforms.uTime.value = elapsed;
      baseMaterialRef.current.uniforms.uViewportAspect.value = viewportAspect;
      baseMaterialRef.current.uniforms.uMotion.value = reducedMotion ? 0 : 1;
    }

    if (wireframeMaterialRef.current) {
      wireframeMaterialRef.current.uniforms.uViewportAspect.value = viewportAspect;
    }

    if (groupRef.current) {
      pointerCurrentRef.current.lerp(pointerTargetRef.current, 0.045);

      const idleX = Math.sin(elapsed * 0.12) * 0.03;
      const idleY = Math.cos(elapsed * 0.09) * 0.02;
      const targetX = idleX + (parallaxEnabled ? pointerCurrentRef.current.x * 0.06 : 0);
      const targetY = idleY + (parallaxEnabled ? pointerCurrentRef.current.y * 0.035 : 0);

      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.04;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.04;
    }

    if (!reducedMotion && particlesRef.current) {
      const positionsAttribute = particlesRef.current.geometry.attributes.position as BufferAttribute;

      for (let index = 0; index < PARTICLE_COUNT; index += 1) {
        const stride = index * 3;
        particleData.positions[stride + 1] += particleData.speeds[index] * delta * 0.26;
        particleData.positions[stride] += Math.sin(elapsed * 0.4 + index * 1.7) * 0.0007;

        if (particleData.positions[stride + 1] > 0.12) {
          particleData.positions[stride + 1] = -1.15 - Math.random() * 0.32;
          particleData.positions[stride] = (Math.random() - 0.5) * 4.6;
        }
      }

      positionsAttribute.needsUpdate = true;
    }

    if (baseMeshRef.current) {
      baseMeshRef.current.scale.x = viewport.width;
      baseMeshRef.current.scale.y = viewport.height;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={baseMeshRef} position={[0, 0, 0]}>
        <planeGeometry args={[1, 1, 256, 256]} />
        <primitive object={baseMaterial} ref={baseMaterialRef} attach="material" />
      </mesh>

      <mesh scale={[viewport.width, viewport.height, 1]} position={[0, 0, 0.028]}>
        <planeGeometry args={[1, 1, 148, 108]} />
        <primitive object={wireframeMaterial} ref={wireframeMaterialRef} attach="material" />
      </mesh>

      {!reducedMotion ? (
        <points ref={particlesRef} geometry={particleData.geometry} position={[0, 0, 0.08]}>
          <pointsMaterial color="#86b5bd" size={0.03} transparent opacity={0.15} sizeAttenuation depthWrite={false} />
        </points>
      ) : null}
    </group>
  );
}

function StaticFallback() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/loch.png')",
          filter: "brightness(0.28) saturate(0.7)"
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,16,0.88)_0%,rgba(4,10,22,0.76)_36%,rgba(5,9,14,0.82)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(80%_42%_at_50%_18%,rgba(55,118,108,0.26)_0%,rgba(55,118,108,0)_72%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(72%_45%_at_72%_14%,rgba(88,74,128,0.14)_0%,rgba(88,74,128,0)_66%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_82%_at_50%_42%,transparent_38%,rgba(0,0,0,0.62)_100%)]" />
    </div>
  );
}

export default function HighlandBackdrop() {
  const [canUseWebGL, setCanUseWebGL] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const reducedMotion = usePrefersReducedMotion();
  const parallaxEnabled = useDesktopParallaxEnabled(reducedMotion);
  const { texture, imageAspect } = useLochTexture();

  useEffect(() => {
    setCanUseWebGL(supportsWebGL());

    const onVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  if (!canUseWebGL || reducedMotion) {
    return <StaticFallback />;
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 2.8], fov: 44, near: 0.1, far: 20 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop={isVisible ? "always" : "never"}
      >
        <HighlandScene texture={texture} imageAspect={imageAspect} reducedMotion={reducedMotion} parallaxEnabled={parallaxEnabled} />
        <Preload all />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_92%_at_50%_46%,transparent_36%,rgba(0,0,0,0.64)_100%)]" />
    </div>
  );
}
