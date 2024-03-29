import * as THREE from "three";
import { removeArrayItem } from "../../utils/general/remove-array-item";
import { traverseAncestorsInterruptible } from "../../utils/three/traverse-ancestors-interruptible";
import { isScene } from "../../utils/typeguards/is-scene";
import { Feature, FeatureProps } from "../Feature";
import { GameContext, GameContextModulesRecord } from "../GameContext";

// export type GameObjectEventMap<TModules extends GameWorldModulesRecord = {}> = {
// 	attachedToWorld: { world: GameWorld<TModules> };
// 	detachedFromWorld: { world: GameWorld<TModules> };
// };

// export class GameObject<
// 	TModules extends GameWorldModulesRecord = {},
// 	TEventMap extends {} = {}
// > extends THREE.Object3D<
// 	THREE.Object3DEventMap & GameObjectEventMap<TModules> & TEventMap
// > {
// 	public static isIt<TModules extends GameWorldModulesRecord = {}>(
// 		obj: THREE.Object3D
// 	): obj is GameObject<TModules> {
// 		return (obj as GameObject<TModules>).isGameObject || obj.type === 'GameObject';
// 	}
	
// 	public readonly type: 'GameObject'
// 	public readonly isGameObject = true;
// 	public get world() {
// 		return this._world;
// 	}

// 	protected _world: GameWorld<TModules> | null = null;

// 	private readonly _features: Feature<any>[] = [];

// 	constructor(props?: { uuid?: string; name?: string }) {
// 		super();
// 		this.addEventListener("added", this.onAdded);
// 		this.addEventListener("removed", this.onRemoved);
// 		this.name = props?.name ?? `${this.constructor.name}-${this.id}`;
// 		this.uuid = props?.uuid ?? this.uuid;
// 		this.type = 'GameObject'
// 	}

// 	create(): GameObject<TModules> {
// 		const go = new GameObject<TModules>();
// 		this.add(go);
// 		return go;
// 	}

// 	add(...object: THREE.Object3D<THREE.Object3DEventMap>[]): this {
// 		// TODO: write types to prevent adding GameObjects with diffirent defined GameWorldModules
// 		this._log(`add... ${object[0].id}`);
// 		super.add(...object);
// 		return this;
// 	}

// 	addFeature<
// 		TFeature extends CompatibleFeature<TFeatureModules, TModules>,
// 		TFeatureModules extends GameWorldModulesRecord = {},
// 		TProps extends {} = {}
// 	>(
// 		feature: new (
// 			p: FeatureProps<CompatibleModules<TFeatureModules, TModules>, TProps>
// 		) => TFeature,
// 		props: TProps
// 	): TFeature;

// 	addFeature<
// 		TFeature extends CompatibleFeature<TFeatureModules, TModules>,
// 		TFeatureModules extends GameWorldModulesRecord = {}
// 	>(
// 		feature: new (
// 			p: FeatureProps<CompatibleModules<TFeatureModules, TModules>>
// 		) => TFeature,
// 		props?: undefined
// 	): TFeature;

// 	addFeature<
// 		TFeature extends CompatibleFeature<TFeatureModules, TModules>,
// 		TFeatureModules extends GameWorldModulesRecord = {}
// 	>(
// 		feature: new (
// 			p: FeatureProps<CompatibleModules<TFeatureModules, TModules>>
// 		) => TFeature,
// 		props: unknown
// 	): TFeature {
// 		const gameObject = this as unknown as GameObject<
// 			CompatibleModules<TFeatureModules, TModules>,
// 			TEventMap
// 		>;
// 		const instance = new feature(props ? { ...props, object: gameObject } : { object: gameObject });
// 		this._features.push(instance);
// 		instance.init()
// 		return instance;
// 	}

// 	getFeature<TFeatureType extends typeof Feature>(
// 		f: TFeatureType
// 	): InstanceType<TFeatureType> | null {
// 		return this._features.find(
// 			(feature) => feature.type === f.name
// 		) as InstanceType<TFeatureType> | null;
// 	}

// 	destroyFeature<TFeature extends Feature<any>>(feature: TFeature) {
// 		this._log(`destroyFeature...`, feature.constructor.name, feature.id);
// 		const foundAndRemoved = removeArrayItem(this._features, feature);
// 		if (foundAndRemoved) {
// 			feature.destroy();
// 		}
// 	}

// 	protected onAdded = ({ target }: THREE.Event<"added", this>) => {
// 		this._log("onAdded...");
// 		if (target.parent && GameObject.isIt<TModules>(target.parent)) {
// 			this._log("onAdded parent is gameobject");
// 			target.parent._world && target.attachToWorldRecursively(target.parent._world);
// 			return;
// 		}
// 		this._log("onAdded parent is just object3d");
// 		// обрабатываем случай когда GameObject был добавлен к обычному Object3D

