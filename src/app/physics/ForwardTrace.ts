import * as THREE from 'three';
import { Character } from '../characters/Character';
import { World } from '../world/World';

export class ForwardTrace {
    origin: Character;
    mesh: THREE.Mesh;
    boundingBox: THREE.Box3;

    constructor(origin: Character, world: World) {
        this.boundingBox = new THREE.Box3();
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.7);
        this.mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial()
        );
        this.mesh.position.y = 0.4;
        this.mesh.position.z = 0.4;
        this.mesh.geometry.computeBoundingBox();
        const helper = new THREE.Box3Helper( this.boundingBox, new THREE.Color( 0xff0000));
        world.graphicsWorld.add(helper);

        origin.add(this.mesh);
    }
}
