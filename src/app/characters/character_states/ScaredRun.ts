import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';
import { NpcStateBase } from "./NpcStateBase";

export class ScaredRun extends NpcStateBase implements ICharacterState {
    constructor(character: Character) {
        super(character);
        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 10;
        this.character.setArcadeVelocityTarget(0);
        this.playAnimation('scared_run', 0.1, false, false);
        this.character.velocitySimulator.mass = 10;
        this.character.rotationSimulator.damping = 0.8;
        this.character.rotationSimulator.mass = 50;
        this.character.setArcadeVelocityTarget(1.1);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
    }

    public onInputChange(): void {
        super.onInputChange();
    }
}
