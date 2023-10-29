import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';
import { NpcStateBase } from "./NpcStateBase";

export class ScaredRun extends NpcStateBase implements ICharacterState {
    constructor(character: Character) {
        super(character);
        this.character.simulation.velocitySimulator.damping = 0.6;
        this.character.simulation.velocitySimulator.mass = 10;
        this.character.simulation.setArcadeVelocityTarget(0);
        this.playAnimation('scared_run', 0.1, false, false);
        this.character.simulation.velocitySimulator.mass = 10;
        this.character.simulation.rotationSimulator.damping = 0.8;
        this.character.simulation.rotationSimulator.mass = 50;
        this.character.simulation.setArcadeVelocityTarget(1.1);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
    }

    public onInputChange(): void {
        super.onInputChange();
    }
}
