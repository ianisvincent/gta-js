import
{
	CharacterStateBase,
	Idle,
	JumpIdle,
	Walk,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';

export class IdleRotateLeft extends CharacterStateBase implements ICharacterState
{
	constructor(character: Character)
	{
		super(character);

		this.character.simulation.rotationSimulator.mass = 30;
		this.character.simulation.rotationSimulator.damping = 0.6;

		this.character.simulation.velocitySimulator.damping = 0.6;
		this.character.simulation.velocitySimulator.mass = 10;

		this.character.setArcadeVelocityTarget(0);
		this.playAnimation('rotate_left', 0.1);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);
		this.onDie();
		if (this.animationEnded(timeStep))
		{
			this.character.setState(new Idle(this.character));
		}

		this.fallInAir();
	}

	public onInputChange(): void
	{
		super.onInputChange();
		
		if (this.character.actions.jump.justPressed)
		{
			this.character.setState(new JumpIdle(this.character));
		}

		if (this.anyDirection())
		{
			if (this.character.velocity.length() > 0.5)
			{
				this.character.setState(new Walk(this.character));
			}
			else
			{
				this.setAppropriateStartWalkState();
			}
		}
	}
}
