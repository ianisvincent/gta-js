import {CharacterStateBase} from "./CharacterStateBase";
import {ICharacterState} from "../../interfaces/ICharacterState";
import {Character} from "../Character";
import {Walk} from "./Walk";

export class Punch extends CharacterStateBase implements ICharacterState {
    constructor(character: Character) {
        super(character);
        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 10;

        this.character.setArcadeVelocityTarget(0);
        this.playAnimation('punch', 0.1);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
        this.fallInAir();
    }

    public onInputChange(): void {
        super.onInputChange();


        if (this.anyDirection()) {
            if (this.character.velocity.length() > 0.5) {
                this.character.setState(new Walk(this.character));
            } else {
                this.setAppropriateStartWalkState();
            }
        }
    }
}
