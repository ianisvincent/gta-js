import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UiManagerService {
    isDisplayed = true;
    isPlayerIsAiming = true;

    constructor() {
    }

    displayLoadingScreen(value: boolean): void {
        this.isDisplayed = value;
    }

    displayTargetPoint(value: boolean): void {
        this.isPlayerIsAiming = value;
    }

    updateHealthBar(damage: number): void {
        // Update Player's  health bar
        const healthBarElement = document.getElementById('health-bar');
        const barElement = document.getElementById('bar');
        const hitElement = document.getElementById('hit');

        const healthMaxValue = parseInt(healthBarElement.dataset.total) as number;
        const healthValue = parseInt(healthBarElement.dataset.value) as number;

        const newValue = (healthValue - damage) as number;

        const barWidth = (newValue / healthMaxValue) * 100;
        const hitWidth = (damage / healthValue) * 100 + '%';

        hitElement.style.width = hitWidth;
        healthBarElement.dataset.value = String(newValue);

        setTimeout(() => {
            hitElement.style.width = '0';
            barElement.style.width = barWidth + '%';
        }, 500);
    }
}
