import { Character } from '../character/Character';

export interface ICharacterAI {
	character: Character;
	update(timeStep: number): void;
}
