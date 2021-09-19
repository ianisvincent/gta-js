import { Character } from "./Character";

export class Npc extends Character {

    constructor(gltf: any) {
        super(gltf);
    }

    public update(timeStep: number) {
        super.update(timeStep);
        console.log(this.charState);
    }
}
