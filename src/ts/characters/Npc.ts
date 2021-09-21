import { Character } from "./Character";
import { WalkOnPath } from "./character_ai/WalkOnPath";
import { PathNode } from "../world/PathNode";
import { IDamageable } from "../interfaces/IDamageable";
import { IDieable } from "../interfaces/IDieable";
import { Die } from "./character_states/Die";
import { Scared } from "./character_states/Scared";

export class Npc extends Character implements IDamageable, IDieable {
    private shotTaken = 0;

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
        this.shotTaken += 1;
        if (!this.isDead && this.shotTaken === 1) {
             this.setState(new Scared(this));
        }
    }

    onDie(): void {
        super.onDie();
        this.setState(new Die(this));
    }

}
