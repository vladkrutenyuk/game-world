import { GameContext, Object3DFeature, Object3DFeatureProps } from "@vladkrutenyuk/game-world";
import * as THREE from "three";

export class TestGof extends Object3DFeature<{}> {
	mesh: THREE.Mesh;
	constructor(props: Object3DFeatureProps<{}>) {
		super(props);
		this.initEventMethod("onBeforeRender");
		this.mesh = new THREE.Mesh(
			new THREE.BoxGeometry(),
			new THREE.MeshNormalMaterial()
		);
		this.mesh.scale.setScalar(4);
		this.object.add(this.mesh);
	}

	protected onDestroy() {
		this.object.remove(this.mesh);
	}

	protected onBeforeRender(ctx: GameContext<{}>): void {
		this.mesh.rotateY(ctx.animationFrameLoop.globalUniforms.deltaTime.value);
	}
}
