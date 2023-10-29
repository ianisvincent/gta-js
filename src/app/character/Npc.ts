import { Character } from './Character';
import { WalkOnPath } from './ai/WalkOnPath';
import { PathNode } from '../world/PathNode';
import { IDamageable } from '../interfaces/IDamageable';
import { IDieable } from '../interfaces/IDieable';
import { Die } from './states/Die';
import { Scared } from './states/Scared';
import * as GUI from '../../lib/utils/dat.gui';
import { ScaredRun } from './states/ScaredRun';
import { WalkFollowTarget } from './ai/WalkFollowTarget';
import { Idle } from './states/Idle';
import * as THREE from 'three';
import { Hurt } from './states/Hurt';

export class Npc extends Character implements IDamageable, IDieable {
    private shotTaken = 0;
    private walkOnPath: WalkOnPath;
    name: string;
    alreadyTookPunch = false;

    constructor(gltf: any) {
        super(gltf);
        this.initDebug();
        this.name = 'npc';
    }

    public update(timeStep: number): void {
        super.update(timeStep);
        this.trackNpcPosition();
        if (this.world.playerHandPos?.x.toFixed(1) === this.world.npcPos?.x.toFixed(1)) {
            if (this.world.player.isPunching) {
                this.world.player.isPunching = false;
                this.alreadyTookPunch = false;
                if (!this.alreadyTookPunch) {
                    this.setState(new Hurt(this, this.alreadyTookPunch));
                }
            }
        }
    }

    initNpc(node: PathNode): void { // When an NPC is init, it walks on its path by default
        this.walkOnPath = new WalkOnPath(node, 1);
        this.setBehaviour(this.walkOnPath);
    }

    takeDamage(damage: number): void {
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
        const statesDropDownDebug =
            {
                states: 'states'
            };
        gunGUIFolder.add(statesDropDownDebug, 'states',
            {
                Scared: 'scared',
                Follow: 'follow',
                Run: 'run',
                Attack: 'attack',
                Idle: 'idle'
            }).listen()
            .onChange((value) => {
                if (value === 'scared') {
                    this.setState(new Scared(this));
                } else if (value === 'run') {
                    this.setState(new ScaredRun(this));
                } else if (value === 'follow') {
                    const player = this.world.characters.find((character) => character.isPlayer === true);
                    this.setBehaviour(new WalkFollowTarget(player, 1));
                } else if (value === 'idle') {
                    this.setBehaviour(new Idle(this));
                } else if (value === 'attack') {
                    const player = this.world.characters.find((character) => character.isPlayer === true);
                    this.setBehaviour(new WalkFollowTarget(player, 1, true));
                }
            });
    }

    private trackNpcPosition(): void {
        const y = new THREE.Vector3();
        this.world.npcPos = this.getWorldPosition(y);
    }
}
