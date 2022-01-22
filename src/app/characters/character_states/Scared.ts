import { ICharacterState } from "../../interfaces/ICharacterState";
import { NpcStateBase } from "./NpcStateBase";
import { Npc } from "../Npc";

export class Scared extends NpcStateBase implements ICharacterState {
    npc: Npc;

    constructor(npc: Npc) {
        super(npc);
        this.npc = npc;
        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 10;
        this.character.setArcadeVelocityTarget(0);
        this.playAnimation('ducking', 0.1, false, false);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
    }

    public onInputChange(): void {
        super.onInputChange();
    }
}
