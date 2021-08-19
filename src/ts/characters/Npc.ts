import { Character } from "./Character";
import { RandomBehaviour } from "./character_ai/RandomBehaviour";

export class Npc extends Character {

    constructor(gltf: any) {
        console.log('create npc');
        super(gltf);
/*        this.setBehaviour(new RandomBehaviour())*/
    }

}
