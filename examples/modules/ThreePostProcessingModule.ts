import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GameContext, GameContextModule } from "@vladkrutenyuk/game-world";
import * as THREE from "three";

export class ThreePostProcessingModule extends GameContextModule {
	public composer!: EffectComposer;

	private _renderer!: THREE.WebGLRenderer;

	protected onInit<TModules extends Readonly<Record<string, GameContextModule>>>(
		world: GameContext<TModules>
	): void {
		const { three } = world;
		this._renderer = three.renderer;
		this.composer = new EffectComposer(three.renderer);
		three.addEventListener("resize", this.onResize);

		const renderScene = new RenderPass(three.scene, three.camera);
		const outputPass = new OutputPass();
		this.composer.addPass(renderScene);
		this.composer.addPass(outputPass);

		three.overrideRenderFn(() => {
			this.composer.render();
		});
	}

	protected onDestroy<TModules extends Readonly<Record<string, GameContextModule>>>(
		ctx: GameContext<TModules>
	): void {
		const { three } = ctx;
		three.removeEventListener("resize", this.onResize);
		three.clearRenderFn();
		const passes = [...this.composer.passes];
		for (let i = 0; i < passes.length; i++) {
			const pass = passes[i];
			this.composer.removePass(pass);
			pass.dispose();
		}
		this.composer.dispose();
	}

	private onResize = (event: { width: number; height: number }) => {
		const { width, height } = event;
		this.composer.setSize(width, height);
	};

	setPixelRatio(value: number) {
		this._renderer.setPixelRatio(value);
		this.composer.setPixelRatio(value);
	}
}
