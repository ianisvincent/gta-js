import { StartWalkBase } from './_stateLibrary';
import { Character } from '../Character';

export class AimWalkForward extends StartWalkBase {
    constructor(character: Character) {
        super(character);
        this.animationLength = character.animationManager.setAnimation('aim_walk_forward', 0.1);
    }
}
