import { ICharacterState } from "../../interfaces/ICharacterState";
import { NpcStateBase } from "./NpcStateBase";
import { Npc } from "../Npc";


export class Hurt extends NpcStateBase implements ICharacterState {
    npc: Npc;
    alreadyTookPunch = false;

    constructor(npc: Npc, alreadyTookPunch: boolean ) {
        super(npc);
        this.npc = npc;
        this.alreadyTookPunch = alreadyTookPunch;
        if (!this.npc.alreadyTookPunch) {
            this.playAnimation('hurt', 0.1, true, true);
        }
    }

    public update(timeStep: number): void {
        super.update(timeStep);
        if (this.animationEnded(timeStep))
		{
			this.alreadyTookPunch = true;
			this.npc.alreadyTookPunch = true;
		}
    }

    public onInputChange(): void {
        super.onInputChange();
    }
}
