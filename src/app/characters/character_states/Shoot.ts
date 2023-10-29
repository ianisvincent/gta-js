import
{
    CharacterStateBase,
} from './_stateLibrary';
import {ICharacterState} from '../../interfaces/ICharacterState';
import {Character} from '../Character';

export class Shoot extends CharacterStateBase implements ICharacterState {
    constructor(character: Character) {
        super(character);
        this.character.simulation.velocitySimulator.damping = 0.6;
        this.character.simulation.velocitySimulator.mass = 10;
        this.character.setArcadeVelocityTarget(0);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
        this.fallInAir();
        this.onDie();
    }

    public onInputChange(): void {
        super.onInputChange();

    }
}
