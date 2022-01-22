import { Component, OnInit } from '@angular/core';
import { World } from './world/World';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Game';
  word: World;

  constructor() {
  }

  ngOnInit(): void {
    this.word = new World('../assets/world.glb');
  }
}
