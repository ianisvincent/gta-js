import { Character } from "./Character";
import { WalkOnPath } from "./character_ai/WalkOnPath";
import { PathNode } from "../world/PathNode";
import { IDamageable } from "../interfaces/IDamageable";
import { IDieable } from "../interfaces/IDieable";
import { Die } from "./character_states/Die";
import { Scared } from "./character_states/Scared";
import * as GUI from '../../lib/utils/dat.gui';
import { ScaredRun } from "./character_states/ScaredRun";
import { WalkFollowTarget } from "./character_ai/WalkFollowTarget";
import { Idle } from "./character_states/Idle";
import * as THREE from "three";
import { Hurt } from "./character_states/Hurt";

export class Npc extends Character implements IDamageable, IDieable {
    private shotTaken = 0;
    private walkOnPath: WalkOnPath;
    name: string;

    constructor(gltf: any) {
        super(gltf);
        this.initDebug()
        this.name = 'npc';
    }

    public update(timeStep: number) {
        super.update(timeStep);
        this.trackNpcPosition()
        if (this.world.playerHandPos?.x.toFixed(1) === this.world.npcPos?.x.toFixed(1)) {
            console.log('HIT');
            this.setState(new Hurt(this));
        }
    }

    initNpc(node: PathNode) { // When an NPC is init, it walks on its path by default
        this.walkOnPath = new WalkOnPath(node, 1)
        // this.setBehaviour(this.walkOnPath);
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

    private initDebug(): void {
        const gui = new GUI.GUI();
        const gunGUIFolder = gui.addFolder('Npc Debug');
        var statesDropDownDebug =
            {
                states: 'states'
            }
        gunGUIFolder.add(statesDropDownDebug, 'states',
            {
                Scared: 'scared',
                Follow: 'follow',
                Run: 'run',
                Idle: 'idle'
            }).listen()
            .onChange((value) => {
                if (value === 'scared') {
                    this.setState(new Scared(this));
                } else if (value === 'run') {
                    this.setState(new ScaredRun(this));
                } else if (value === 'follow') {
                    this.setBehaviour(new WalkFollowTarget(this.world.characters[1], 1));
                } else if (value === 'idle') {
                    this.setBehaviour(new Idle(this));
                }
            });
    }

    private trackNpcPosition(): void {
        const y = new THREE.Vector3();
        this.world.npcPos = this.getWorldPosition(y)
    }
}
