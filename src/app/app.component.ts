import { Component, isDevMode, OnInit } from '@angular/core';
import { World } from './world/World';
import { UiManagerService } from './ui-manager.service';
import { WorldService } from './ui/word-controller/world.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Game';
  word: World;

  constructor(public UIManagerService: UiManagerService,
              public worldService: WorldService) {
  }

  ngOnInit(): void {
    this.word = new World(this.worldService, this.UIManagerService, environment.worldPath);
  }
}
