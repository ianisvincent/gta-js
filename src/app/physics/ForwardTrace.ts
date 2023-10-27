import * as THREE from 'three';
import { Character } from '../characters/Character';
import { World } from '../world/World';

export class ForwardTrace {
    origin: Character;
    mesh: THREE.Mesh;
    boundingBox: THREE.Box3;
    rayCaster: THREE.Raycaster;
    targetMesh: THREE.Mesh;

    constructor(origin: Character, world: World) {
        this.boundingBox = new THREE.Box3();
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        this.mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial()
        );
        this.mesh.position.y = -0.3;
        this.mesh.position.z = 0.2;
        this.mesh.geometry.computeBoundingBox();
        const helper = new THREE.Box3Helper( this.boundingBox, new THREE.Color( 0x7d0a91));
        world.graphicsWorld.add(helper);

        origin.add(this.mesh);
        this.mesh.visible = false;
        this.setTargetMesh(world);
    }

    setTargetMesh(world: World): void {
        const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        this.targetMesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({color: 0xffe100})
        );
        const vec = new THREE.Vector3();
        const pos = this.mesh.getWorldPosition(vec);
        this.targetMesh.position.set(pos.x, pos.y, pos.z);
        world.graphicsWorld.add(this.targetMesh);
    }

    setRayCaster(): void {
        this.rayCaster = new THREE.Raycaster(this.mesh.position);
    }
}
