import { StartWalkBase } from './_stateLibrary';
import { Character } from '../Character';

export class AimWalkLeft extends StartWalkBase {
    constructor(character: Character) {
        super(character);
        this.animationLength = character.animationManager.setAnimation('aim_walk_left', 0.1);
    }
}
