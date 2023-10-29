import {CharacterStateBase} from "./_stateLibrary";
import {ICharacterState} from "../../interfaces/ICharacterState";
import {Character} from "../Character";
import {Idle} from "./Idle";

export class Punch extends CharacterStateBase implements ICharacterState {

    constructor(character: Character) {
        super(character);
        this.character.simulation.velocitySimulator.damping = 0.6;
        this.character.simulation.velocitySimulator.mass = 10;
        this.character.isPunching = true;
        this.character.simulation.setArcadeVelocityTarget(0);
        this.playAnimation('punch', 0.1, true);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
        this.fallInAir();
        this.onDie();
        // If this character stop punching, go back to idle state
           if (this.animationEnded(timeStep)) {
               this.character.isPunching = false;
               this.character.setState(new Idle(this.character))
           }
    }

    public onInputChange(): void {
        super.onInputChange();
    }
}
