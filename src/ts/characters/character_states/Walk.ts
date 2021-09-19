import
{
	Aim,
	CharacterStateBase,
	EndWalk,
	Idle,
	JumpRunning,
	Sprint,
} from './_stateLibrary';
import { Character } from '../Character';

export class Walk extends CharacterStateBase
{
	constructor(character: Character)
	{
		super(character);

		this.canEnterVehicles = true;
		this.character.setArcadeVelocityTarget(0.5);
		this.playAnimation('walk', 0.1);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);
		this.character.setCameraRelativeOrientationTarget();

		this.fallInAir();
		this.onDie();
		this.onShoot()
	}

	public onInputChange(): void
	{
		super.onInputChange();

		if (this.character.hasWeapon && this.character.actions.aim.justPressed) {
			this.character.setState(new Aim(this.character));
		}

		if (this.noDirection())
		{
			this.character.setState(new EndWalk(this.character));
		}
		
		if (this.character.actions.run.isPressed)
		{
			this.character.setState(new Sprint(this.character));
		}
		
		if (this.character.actions.run.justPressed)
		{
			this.character.setState(new Sprint(this.character));
		}

		if (this.character.actions.jump.justPressed)
		{
			this.character.setState(new JumpRunning(this.character));
		}

		if (this.noDirection())
		{
			if (this.character.velocity.length() > 1)
			{
				this.character.setState(new EndWalk(this.character));
			}
			else
			{
				this.character.setState(new Idle(this.character));
			}
		}
	}
}
