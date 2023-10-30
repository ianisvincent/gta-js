import { Component, OnInit } from '@angular/core';
import { skip } from 'rxjs/operators';
import { UiManagerService } from '../ui-manager.service';

@Component({
    selector: 'app-target',
    templateUrl: './target.component.html',
    styleUrls: ['./target.component.css']
})
export class TargetComponent implements OnInit {
    isVisible = false;

    constructor(private uiManagerService: UiManagerService) {
    }

    ngOnInit(): void {
        this.uiManagerService.updateTargetVisibilitySubject.pipe(skip(1)).subscribe((isVisible) => {
            this.isVisible = isVisible;
        });
    }

}
