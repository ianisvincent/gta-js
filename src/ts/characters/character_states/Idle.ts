import
{
    CharacterStateBase,
    JumpIdle, Punch,
    Walk, Aim
} from './_stateLibrary';
import {ICharacterState} from '../../interfaces/ICharacterState';
import {Character} from '../Character';

export class Idle extends CharacterStateBase implements ICharacterState {
    constructor(character: Character) {
        super(character);

        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 10;

        this.character.setArcadeVelocityTarget(0);
        this.playAnimation('idle', 0.1);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
        this.fallInAir();
    }

    public onInputChange(): void {
        super.onInputChange();

        if (this.character.actions.jump.justPressed) {
            this.character.setState(new JumpIdle(this.character));
        }

        if (this.character.actions.punch.isPressed) {
            this.character.setState(new Punch(this.character));
        }

        // TODO: Find a way to set Aiming state and deal with stuff there...
        if (this.character.actions.aim.isPressed) {
            this.playAnimation('aim_pistol_idle', 0.1);
        }
        if (this.character.actions.aim.justReleased) {
            this.playAnimation('idle', 0.1);
        }


        if (this.anyDirection()) {
            if (this.character.velocity.length() > 0.5) {
                this.character.setState(new Walk(this.character));
            } else {
                this.setAppropriateStartWalkState();
            }
        }
    }
}
