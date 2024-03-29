import
{
	CharacterStateBase,
	EndWalk,
	Walk,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';
import { CharacterAnimation } from '../../enums/CharacterAnimation';

export class DropRolling extends CharacterStateBase implements ICharacterState
{
	constructor(character: Character)
	{
		super(character);

		this.character.simulation.velocitySimulator.mass = 1;
		this.character.simulation.velocitySimulator.damping = 0.6;

		this.character.simulation.setArcadeVelocityTarget(0.8);
		this.playAnimation(CharacterAnimation.DropRunningRoll, 0.03);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);
		this.onDie();
		this.character.setCameraRelativeOrientationTarget();

		if (this.animationEnded(timeStep))
		{
			if (this.anyDirection())
			{
				this.character.setState(new Walk(this.character));
			}
			else
			{
				this.character.setState(new EndWalk(this.character));
			}
		}
	}
}
