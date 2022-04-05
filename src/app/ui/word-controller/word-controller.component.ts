import { Component, OnInit } from '@angular/core';
import { WorldService } from './world.service';

@Component({
    selector: 'app-word-controller',
    templateUrl: './word-controller.component.html',
    styleUrls: ['./word-controller.component.css']
})
export class WordControllerComponent implements OnInit {
    timeScale: number;

    constructor(private worldService: WorldService) {
    }

    ngOnInit(): void {
    }

    onTimeScaleChange(event): void {
        this.worldService.setWorldTimeScale(event.target.value);
    }

}
