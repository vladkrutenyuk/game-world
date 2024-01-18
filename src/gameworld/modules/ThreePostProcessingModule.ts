import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import GameWorld from '../GameWorld'
import GameWorldModule from '../GameWorldModule'

export default class ThreePostProcessingModule extends GameWorldModule {
	public composer!: EffectComposer

	onInit<TModules extends Readonly<Record<string, GameWorldModule>>>(
		world: GameWorld<TModules>
	): void {
		const { three } = world

		this.composer = new EffectComposer(three.renderer)
		three.addEventListener('resize', (event) => {
			const { width, height } = event
			this.composer.setSize(width, height)
		})

		const renderScene = new RenderPass(three.scene, three.camera)
		const outputPass = new OutputPass()
		this.composer.addPass(renderScene)
		this.composer.addPass(outputPass)

		three.overrideRenderFn(() => {
			this.composer.render()
		})

		three.addEventListener('destroy', this.onDestroy)
	}

    private onDestroy = () => {
        const passes = [...this.composer.passes]
        for (let i = 0; i < passes.length; i++) {
            const pass = passes[i]
            this.composer.removePass(pass)
            pass.dispose()
        }
        this.composer.dispose()
    }
}
