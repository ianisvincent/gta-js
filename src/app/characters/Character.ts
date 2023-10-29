import * as THREE from 'three';
import * as CANNON from 'cannon';
import * as _ from 'lodash';
import * as Utils from '../core/FunctionLibrary';
import { KeyBinding } from '../core/KeyBinding';
import { Idle } from './character_states/Idle';
import { ICharacterAI } from '../interfaces/ICharacterAI';
import { World } from '../world/World';
import { IControllable } from '../interfaces/IControllable';
import { ICharacterState } from '../interfaces/ICharacterState';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { VehicleSeat } from '../vehicles/VehicleSeat';
import { Vehicle } from '../vehicles/Vehicle';
import { CollisionGroups } from '../enums/CollisionGroups';
import { CapsuleCollider } from '../physics/colliders/CapsuleCollider';
import { VehicleEntryInstance } from './VehicleEntryInstance';
import { Object3D, Vector3 } from 'three';
import { EntityType } from '../enums/EntityType';
import { BodyPart } from '../enums/BodyPart';
import { CameraOperator } from '../core/CameraOperator';
import { IDamageable } from '../interfaces/IDamageable';
import { IDieable } from '../interfaces/IDieable';
import { Npc } from './Npc';
import { CharacterService } from './character.service';
import { WeaponType } from '../weapons/weapon-type';
import { VehicleInteraction } from './VehicleInteraction';
import { CharacterControls } from './CharacterControls';
import { CharacterPhysics } from './CharacterPhysics';
import { WeaponInteraction } from './WeaponInteraction';
import { CharacterSimulation } from './CharacterSimulation';
import { CharacterAnimation } from './CharacterAnimation';

export class Character extends THREE.Object3D implements IWorldEntity, IDamageable, IDieable {
    private controls: CharacterControls;
    private vehicleInteraction: VehicleInteraction;
    private weaponInteraction: WeaponInteraction;
    public physics: CharacterPhysics;
    public simulation: CharacterSimulation;
    public animationManager: CharacterAnimation;

    private rightHandGlobalPosition: Vector3;

    public updateOrder = 1;
    public entityType: EntityType = EntityType.Character;

    public isPlayer: boolean;
    public isNpc: boolean;

    public height = 0;
    public tiltContainer: THREE.Group;
    public modelContainer: THREE.Group;
    public materials: THREE.Material[] = [];

    // Custom Camera Pos
    public cameraPos: THREE.Vector3 = new THREE.Vector3();
    public cameraOperator: CameraOperator;

    public hasWeaponLoaded = false;

    // Movement
    public acceleration: THREE.Vector3 = new THREE.Vector3();
    public velocity: THREE.Vector3 = new THREE.Vector3();
    public arcadeVelocityInfluence: THREE.Vector3 = new THREE.Vector3();
    public velocityTarget: THREE.Vector3 = new THREE.Vector3();
    public arcadeVelocityIsAdditive = false;

    public moveSpeed = 4;
    public initJumpSpeed = -1;
    public wantsToJump = false;

    public viewVector: THREE.Vector3;
    public actions: { [action: string]: KeyBinding };
    public characterCapsule: CapsuleCollider;

    // Right-Hand Ray casting
    public rightHand: Object3D;

    public world: World;
    public charState: ICharacterState;
    public behaviour: ICharacterAI;

    // Vehicles
    public controlledObject: IControllable;
    public occupyingSeat: VehicleSeat = null;
    public vehicleEntryInstance: VehicleEntryInstance = null;

    public isAiming = false;
    public health = 100;
    public isDead: boolean;

    public isPunching: boolean;

