import { Character } from './Character';
import * as THREE from 'three';

export class CharacterAnimation {
    private readonly character: Character;
    private aimingSettings = {offSet: 1.64, amplitude: 2.49};
    public mixer: THREE.AnimationMixer;
    public animations: THREE.AnimationClip[];

    constructor(character: Character) {
        this.character = character;
    }

    setAnimations(animations: THREE.AnimationClip[]): void {
        this.animations = animations;
    }

    initMixer(gtlf: any): void {
        this.mixer = new THREE.AnimationMixer(gtlf.scene);
    }

    updateAimAnimation(clipName: string, cameraRotation, vector): void {
        if (this.mixer !== undefined) {
            const clip = THREE.AnimationClip.findByName(this.animations, clipName);
            const action = this.mixer.clipAction(clip);
            // pitch UP max: 2 - pitch DOWN min: 0
            action.time = (cameraRotation.getWorldDirection(vector).y + this.aimingSettings.offSet) / this.aimingSettings.amplitude;
            action.paused = true;
            action.stopWarping();
        }
    }

    setAnimation(clipName: string, fadeIn: number, runOnlyOnce?: boolean, lockWhenFinished?: boolean): number {
        if (this.mixer !== undefined) {
            // gltf
            const clip = THREE.AnimationClip.findByName(this.animations, clipName);

            const action = this.mixer.clipAction(clip);
            if (action === null) {
                console.error(`Animation ${clipName} not found!`);
                return 0;
            }
            if (runOnlyOnce) {
                action.setLoop(THREE.LoopOnce, 1);
            }
            if (lockWhenFinished) {
                action.clampWhenFinished = true;
            }
            this.mixer.stopAllAction();
            action.fadeIn(fadeIn);
            action.play();
            return action.getClip().duration;
        }
    }
}
