import { ISpawnPoint } from '../interfaces/ISpawnPoint';
import * as THREE from 'three';
import { World } from './World';
import { Character } from '../characters/Character';
import { LoadingManager } from '../core/LoadingManager';
import * as Utils from '../core/FunctionLibrary';

export class CharacterSpawnPoint implements ISpawnPoint {
    private object: THREE.Object3D;

    constructor(object: THREE.Object3D) {
        this.object = object;
    }

    public spawn(loadingManager: LoadingManager, world: World): void {
        loadingManager.loadGLTF('../../assets/low_poly.glb', (model) => {
            const player = new Character(model, world.uiManager);
            world.player = player;
            player.traverse((object) => {
                object.frustumCulled = false;
            });
            const worldPos = new THREE.Vector3();
            this.object.getWorldPosition(worldPos);
            player.setPosition(worldPos.x, worldPos.y, worldPos.z);

            const forward = Utils.getForward(this.object);
            player.setOrientation(forward, true);
            player.isPlayer = true;
            world.add(player);
            player.takeControl();
        });
    }
}