// 		// ищем предка который был бы GameObject
// 		let gameObjectAncestor: GameObject<TModules> | null = null;
// 		traverseAncestorsInterruptible(target, (ancestor: THREE.Object3D) => {
// 			const isGameObject = GameObject.isIt<TModules>(ancestor);
// 			if (isGameObject) {
// 				gameObjectAncestor = ancestor;
// 			}
// 			return !isGameObject;
// 		});
// 		gameObjectAncestor = gameObjectAncestor as GameObject<TModules> | null;

// 		// если нашли и если у него есть мир то аттачимся к нему
// 		if (gameObjectAncestor !== null) {
// 			this._log("onAdded found game object ancestor");
// 			gameObjectAncestor._world &&
// 				target.attachToWorldRecursively(gameObjectAncestor._world);
// 		}
// 		// иначе отменяем добавление и высвечиваем ошибку
// 		else {
// 			// если у gameobject есть мир и был доавблен к сцене у которой есть gameWorldId ранвый этому миру
// 			// то этот gameobject это gameworld который был добавлен в сцену на ините
// 			if (
// 				target._world &&
// 				target.parent &&
// 				isScene(target.parent) &&
// 				target.parent.userData.gameWorldId === target._world.id
// 			) {
// 				this._log("onAdded it is gameworld added to scene");
// 				return;
// 			}
// 			// иначе светим ошибку и отменяем добавление
// 			console.error(
// 				`It's prohibited to add GameObject to simple Object3D which is not in any GameWorld.`,
// 				`Add that Object3D to GameWorld or GameObject beforehand.`,
// 				`Or just add this GameObject to another GameObject.`
// 			);
// 			this.removeFromParent();
// 		}
// 	};

// 	private onRemoved = (_: THREE.Event<"removed", this>) => {
// 		this._log("onRemoved...");
// 		this.detachFromWorldRecursively();
// 	};

// 	private attachToWorld(world: GameWorld<TModules>) {
// 		this._log("attachToWorld...");
// 		if (this._world !== null) {
// 			this._log("attachToWorld: has world");
// 			if (this._world !== world) {
// 				this._log("attachToWorld: has different world");
// 				this.detachFromWorld();
// 				this.attachToWorld(world);
// 			}
// 			return;
// 		}

// 		this._world = world;
// 		_event.attachedToWorld.world = this._world;
// 		this._log("attachToWorld done!");
// 		this.dispatchEvent(
// 			//TODO: fix type error
// 			//@ts-ignore
// 			_event.attachedToWorld
// 		);
// 	}

// 	private detachFromWorld() {
// 		this._log("detachFromWorld...");
// 		if (this._world === null) return;

// 		_event.detachedFromWorld.world = this._world;
// 		this._world = null;
// 		this._log("detachFromWorld done!");
// 		this.dispatchEvent(
// 			//TODO: fix type error
// 			//@ts-ignore
// 			_event.detachedFromWorld
// 		);
// 	}

// 	private attachToWorldRecursively(world: GameWorld<TModules>) {
// 		this._log("attachToWorldRecursively...");
// 		this.traverse((child) => {
// 			GameObject.isIt<TModules>(child) && child.attachToWorld(world);
// 		});
// 	}

// 	private detachFromWorldRecursively() {
// 		this._log("detachFromWorldRecursively...");
// 		this.traverse((child) => {
// 			GameObject.isIt(child) && child.detachFromWorld();
// 		});
// 	}

// 	private _log = (...args: any[]) => {
// 		// console.log(`g-${this.id}`, ...args);
// 	};
// }

// const _event: {
// 	[K in keyof GameObjectEventMap<any>]: { type: K } & Partial<
// 		GameObjectEventMap<any>[K]
// 	>;
// } = {
// 	attachedToWorld: { type: "attachedToWorld" },
// 	detachedFromWorld: { type: "detachedFromWorld" },
// };

export type isSubsetRecord<
	TSub extends Record<TKey, TValue>,
	TRecord extends Record<TKey, TValue>,
	TKey extends string | number | symbol = string,
	TValue = any
> = {
	[K in keyof TSub]: K extends keyof TRecord
		? TSub[K] extends TRecord[K]
			? never
			: K
		: K;
}[keyof TSub];

export type CompatibleFeature<
	TFeatureModules extends GameContextModulesRecord,
	TGameObjectModules extends GameContextModulesRecord
> = isSubsetRecord<TFeatureModules, TGameObjectModules> extends never
	? Feature<TFeatureModules>
	: never;

export type CompatibleModules<
	TSubModules extends GameContextModulesRecord,
	TModules extends GameContextModulesRecord
> = isSubsetRecord<TSubModules, TModules> extends never ? TSubModules : never;