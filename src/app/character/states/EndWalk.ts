import
{
	CharacterStateBase,
	Idle,
	JumpIdle,
	Sprint,
	Walk,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';

export class EndWalk extends CharacterStateBase implements ICharacterState
{
	constructor(character: Character)
	{
		super(character);

		this.character.simulation.setArcadeVelocityTarget(0);
		this.animationLength = character.animationManager.setAnimation('stop', 0.1);
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
			if (this.character.actions.run.isPressed)
			{
				this.character.setState(new Sprint(this.character));
			}
			else
			{
				if (this.character.simulation.velocity.length() > 0.5)
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
}
