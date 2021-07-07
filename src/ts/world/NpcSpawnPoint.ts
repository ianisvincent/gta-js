import { ISpawnPoint } from '../interfaces/ISpawnPoint';
import * as THREE from 'three';
import { World } from './World';
import { Character } from '../characters/Character';
import { LoadingManager } from '../core/LoadingManager';
import * as Utils from '../core/FunctionLibrary';

export class NpcSpawnPoint implements ISpawnPoint {
    private object: THREE.Object3D;
    public type: string;
    public driver: string;
    public firstAINode: string;

    constructor(object: THREE.Object3D) {
        this.object = object;
    }

    public spawn(loadingManager: LoadingManager, world: World): void {
        loadingManager.loadGLTF('build/assets/brian.glb', (model) => {
            let npc = new Character(model);
            npc.traverse(function (object) {
                object.frustumCulled = false;
            })
            let worldPos = new THREE.Vector3();
            this.object.getWorldPosition(worldPos);
            npc.setPosition(worldPos.x, worldPos.y, worldPos.z);

            let forward = Utils.getForward(this.object);
            npc.setOrientation(forward, true);

            // Affect collision mesh to npc
            const geometry = new THREE.BoxGeometry( 0.3, 1.7, 0.3 );
            const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
            geometry.name = 'collisionNpcGeometry';

            // Make the collision box transparent
            material.transparent = true;
            material.opacity = 0;

            const mesh = new THREE.Mesh( geometry, material );

            // Affect name to npc
            mesh.name = `npc${this.object.uuid.substring(0, 3)}`
            npc.add(mesh);

            world.add(npc);
        });
    }
}
