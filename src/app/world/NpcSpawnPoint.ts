import { ISpawnPoint } from '../interfaces/ISpawnPoint';
import * as THREE from 'three';
import { World } from './World';
import { LoadingManager } from '../core/LoadingManager';
import * as Utils from '../core/FunctionLibrary';
import { Npc } from '../characters/Npc';

export class NpcSpawnPoint implements ISpawnPoint {
    private object: THREE.Object3D;
    public type: string;
    public driver: string;
    public firstAINode: string;

    constructor(object: THREE.Object3D) {
        this.object = object;
    }

    public spawn(loadingManager: LoadingManager, world: World): void {
        loadingManager.loadGLTF('../../assets/low_poly.glb', (model) => {
            const npc = new Npc(model, world.uiManager);
            npc.traverse( (object) => {
                object.frustumCulled = false;
            });
            const worldPos = new THREE.Vector3();
            this.object.getWorldPosition(worldPos);
            npc.setPosition(worldPos.x, worldPos.y, worldPos.z);

            const forward = Utils.getForward(this.object);
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
            npc.isPlayer = false;
            world.add(npc);

            if (this.firstAINode !== undefined) {
                let nodeFound = false;
                for (const pathName in world.paths) {
                    if (world.paths.hasOwnProperty(pathName)) {
                        const path = world.paths[pathName];

                        for (const nodeName in path.nodes) {
                            if (Object.prototype.hasOwnProperty.call(path.nodes, nodeName)) {
                                const node = path.nodes[nodeName];

                                if (node.object.name === this.firstAINode) {
                                    npc.initNpc(node);
                                    nodeFound = true;
                                }
                            }
                        }
                    }
                }

                if (!nodeFound) {
                    console.error('Path node ' + this.firstAINode + 'not found.');
                }
            }
        });
    }
}
