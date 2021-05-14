import {CharacterStateBase} from "./CharacterStateBase";
import {ICharacterState} from "../../interfaces/ICharacterState";
import {Character} from "../Character";
import {Idle} from "./Idle";

export class Punch extends CharacterStateBase implements ICharacterState {
    constructor(character: Character) {
        super(character);
        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 10;

        this.character.setArcadeVelocityTarget(0);
        this.playAnimation('punch', 0.1, true);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
        this.fallInAir();

        // If this character stop punching, go back to idle state
           if (this.animationEnded(timeStep)) {
               this.character.setState(new Idle(this.character))
           }
    }

    public onInputChange(): void {
        super.onInputChange();
    }
}
