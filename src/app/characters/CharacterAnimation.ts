import { Character } from './Character';
import * as THREE from 'three';

export class CharacterAnimation {
    private readonly character: Character;
    public mixer: THREE.AnimationMixer;

    constructor(character: Character) {
        this.character = character;
    }

    initMixer(gtlf: any): void {
        this.mixer = new THREE.AnimationMixer(gtlf.scene);
    }
}
