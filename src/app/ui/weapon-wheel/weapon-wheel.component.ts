import { Component, OnInit } from '@angular/core';

class WeaponSlot {
    containerSvgPath: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    type?: string;
    damage?: number;
    fireRate?: number;
    accuracy?: number;
    range?: number;
    image?: string;
    ammo?: number;
    totalAmmo?: number;
    isCurrentWeapon?: boolean;
}

@Component({
    selector: 'app-weapon-wheel',
    templateUrl: './weapon-wheel.component.html',
    styleUrls: ['./weapon-wheel.component.css']
})
export class WeaponWheelComponent implements OnInit {
    currentWeapon: string;
    weaponSlots: WeaponSlot[];

    constructor() {
    }

    ngOnInit(): void {
        this.weaponSlots = [
            {
                containerSvgPath: `M 522.1320343559643 522.1320343559643 A 300 300 0 0 1 310 610  L 310 510 A 200 200 0 0 0 451.4213562373095 451.4213562373095  z`,
                x: 140,
                y: 620,
                height: 60,
                width: 60,
                type: 'Unarmed',
                image: 'https://vignette.wikia.nocookie.net/gtawiki/images/e/e0/Fist-GTAVPC-HUD.png/revision/latest?cb=20150425182638',
                damage: 50,
                fireRate: 60,
                accuracy: 70,
                range: 10,
                isCurrentWeapon: true
            },
            {containerSvgPath: 'M 610 310 A 300 300 0 0 1 522.1320343559643 522.1320343559643  L 451.4213562373095 451.4213562373095 A 200 200 0 0 0 510 310  z',},
            {containerSvgPath: 'M 310 610 A 300 300 0 0 1 97.86796564403576 522.1320343559643  L 168.57864376269052 451.4213562373095 A 200 200 0 0 0 310 510  z'},
            {containerSvgPath: 'M 97.86796564403576 522.1320343559643 A 300 300 0 0 1 10 310.00000000000006  L 110 310 A 200 200 0 0 0 168.57864376269052 451.4213562373095  z'},
            {containerSvgPath: 'M 10 310.00000000000006 A 300 300 0 0 1 97.8679656440357 97.86796564403576  L 168.57864376269046 168.57864376269052 A 200 200 0 0 0 110 310  z'},
            {containerSvgPath: 'M 97.8679656440357 97.86796564403576 A 300 300 0 0 1 309.99999999999994 10  L 309.99999999999994 110 A 200 200 0 0 0 168.57864376269046 168.57864376269052  z'},
            {containerSvgPath: 'M 309.99999999999994 10 A 300 300 0 0 1 522.1320343559642 97.8679656440357  L 451.4213562373095 168.57864376269046 A 200 200 0 0 0 309.99999999999994 110  z'},
            {containerSvgPath: 'M 522.1320343559642 97.8679656440357 A 300 300 0 0 1 610 309.99999999999994  L 510 309.99999999999994 A 200 200 0 0 0 451.4213562373095 168.57864376269046  z'}
        ];
    }

    onSelectWeapon(weaponSlot: WeaponSlot): void {
        this.currentWeapon = weaponSlot.type;
    }

    onMouseOverWeapon(weaponSlot: WeaponSlot): void {
        this.currentWeapon = weaponSlot.type;
    }

    onMouseOutWeapon(weaponSlot: WeaponSlot): void {
        this.currentWeapon = null;
    }
}