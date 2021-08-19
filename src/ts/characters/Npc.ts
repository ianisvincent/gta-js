import { Character } from "./Character";

export class Npc extends Character {
    isGettingShot: boolean = false;

    constructor(gltf: any) {
        super(gltf);
    }

    public update(timeStep: number) {
        super.update(timeStep);
        if (this.isGettingShot) {
            // Do something if NPC is getting shot
        }
    }
}
