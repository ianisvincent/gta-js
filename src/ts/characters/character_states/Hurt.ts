import { ICharacterState } from "../../interfaces/ICharacterState";
import { NpcStateBase } from "./NpcStateBase";
import { Npc } from "../Npc";


export class Hurt extends NpcStateBase implements ICharacterState {
    npc: Npc;

    constructor(npc: Npc) {
        super(npc);
        this.playAnimation('hurt', 0.1, true, true);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
    }

    public onInputChange(): void {
        super.onInputChange();
    }
}
