import * as THREE from 'three';
import * as _ from 'lodash';
import { Character } from '../Character';
import { KeyBinding } from '../../core/KeyBinding';
import { IControllable } from '../../interfaces/IControllable';

export class CharacterControls {
    private readonly character: Character;

    constructor(character: Character) {
        this.character = character;
    }

    public initActions(): { [action: string]: KeyBinding } {
        return {
            up: new KeyBinding('KeyW'),
            down: new KeyBinding('KeyS'),
            left: new KeyBinding('KeyA'),
            right: new KeyBinding('KeyD'),
            run: new KeyBinding('ShiftLeft'),
            jump: new KeyBinding('Space'),
            spawn_gun: new KeyBinding('KeyT'),
            wheel: new KeyBinding('KeyC'),
            aim: new KeyBinding('KeyY'),
            shoot: new KeyBinding('KeyK'),
            punch: new KeyBinding('KeyP'),
            use: new KeyBinding('KeyE'),
            enter: new KeyBinding('KeyF'),
            enter_passenger: new KeyBinding('KeyG'),
            seat_switch: new KeyBinding('KeyX'),
            primary: new KeyBinding('Mouse0'),
            secondary: new KeyBinding('Mouse1'),
        };
    }

    public handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean): void {
        if (this.character.controlledObject !== undefined) {
            this.character.controlledObject.handleKeyboardEvent(event, code, pressed);
        } else {
            // Free camera
            if (code === 'KeyC' && pressed === true && event.shiftKey === true) {
                this.resetControls();
                this.character.world.cameraOperator.targetedCharacter = this.character;
                this.character.world.inputManager.setInputReceiver(this.character.world.cameraOperator);
            } else if (code === 'KeyR' && pressed === true && event.shiftKey === true) {
                this.character.world.restartScenario();
            } else {
                for (const action in this.character.actions) {
                    if (this.character.actions.hasOwnProperty(action)) {
                        const binding = this.character.actions[action];

                        if (_.includes(binding.eventCodes, code)) {
                            this.character.triggerAction(action, pressed);
                        }
                    }
                }
            }
        }
    }

    public handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void {
        if (this.character.controlledObject !== undefined) {
            this.character.controlledObject.handleMouseButton(event, code, pressed);
        } else {
            for (const action in this.character.actions) {
                if (this.character.actions.hasOwnProperty(action)) {
                    const binding = this.character.actions[action];

                    if (_.includes(binding.eventCodes, code)) {
                        this.character.triggerAction(action, pressed);
                    }
                }
            }
        }
    }

    public handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void {
        if (this.character.controlledObject !== undefined) {
            this.character.controlledObject.handleMouseMove(event, deltaX, deltaY);
        } else {
            this.character.world.cameraOperator.move(deltaX, deltaY);
        }
    }

    public handleMouseWheel(event: WheelEvent, value: number): void {
        if (this.character.controlledObject !== undefined) {
            this.character.controlledObject.handleMouseWheel(event, value);
        } else {
            this.character.world.scrollTheTimeScale(value);
        }
    }

    public inputReceiverInit(): void {
        if (this.character.controlledObject !== undefined) {
            this.character.controlledObject.inputReceiverInit();
            return;
        }

        this.character.world.cameraOperator.setRadius(2.0, true);
        this.character.world.cameraOperator.followMode = false;
        // this.world.dirLight.target = this;
    }

    public inputReceiverUpdate(timeStep: number): void {
        if (this.character.controlledObject !== undefined) {
            this.character.controlledObject.inputReceiverUpdate(timeStep);
        } else {
            // Look in camera's direction
            this.character.viewVector = new THREE.Vector3().subVectors(this.character.position, this.character.world.camera.position);
            this.character.getWorldPosition(this.character.cameraPos);
            this.character.cameraPos.y += 0.7;
            this.character.world.cameraOperator.target = this.character.cameraPos;
        }

    }

    public triggerAction(actionName: string, value: boolean): void {
        // Get action and set it's parameters
        const action = this.character.actions[actionName];

        if (action.isPressed !== value) {
            // Set value
            action.isPressed = value;

            // Reset the 'just' attributes
            action.justPressed = false;
            action.justReleased = false;

            // Set the 'just' attributes
            if (value) {
                action.justPressed = true;
            } else {
                action.justReleased = true;
            }

            // Tell player to handle states according to new input
            this.character.charState.onInputChange();

            // Reset the 'just' attributes
            action.justPressed = false;
            action.justReleased = false;
        }
    }

    public resetControls(): void {
        for (const action in this.character.actions) {
            if (this.character.actions.hasOwnProperty(action)) {
                this.triggerAction(action, false);
            }
        }
    }

    public transferControls(entity: IControllable): void {
        // Currently running through all actions of this character and the vehicle,
        // comparing keycodes of actions and based on that triggering vehicle's actions
        // Maybe we should ask input manager what's the current state of the keyboard
        // and read those values... TODO
        for (const action1 in this.character.actions) {
            if (this.character.actions.hasOwnProperty(action1)) {
                for (const action2 in entity.actions) {
                    if (entity.actions.hasOwnProperty(action2)) {

                        const a1 = this.character.actions[action1];
                        const a2 = entity.actions[action2];

                        a1.eventCodes.forEach((code1) => {
                            a2.eventCodes.forEach((code2) => {
                                if (code1 === code2) {
                                    entity.triggerAction(action2, a1.isPressed);
                                }
                            });
                        });
                    }
                }
            }
        }
    }
}
