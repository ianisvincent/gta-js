import { Component, OnInit } from '@angular/core';
import { CONTROLS } from '../../character/controls/Controls';
import { UiManagerService } from '../ui-manager.service';
import { skip } from 'rxjs/operators';

@Component({
    selector: 'app-controls',
    templateUrl: './controls.component.html',
    styleUrls: ['./controls.component.css']
})
export class ControlsComponent implements OnInit {
    controls = CONTROLS;

    constructor(private uiManagerService: UiManagerService) {
    }

    ngOnInit(): void {
        this.uiManagerService.updateControlsSubject.pipe(skip(1)).subscribe((controls) => {
            this.updateControls(controls);
        });
    }

    updateControls(controls): void {
        this.controls = controls;
    }
}
