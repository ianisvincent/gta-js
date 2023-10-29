import
{
	CharacterStateBase,
	EndWalk,
	JumpRunning,
	Walk,
} from './_stateLibrary';
import { Character } from '../Character';

export class Sprint extends CharacterStateBase
{
	constructor(character: Character)
	{
		super(character);

		this.canEnterVehicles = true;

		this.character.simulation.velocitySimulator.mass = 10;
		this.character.simulation.rotationSimulator.damping = 0.8;
		this.character.simulation.rotationSimulator.mass = 50;

		this.character.simulation.setArcadeVelocityTarget(1.1);
		this.playAnimation('run', 0.1);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);
		this.character.setCameraRelativeOrientationTarget();
		this.fallInAir();
		this.onDie();
	}

	public onInputChange(): void
	{
		super.onInputChange();

		if (!this.character.actions.run.isPressed)
		{
			this.character.setState(new Walk(this.character));
		}

		if (this.character.actions.jump.justPressed)
		{
			this.character.setState(new JumpRunning(this.character));
		}

		if (this.noDirection())
		{
			this.character.setState(new EndWalk(this.character));
		}
	}
}
