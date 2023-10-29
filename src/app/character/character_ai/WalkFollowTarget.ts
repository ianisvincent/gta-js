import * as THREE from 'three';
import { ICharacterAI } from '../../interfaces/ICharacterAI';
import { Character } from '../Character';


export class WalkFollowTarget implements ICharacterAI {
    public character: Character;
    public isTargetReached: boolean;

    public target: THREE.Object3D;
    private stopDistance: number;
    private wantToPunch: boolean;

    constructor(target: THREE.Object3D, stopDistance: number = 1.3, wantToPunch?: boolean) {
        this.target = target;
        this.wantToPunch = wantToPunch;
        this.stopDistance = stopDistance;
    }

    public setTarget(target: THREE.Object3D): void {
        this.target = target;
    }

    public update(timeStep: number): void {

        const x = new THREE.Vector3();
        const y = new THREE.Vector3();
        const viewVector = new THREE.Vector3().subVectors(this.target.getWorldPosition(x), this.character.getWorldPosition(y));
        this.character.setViewVector(viewVector);

        // Follow character
        if (viewVector.length() > this.stopDistance) {
            if (this.wantToPunch) {
                this.character.triggerAction('punch', false);
            }
            this.isTargetReached = false;
            this.character.triggerAction('up', true);
        }
        // Stand still
        else {
            this.isTargetReached = true;
            if (this.wantToPunch) {
                this.character.triggerAction('punch', true);
            }
            this.character.triggerAction('up', false);
            // Look at character
            this.character.setOrientation(viewVector);
        }

    }
}
