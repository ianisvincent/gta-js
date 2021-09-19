import { Character } from "../Character";
import { NpcStateBase } from "./NpcStateBase";

export class Scared extends NpcStateBase {
    constructor(character: Character) {
        super(character);
        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 10;
        this.character.setArcadeVelocityTarget(0);
        this.playAnimation('ducking', 0.1, true, true);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
    }

    public onInputChange(): void {
        super.onInputChange();
    }

    protected playAnimation(animName: string, fadeIn: number, runOnlyOnce?: boolean, lockWhenFinished?: boolean): void {
        this.animationLength = this.character.setAnimation(animName, fadeIn, runOnlyOnce, lockWhenFinished);
    }
}
