import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
	GameContext,
	Object3DFeature,
	Object3DFeatureProps,
	Object3DFeatureEventMap,
} from "@vladkrutenyuk/game-world";

export type OrbitCameraGofOptions = {
	initDistance?: number;
	minDistance?: number;
	maxDistance?: number;
	minPolarAngle?: number;
	maxPolarAngle?: number;
	maxAzimuthAngle?: number;
	minAzimuthAngle?: number;
	enablePan?: boolean;
};
export type OrbitCameraGofProps = {
	target?: THREE.Object3D;
	options?: OrbitCameraGofOptions;
};
export class OrbitCameraGof extends Object3DFeature<
	{},
	OrbitCameraGofProps,
	Object3DFeatureEventMap<{}, { start: { val: number }; end: {} }>
> {
	readonly type = OrbitCameraGof.name;

	controls?: OrbitControls;

	target: THREE.Object3D | null = null;

	minDistance: number = 1;
	maxDistance: number = 15;

	private _targetWorldPos = new THREE.Vector3();

	private _isDragging = false;
	private setIsDragging(value: boolean) {
		if (this._isDragging !== value) {
			this.dispatchEvent({ type: value ? "start" : "end" });
		}
		this._isDragging = value;
	}
	public get isDragging() {
		return this._isDragging;
	}

	private _options: OrbitCameraGofOptions = {};

	constructor(props: Object3DFeatureProps<{}, OrbitCameraGofProps>) {
		super(props);
		this.initEventMethod("onBeforeRender");
		this.target = props.target ?? null;
		this._options = props.options
			? { ...this._options, ...props.options }
			: this._options;
	}

	protected useCtx(ctx: GameContext<{}>) {
		const { three } = ctx;
		this.controls = new OrbitControls(three.camera, three.renderer.domElement);

		if (this.target) {
			this.controls.target = this.target.getWorldPosition(this._targetWorldPos);
		}
		this.controls.enablePan = Boolean(this._options?.enablePan);
		this.controls.autoRotate = false;

		this.minDistance = this._options?.minDistance ?? this.minDistance;
		this.maxDistance = this._options?.maxDistance ?? this.maxDistance;
		const initDistance = (this.maxDistance - this.minDistance) / 2;

		this.controls.minDistance = this._options.initDistance ?? initDistance;
		this.controls.maxDistance = this._options.initDistance ?? initDistance;
		this.controls.minPolarAngle = this._options.minPolarAngle ?? 0;
		this.controls.maxPolarAngle = this._options?.maxPolarAngle ?? Math.PI;
		this.controls.minAzimuthAngle = this._options?.minAzimuthAngle ?? Infinity;
		this.controls.maxAzimuthAngle = this._options?.maxAzimuthAngle ?? Infinity;

		//@ts-ignore
		this.controls.addEventListener("start", ({ target }) => {
			target.minDistance = this.minDistance;
			target.maxDistance = this.maxDistance;
		});
		//@ts-ignore
		this.controls.addEventListener("end", ({ target }) => {
			const dist = target.getDistance();
			target.minDistance = dist;
			target.maxDistance = dist;

			this.setIsDragging(false);
		});
		this.controls.addEventListener("change", () => {
			this.setIsDragging(true);
		});

		this.controls.update();

		return () => {
			this.controls?.dispose();
			this.controls = undefined;
		};
	}

	protected onBeforeRender(_: GameContext<{}>): void {
		if (!this.controls) return;

		if (this.target) {
			this.target.getWorldPosition(this._targetWorldPos);
			this.controls.target = this._targetWorldPos;
		}
		this.controls.update();
	}

	reset(radius: number, phi: number, theta: number, target?: THREE.Vector3) {
		if (!this.controls || !this.featurabiliy.ctx) return;

		this.controls.minDistance = radius;
		this.controls.maxDistance = radius;

		this.featurabiliy.ctx.three.camera.position.setFromSphericalCoords(
			radius,
			phi,
			theta
		);

		if (target) {
			this.controls.target.copy(target);
		} else {
			this.controls.target.setScalar(0);
		}

		this.controls.update();
	}
}
