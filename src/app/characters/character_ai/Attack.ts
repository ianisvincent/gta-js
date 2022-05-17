import { ICharacterAI } from '../../interfaces/ICharacterAI';
import { Character } from '../Character';
import * as THREE from 'three';

export class Attack implements ICharacterAI {
    public character: Character;
    public target: THREE.Object3D;


    constructor(target: THREE.Object3D) {
        this.target = target;
    }

    public update(timeStep: number): void {
        {
            // AI punch
            this.character.triggerAction('punch', true);
            this.character.charState.update(timeStep);
        }
    }
}
