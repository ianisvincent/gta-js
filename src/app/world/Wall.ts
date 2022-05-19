import { IUpdatable } from '../interfaces/IUpdatable';
import * as THREE from 'three';
import { World } from './World';

export class Wall implements IUpdatable {
    public updateOrder = 11;
    boundingBox: THREE.Box3;
    mesh: THREE.Mesh;

    constructor(mesh: THREE.Mesh, world: World) {
        this.mesh = mesh;
        this.boundingBox = new THREE.Box3();
        this.mesh.geometry.computeBoundingBox();
        const helper = new THREE.Box3Helper( this.boundingBox, new THREE.Color( 0xff0000));
        world.graphicsWorld.add(helper);
    }

    public update(timeStep: number): void {
        this.boundingBox.copy(this.mesh.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld);
    }
}
