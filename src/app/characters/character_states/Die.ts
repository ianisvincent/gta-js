import { ICharacterState } from "../../interfaces/ICharacterState";
import { Character } from "../Character";
import { CharacterStateBase } from "./_stateLibrary";

export class Die extends CharacterStateBase implements ICharacterState {
    constructor(character: Character) {
        super(character);
        this.character.simulation.velocitySimulator.damping = 0.6;
        this.character.simulation.velocitySimulator.mass = 10;
        this.character.setArcadeVelocityTarget(0);
        this.playAnimation('die', 0.1, true, true);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
    }

    public onInputChange(): void {
        super.onInputChange();
    }
}
