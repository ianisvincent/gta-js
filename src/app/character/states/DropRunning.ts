import
{
	CharacterStateBase,
	EndWalk,
	JumpRunning,
	Sprint,
	Walk,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';
import { CharacterAnimation } from '../../enums/CharacterAnimation';

export class DropRunning extends CharacterStateBase implements ICharacterState
{
	constructor(character: Character)
	{
		super(character);

		this.character.simulation.setArcadeVelocityTarget(0.8);
		this.playAnimation(CharacterAnimation.DropRunning, 0.1);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);
		this.onDie();
		this.character.setCameraRelativeOrientationTarget();

		if (this.animationEnded(timeStep))
		{
			this.character.setState(new Walk(this.character));
		}
	}

	public onInputChange(): void
	{
		super.onInputChange();
		
		if (this.noDirection())
		{
			this.character.setState(new EndWalk(this.character));
		}

		if (this.anyDirection() && this.character.actions.run.justPressed)
		{
			this.character.setState(new Sprint(this.character));
		}

		if (this.character.actions.jump.justPressed)
		{
			this.character.setState(new JumpRunning(this.character));
		}
	}
}
