import
{
	CharacterStateBase,
	Falling,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';

export class JumpRunning extends CharacterStateBase implements ICharacterState
{
	private alreadyJumped: boolean;

	constructor(character: Character)
	{
		super(character);

		this.character.simulation.velocitySimulator.mass = 100;
		this.playAnimation('jump_running', 0.03);
		this.alreadyJumped = false;
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);
		this.onDie();
		this.character.setCameraRelativeOrientationTarget();

		// Move in air
		if (this.alreadyJumped)
		{
			this.character.simulation.setArcadeVelocityTarget(this.anyDirection() ? 0.8 : 0);
		}
		// Physically jump
		if (this.timer > 0.13 && !this.alreadyJumped)
		{
			this.character.jump(4);
			this.alreadyJumped = true;

			this.character.simulation.rotationSimulator.damping = 0.3;
			this.character.physics.arcadeVelocityIsAdditive = true;
			this.character.physics.setArcadeVelocityInfluence(0.05, 0, 0.05);
		}
		else if (this.timer > 0.24 && this.character.physics.rayHasHit)
		{
			this.setAppropriateDropState();
		}
		else if (this.animationEnded(timeStep))
		{
			this.character.setState(new Falling(this.character));
		}
	}
}
