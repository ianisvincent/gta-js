import { Character } from "./Character";

export class Npc extends Character {
    public isGettingShot: boolean;

    constructor(gltf: any) {
        console.log('create npc');
        super(gltf);
/*
        this.startWalk();
*/
    }

    private startWalk(): void {
        this.triggerAction('up', true);
    }
}