    constructor(gltf: any, public characterService?: CharacterService) {
        super();
        this.readCharacterData(gltf);
        this.vehicleInteraction = new VehicleInteraction(this);
        this.controls = new CharacterControls(this);
        this.physics = new CharacterPhysics(this);
        this.weaponInteraction = new WeaponInteraction(this);
        this.simulation = new CharacterSimulation(this);
        this.animationManager = new CharacterAnimation(this);
        this.animationManager.setAnimations(gltf.animations);

        // The visuals group is centered for easy character tilting
        this.tiltContainer = new THREE.Group();
        this.add(this.tiltContainer);

        // Model container is used to reliably ground the character, as animation can alter the position of the model itself
        this.modelContainer = new THREE.Group();
        this.modelContainer.position.y = -0.57;
        this.tiltContainer.add(this.modelContainer);
        this.modelContainer.add(gltf.scene);

        this.animationManager.initMixer(gltf);

        this.simulation.initSpringSimulators();

        this.viewVector = new THREE.Vector3();

        // Actions
        this.actions = this.controls.initActions();

        // Player Capsule
        this.characterCapsule = new CapsuleCollider({
            mass: 1,
            position: new CANNON.Vec3(),
            height: 0.5,
            radius: 0.25,
            segments: 8,
            friction: 0.0
        });
        // capsulePhysics.physical.collisionFilterMask = ~CollisionGroups.Trimesh;
        this.characterCapsule.body.shapes.forEach((shape) => {
            // tslint:disable-next-line: no-bitwise
            shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
        });
        this.characterCapsule.body.allowSleep = false;

        // Move character to different collision group for raycasting
        this.characterCapsule.body.collisionFilterGroup = 2;

        // Disable character rotation
        this.characterCapsule.body.fixedRotation = true;
        this.characterCapsule.body.updateMassProperties();

        // Ray cast debug
        const boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const boxMat = new THREE.MeshLambertMaterial({
            color: 0xff0000
        });
        this.physics.raycastBox = new THREE.Mesh(boxGeo, boxMat);
        this.physics.raycastBox.visible = false;

        // Physics pre/post step callback bindings
        this.characterCapsule.body.preStep = (body: CANNON.Body) => {
            this.physics.physicsPreStep(body);
        };
        this.characterCapsule.body.postStep = (body: CANNON.Body) => {
            this.physics.physicsPostStep(body, this);
        };

        // States
        this.setState(new Idle(this));

        // Set right hand
        this.rightHandGlobalPosition = new THREE.Vector3();

        this.setRightHand();
    }

    public trackPlayerHandPosition(): void {
        const z = new THREE.Vector3();
        this.children.forEach((child) => {
            const hand = child.getObjectByName(BodyPart.RightHand);
            if (hand) {
                this.world.playerHandPos = hand.getWorldPosition(z);
            }
        });
    }

    public takeDamage(damage: number): void {
        if (this.health > 0) {
            this.health -= damage;
            if (this.isPlayer) { // TODO: Remove this soon, Every character will have health bar, even NPC
                this.updatePlayerHealthBar(damage);
            }
        } else {
            this.onDie();
        }
    }

    public onDie(): void {
        this.isDead = true;
    }

    public setRightHand(): void {
        this.weaponInteraction.setRightHand();
    }

    public setArcadeVelocityInfluence(x: number, y: number = x, z: number = x): void {
        this.arcadeVelocityInfluence.set(x, y, z);
    }

    public setViewVector(vector: THREE.Vector3): void {
        this.viewVector.copy(vector).normalize();
    }

    /**
     * Set state to the player. Pass state class (function) name.
     * @param {function} state
     */
    public setState(state: ICharacterState): void {
        this.charState = state;
        this.charState.onInputChange();
    }

    public setPosition(x: number, y: number, z: number): void {
        if (this.physics.isEnabled) {
            this.characterCapsule.body.previousPosition = new CANNON.Vec3(x, y, z);
            this.characterCapsule.body.position = new CANNON.Vec3(x, y, z);
            this.characterCapsule.body.interpolatedPosition = new CANNON.Vec3(x, y, z);
        } else {
            this.position.x = x;
            this.position.y = y;
            this.position.z = z;
        }
    }

    public setOrientation(vector: THREE.Vector3, instantly: boolean = false): void {
        const lookVector = new THREE.Vector3().copy(vector).setY(0).normalize();
        this.simulation.orientationTarget.copy(lookVector);

        if (instantly) {
            this.simulation.orientation.copy(lookVector);
        }
    }

    public resetOrientation(): void {
        const forward = Utils.getForward(this);
        this.setOrientation(forward, true);
    }

