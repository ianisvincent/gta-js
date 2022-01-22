import { ICharacterAI } from '../../interfaces/ICharacterAI';
import { Character } from '../Character';

export class Attack implements ICharacterAI
{
	public character: Character;

	constructor()
	{}

	public update(timeStep: number): void
	{
		{
			// AI punch
			this.character.triggerAction('punch', true);
			this.character.charState.update(timeStep);
		}
	}
}
