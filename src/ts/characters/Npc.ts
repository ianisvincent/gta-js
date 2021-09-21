import { Character } from "./Character";
import { WalkOnPath } from "./character_ai/WalkOnPath";
import { PathNode } from "../world/PathNode";
import { IDamageable } from "../interfaces/IDamageable";

export class Npc extends Character implements IDamageable {

    constructor(gltf: any) {
        super(gltf);
    }

    public update(timeStep: number) {
        super.update(timeStep);
    }

    initNpc(node: PathNode) { // When an NPC is init, it walks on its path by default
        this.setBehaviour(new WalkOnPath(node, 1));
    }

    takeDamage(damage: number) {
        super.takeDamage(damage);
    }

}
