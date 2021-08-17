import { StartWalkBase } from './_stateLibrary';
import { Character } from '../Character';

export class AimWalkRight extends StartWalkBase
{
	constructor(character: Character)
	{
		super(character);
		this.animationLength = character.setAnimation('aim_walk_right', 0.1);
	}
}
