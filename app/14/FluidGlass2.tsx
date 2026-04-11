import * as THREE from "three";
import {
  useRef,
  useState,
  useEffect,
  memo,
  ReactNode,
  useSyncExternalStore,
} from "react";
import {
  Canvas,
  createPortal,
  events as createPointerEvents,
  useFrame,
  useThree,
  ThreeElements,
  type DomEvent,
  type RootState,
} from "@react-three/fiber";
import {
  useFBO,
  useGLTF,
  Preload,
  MeshTransmissionMaterial,
  Text,
  Html,
} from "@react-three/drei";
import { easing } from "maath";

/** Html 등 캔버스 밖 DOM이 포인터를 가릴 때도, 캔버스 기준 좌표로 렌즈를 따라가게 함 */
function canvasRelativePointerEvents(
  store: Parameters<typeof createPointerEvents>[0],
) {
  const ev = createPointerEvents(store);
  return {
    ...ev,
    compute(event: DomEvent, root: RootState) {
      if (!("clientX" in event)) return;
      const rect = root.gl.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      root.pointer.set(x / root.size.width * 2 - 1, -(y / root.size.height) * 2 + 1);
      root.raycaster.setFromCamera(root.pointer, root.camera);
    },
  };
}

/** react-bits 저장소 `public/` — GLB 로드용 */
const REACT_BITS_PUBLIC =
  "https://cdn.jsdelivr.net/gh/DavidHDev/react-bits@main/public";

const LENS_GLB = `${REACT_BITS_PUBLIC}/assets/3d/lens.glb`;
useGLTF.preload(LENS_GLB);

type ModeProps = Record<string, unknown>;

export type FluidGlass2Props = {
  lensProps?: ModeProps;
  /** 렌즈 뒤(리프랙션 씬)에 보일 문구 */
  label?: string;
  /** 라벨(3D 텍스트) 클릭 시 — 예: 모달 열기 */
  onLabelClick?: () => void;
};

type MeshProps = ThreeElements["mesh"];

type ModeWrapperProps = MeshProps & {
  children?: ReactNode;
  glb: string;
  geometryKey: string;
  lockToBottom?: boolean;
  followPointer?: boolean;
  modeProps?: ModeProps;
};

function WhiteBackdropWithText({ label }: { label: string }) {
  return (
    <group>
      <mesh position={[0, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[80, 80]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <Text
        position={[0, 0, 12]}
        fontSize={0.4}
        letterSpacing={-0.04}
        color="#111827"
        anchorX="center"
        anchorY="middle"
        maxWidth={5.5}
        textAlign="center"
        outlineWidth={0.012}
        outlineColor="#ffffff"
        outlineOpacity={1}
      >
        {label}
      </Text>
    </group>
  );
}

/** 포털 씬의 Text는 레이캐스트에 안 잡히므로, 같은 위치에 DOM 히트 영역을 둡니다. */
function LabelHitOverlay({
  label,
  onLabelClick,
}: {
  label: string;
  onLabelClick: () => void;
}) {
  return (
    <group position={[0, 0, 12]}>
      <Html center transform>
        <button
          type="button"
          onClick={onLabelClick}
          aria-label={`${label} — 콘텐츠 열기`}
          className="min-h-[2.75rem] min-w-[12.5rem] max-w-[min(90vw,18rem)] cursor-pointer touch-manipulation border-0 bg-transparent p-3 opacity-0"
        />
      </Html>
    </group>
  );
}

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  ...props
}: ModeWrapperProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const { nodes } = useGLTF(glb);
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState<THREE.Scene>(() => new THREE.Scene());
  const geoWidthRef = useRef<number>(1);

  useEffect(() => {
    const geo = (nodes[geometryKey] as THREE.Mesh)?.geometry;
    geo.computeBoundingBox();
    geoWidthRef.current = geo.boundingBox!.max.x - geo.boundingBox!.min.x || 1;
  }, [nodes, geometryKey]);

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom
      ? -v.height / 2 + 0.2
      : followPointer
        ? (pointer.y * v.height) / 2
        : 0;
    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

    if ((modeProps as { scale?: number }).scale == null) {
      const maxWorld = v.width * 0.9;
      const desired = maxWorld / geoWidthRef.current;
      ref.current.scale.setScalar(Math.min(0.15, desired));
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(0xffffff, 1);
  });

  const {
    scale,
    ior,
    thickness,
    anisotropy,
    chromaticAberration,
    ...extraMat
  } = modeProps as {
    scale?: number;
    ior?: number;
    thickness?: number;
    anisotropy?: number;
    chromaticAberration?: number;
    [key: string]: unknown;
  };

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent />
      </mesh>
      <mesh
        ref={ref}
        scale={scale ?? 0.15}
        rotation-x={Math.PI / 2}
        geometry={(nodes[geometryKey] as THREE.Mesh)?.geometry}
        {...props}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.15}
          thickness={thickness ?? 5}
          anisotropy={anisotropy ?? 0.01}
          chromaticAberration={chromaticAberration ?? 0.1}
          {...(typeof extraMat === "object" && extraMat !== null
            ? extraMat
            : {})}
        />
      </mesh>
    </>
  );
});

const DEFAULT_LABEL = "PUL ARCHIVE";

const noopSubscribe = () => () => {};

export default function FluidGlass2({
  lensProps = {},
  label = DEFAULT_LABEL,
  onLabelClick,
}: FluidGlass2Props) {
  /** SSR·하이드레이션 시 undefined, 클라이언트에서는 body (Canvas 래퍼 pointerEvents 불일치 방지) */
  const eventSource = useSyncExternalStore(
    noopSubscribe,
    () => document.body,
    () => undefined,
  );

  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 15 }}
      gl={{ alpha: true }}
      events={canvasRelativePointerEvents}
      eventSource={eventSource}
      onCreated={({ gl }) => gl.domElement.setAttribute("aria-hidden", "true")}
    >
      <ModeWrapper
        glb={LENS_GLB}
        geometryKey="Cylinder"
        followPointer
        modeProps={lensProps}
      >
        <WhiteBackdropWithText label={label} />
      </ModeWrapper>
      {onLabelClick ? (
        <LabelHitOverlay label={label} onLabelClick={onLabelClick} />
      ) : null}
      <Preload />
    </Canvas>
  );
}
