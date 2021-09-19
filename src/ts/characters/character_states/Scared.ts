import { Character } from "../Character";
import { ICharacterState } from "../../interfaces/ICharacterState";
import { NpcStateBase } from "./NpcStateBase";

export class Scared extends NpcStateBase implements ICharacterState {
    constructor(character: Character) {
        super(character);
        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 10;
        this.character.setArcadeVelocityTarget(0);
        this.playAnimation('ducking', 0.1, true, true);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
    }

    public onInputChange(): void {
        super.onInputChange();
    }
}
