import { Component, OnInit } from '@angular/core';
import { World } from './world/World';
import { UiManagerService } from './ui-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Game';
  word: World;

  constructor(public UIManagerService: UiManagerService) {
  }

  ngOnInit(): void {
    this.word = new World(this.UIManagerService, '../assets/world.glb');
  }
}
