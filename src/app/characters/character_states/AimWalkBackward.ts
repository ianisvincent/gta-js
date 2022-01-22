import { StartWalkBase } from './_stateLibrary';
import { Character } from '../Character';

export class AimWalkBackward extends StartWalkBase
{
	constructor(character: Character)
	{
		super(character);
		this.animationLength = character.setAnimation('aim_walk_backward', 0.1);
	}
}
