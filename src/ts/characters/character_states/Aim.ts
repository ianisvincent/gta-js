import {CharacterStateBase} from "./CharacterStateBase";
import {ICharacterState} from "../../interfaces/ICharacterState";
import {Character} from "../Character";
import {Idle} from "./Idle";

export class Aim extends CharacterStateBase implements ICharacterState {
    constructor(character: Character) {
        super(character);
        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 10;

        this.character.setArcadeVelocityTarget(0);
        this.playAnimation('aim_pistol_idle', 0.1, false);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
        this.fallInAir();

        // If this character stop aiming, go back to idle state
        if (this.animationEnded(timeStep)) {
            this.character.setState(new Idle(this.character))
        }
    }

    public onInputChange(): void {
        super.onInputChange();
    }
}
