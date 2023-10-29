import
{
	CharacterStateBase,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';

export class Falling extends CharacterStateBase implements ICharacterState
{
	constructor(character: Character)
	{
		super(character);

		this.character.simulation.velocitySimulator.mass = 100;
		this.character.simulation.rotationSimulator.damping = 0.3;

		this.character.physics.arcadeVelocityIsAdditive = true;
		this.character.physics.setArcadeVelocityInfluence(0.05, 0, 0.05);

		this.playAnimation('falling', 0.3);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);
		this.onDie();
		this.character.setCameraRelativeOrientationTarget();
		this.character.simulation.setArcadeVelocityTarget(this.anyDirection() ? 0.8 : 0);

		if (this.character.physics.rayHasHit)
		{
			this.setAppropriateDropState();
		}
	}
}