    public setBehaviour(behaviour: ICharacterAI): void {
        behaviour.character = this;
        this.behaviour = behaviour;
    }

    // Character physics
    public setPhysicsEnabled(value: boolean): void {
        this.physics.setPhysicsEnabled(value);
    }

    public readCharacterData(gltf: any): void {
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                Utils.setupMeshProperties(child);

                if (child.material !== undefined) {
                    this.materials.push(child.material);
                }
            }
        });
    }

    public handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean): void {
        this.controls.handleKeyboardEvent(event, code, pressed);
    }

    public handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void {
        this.controls.handleMouseButton(event, code, pressed);
    }

    public handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void {
        this.controls.handleMouseMove(event, deltaX, deltaY);
    }

    public handleMouseWheel(event: WheelEvent, value: number): void {
        this.controls.handleMouseWheel(event, value);
    }

    public triggerAction(actionName: string, value: boolean): void {
        this.controls.triggerAction(actionName, value);
    }

    public takeControl(): void {
        if (this.world !== undefined) {
            this.world.inputManager.setInputReceiver(this);
        } else {
            console.warn('Attempting to take control of a character that doesn\'t belong to a world.');
        }
    }

    public update(timeStep: number): void {
        if (this.characterService?.currentWeapon !== WeaponType.Fist && !this.hasWeaponLoaded) {
            this.loadWeapon(this.characterService?.currentWeapon);
        }
        if (this.characterService?.currentWeapon === WeaponType.Fist && this.hasWeaponLoaded) {
            this.unloadWeapon();
        }
        this.behaviour?.update(timeStep);
        this.vehicleEntryInstance?.update(timeStep);
        this.charState?.update(timeStep);
        // this.visuals.position.copy(this.modelOffset);
        if (this.physics.isEnabled) {
            this.simulation.springMovement(timeStep);
        }
        if (this.physics.isEnabled) {
            this.simulation.springRotation(timeStep);
        }
        if (this.physics.isEnabled) {
            this.rotateModel();
        }
        if (this.animationManager.mixer !== undefined) {
            this.animationManager.mixer.update(timeStep);
        }

        // Sync physics/graphics
        if (this.physics.isEnabled) {
            this.position.set(
                this.characterCapsule.body.interpolatedPosition.x,
                this.characterCapsule.body.interpolatedPosition.y,
                this.characterCapsule.body.interpolatedPosition.z
            );
        } else {
            const newPos = new THREE.Vector3();
            this.getWorldPosition(newPos);
            this.characterCapsule.body.position.copy(Utils.cannonVector(newPos));
            this.characterCapsule.body.interpolatedPosition.copy(Utils.cannonVector(newPos));
        }
        this.updateMatrixWorld();

        if (this.isPlayer && !(this instanceof Npc)) {
            this.trackPlayerHandPosition();
        }
    }

    public inputReceiverInit(): void {
        this.controls.inputReceiverInit();
    }

    public displayControls(): void {
        this.controls.displayControls();
    }

    public resetControls(): void {
        this.controls.resetControls();
    }

    public inputReceiverUpdate(timeStep: number): void {
        this.controls.inputReceiverUpdate(timeStep);
    }

    public setAnimation(clipName: string, fadeIn: number, runOnlyOnce?: boolean, lockWhenFinished?: boolean): number {
        return this.animationManager.setAnimation(clipName, fadeIn, runOnlyOnce, lockWhenFinished);
    }

    public updateAimAnimation(clipName: string, cameraRotation, vector): void {
        this.animationManager.updateAimAnimation(clipName, cameraRotation, vector);
    }

    public getLocalMovementDirection(): THREE.Vector3 {
        const positiveX = this.actions.right.isPressed ? -1 : 0;
        const negativeX = this.actions.left.isPressed ? 1 : 0;
        const positiveZ = this.actions.up.isPressed ? 1 : 0;
        const negativeZ = this.actions.down.isPressed ? -1 : 0;

        return new THREE.Vector3(positiveX + negativeX, 0, positiveZ + negativeZ).normalize();
    }

    // Character camera
    public getCameraRelativeMovementVector(): THREE.Vector3 {
        const localDirection = this.getLocalMovementDirection();
        const flatViewVector = new THREE.Vector3(this.viewVector.x, 0, this.viewVector.z).normalize();

        return Utils.appplyVectorMatrixXZ(flatViewVector, localDirection);
    }

    // Character camera
    public setCameraRelativeOrientationTarget(): void {
        if (this.vehicleEntryInstance === null) {
            const moveVector = this.getCameraRelativeMovementVector();

            if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0) {
                this.setOrientation(this.simulation.orientation);
            } else {
                this.setOrientation(moveVector);
            }
        }
    }

    public rotateModel(): void {
        this.lookAt(this.position.x + this.simulation.orientation.x, this.position.y + this.simulation.orientation.y, this.position.z + this.simulation.orientation.z);
        this.tiltContainer.rotation.z = (-this.simulation.angularVelocity * 2.3 * this.velocity.length());
        this.tiltContainer.position.setY((Math.cos(Math.abs(this.simulation.angularVelocity * 2.3 * this.velocity.length())) / 2) - 0.5);
    }

    public jump(initJumpSpeed: number = -1): void {
        this.wantsToJump = true;
        this.initJumpSpeed = initJumpSpeed;
    }

    public findVehicleToEnter(wantsToDrive: boolean): void {
        this.vehicleInteraction.findVehicleToEnter(wantsToDrive);
    }

    public enterVehicle(seat: VehicleSeat, entryPoint: THREE.Object3D): void {
        this.vehicleInteraction.enterVehicle(seat, entryPoint);
    }

    public teleportToVehicle(vehicle: Vehicle, seat: VehicleSeat): void {
        this.vehicleInteraction.teleportToVehicle(vehicle, seat);
    }

    public startControllingVehicle(vehicle: IControllable, seat: VehicleSeat): void {
        this.vehicleInteraction.startControllingVehicle(vehicle, seat);
    }

    public transferControls(entity: IControllable): void {
        this.controls.transferControls(entity);
    }

    public stopControllingVehicle(): void {
        this.vehicleInteraction.stopControllingVehicle();
    }

    public exitVehicle(): void {
        this.vehicleInteraction.exitVehicle();
    }

    public occupySeat(seat: VehicleSeat): void {
        this.vehicleInteraction.occupySeat(seat);
    }

    public leaveSeat(): void {
        this.vehicleInteraction.leaveSeat();
    }

    public addToWorld(world: World): void {
        if (_.includes(world.characters, this)) {
            console.warn('Adding character to a world in which it already exists.');
        } else {
            // Set world
            this.world = world;

            // Register character
            world.characters.push(this);

            // Register physics
            world.physicsWorld.addBody(this.characterCapsule.body);

            // Add to graphicsWorld
            world.graphicsWorld.add(this);
            world.graphicsWorld.add(this.physics.raycastBox);

            // Shadow cascades
            this.materials.forEach((mat) => {
                world.sky.csm.setupMaterial(mat);
            });
        }
    }

    public removeFromWorld(world: World): void {
        if (!_.includes(world.characters, this)) {
            console.warn('Removing character from a world in which it isn\'t present.');
        } else {
            if (world.inputManager.inputReceiver === this) {
                world.inputManager.inputReceiver = undefined;
            }

            this.world = undefined;

            // Remove from characters
            _.pull(world.characters, this);

            // Remove physics
            world.physicsWorld.remove(this.characterCapsule.body);

            // Remove visuals
            world.graphicsWorld.remove(this);
            world.graphicsWorld.remove(this.physics.raycastBox);
        }
    }

    public loadWeapon(weaponType: WeaponType): void {
        this.weaponInteraction.loadWeapon(weaponType);
    }

    public unloadWeapon(): void {
        this.weaponInteraction.unloadWeapon();
    }

    public lockAiming(character: Character): void {
        this.weaponInteraction.lockAiming(character);
    }

    public unlockAiming(): void {
        this.weaponInteraction.unlockAiming();
    }

    private updatePlayerHealthBar(damage: number): void {
        this.world.uiManager.updateHealthBar(damage);
    }
}
