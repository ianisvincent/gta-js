import { Character } from "../Character";
import { CharacterStateBase } from "./CharacterStateBase";

export abstract class NpcStateBase extends CharacterStateBase {

    constructor(character: Character) {
        super(character);
    }

    public update(timeStep: number): void {
        this.timer += timeStep;
    }

    public onInputChange(): void {

    }
}
