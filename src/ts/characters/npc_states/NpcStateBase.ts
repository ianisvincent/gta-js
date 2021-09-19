import { Character } from "../Character";
import { ICharacterState } from "../../interfaces/ICharacterState";

export abstract class NpcStateBase implements ICharacterState {
    public character: Character;
    public timer: number;
    public animationLength: any;

    public canFindVehiclesToEnter: boolean;
    public canEnterVehicles: boolean;
    public canLeaveVehicles: boolean;

    constructor(character: Character) {
        this.character = character;

        this.character.velocitySimulator.damping = this.character.defaultVelocitySimulatorDamping;
        this.character.velocitySimulator.mass = this.character.defaultVelocitySimulatorMass;

        this.character.rotationSimulator.damping = this.character.defaultRotationSimulatorDamping;
        this.character.rotationSimulator.mass = this.character.defaultRotationSimulatorMass;

        this.character.arcadeVelocityIsAdditive = false;
        this.character.setArcadeVelocityInfluence(1, 0, 1);
        this.timer = 0;
    }

    public update(timeStep: number): void {
        this.timer += timeStep;
    }

    public onInputChange(): void {

    }
}
