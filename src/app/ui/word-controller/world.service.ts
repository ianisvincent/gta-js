import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WorldService {
    worldTimeScale = 1;

    constructor() {
    }

    setWorldTimeScale(value: number): void {
        this.worldTimeScale = value;
    }
}
