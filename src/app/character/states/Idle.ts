import {
    CharacterStateBase,
    JumpIdle, Punch,
    Walk, Aim
} from './_stateLibrary';
import {ICharacterState} from '../../interfaces/ICharacterState';
import {Character} from '../Character';
import { CharacterAnimation } from '../../enums/CharacterAnimation';

export class Idle extends CharacterStateBase implements ICharacterState {
    constructor(character: Character) {
        super(character);
        this.character.isAiming = false;
        this.character.simulation.velocitySimulator.damping = 0.6;
        this.character.simulation.velocitySimulator.mass = 10;

        this.character.simulation.setArcadeVelocityTarget(0);
        this.playAnimation(CharacterAnimation.Idle, 0.1);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
        this.fallInAir();
    }

    public onInputChange(): void {
        super.onInputChange();
        this.onDie();
        if (this.character.actions.jump.justPressed) {
            this.character.setState(new JumpIdle(this.character));
        }

        if (this.character.actions.punch.isPressed) {
            this.character.setState(new Punch(this.character));
        }

        if (this.character.actions.aim.justPressed && this.character.hasWeaponLoaded) {
            this.character.setState(new Aim(this.character));
        }

        if (this.anyDirection()) {
            if (this.character.simulation.velocity.length() > 0.5) {
                this.character.setState(new Walk(this.character));
            } else {
                this.setAppropriateStartWalkState();
            }
        }
    }
}
