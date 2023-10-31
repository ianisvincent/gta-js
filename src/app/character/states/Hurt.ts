import { ICharacterState } from '../../interfaces/ICharacterState';
import { NpcStateBase } from './NpcStateBase';
import { Npc } from '../Npc';
import { Die } from './Die';
import { CharacterAnimation } from '../../enums/CharacterAnimation';


export class Hurt extends NpcStateBase implements ICharacterState {

    constructor(npc: Npc, alreadyTookPunch: boolean ) {
        super(npc);
        this.npc = npc;
        this.alreadyTookPunch = alreadyTookPunch;
        if (!this.npc.alreadyTookPunch) {
            this.npc.takeDamage(50);
            this.playAnimation(CharacterAnimation.Hurt, 0.1, true, true);
        }
    }
    npc: Npc;
    alreadyTookPunch = false;
z;

    public update(timeStep: number): void {
        super.update(timeStep);
        if (this.animationEnded(timeStep)) {
            this.alreadyTookPunch = true;
            this.npc.alreadyTookPunch = true;
            if (this.npc.isDead) {
                this.npc.setState(new Die(this.npc));
            }
        }
    }
    public onInputChange(): void {
        super.onInputChange();
    }
}
