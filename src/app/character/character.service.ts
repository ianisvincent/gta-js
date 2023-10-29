import { Injectable } from '@angular/core';
import { WeaponType } from '../weapons/weapon-type';

@Injectable({
    providedIn: 'root'
})
export class CharacterService {
    currentWeapon = WeaponType.Fist;

    constructor() {
    }

    setCurrentWeapon(weapon: WeaponType): void {
        this.currentWeapon = weapon;
    }
}
