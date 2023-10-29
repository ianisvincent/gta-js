import * as THREE from 'three';
import * as CANNON from 'cannon';
import * as _ from 'lodash';
import * as Utils from '../core/FunctionLibrary';
import { KeyBinding } from '../core/KeyBinding';
import { VectorSpringSimulator } from '../physics/spring_simulation/VectorSpringSimulator';
import { RelativeSpringSimulator } from '../physics/spring_simulation/RelativeSpringSimulator';
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
import { GroundImpactData } from './GroundImpactData';
import { Object3D, Vector3 } from 'three';
import { EntityType } from '../enums/EntityType';
import { BodyPart } from '../enums/BodyPart';
import { CameraOperator } from '../core/CameraOperator';
import { IDamageable } from '../interfaces/IDamageable';
import { IDieable } from '../interfaces/IDieable';
import { Npc } from './Npc';
import { CharacterService } from './character.service';
import { WeaponType } from '../weapons/weapon-type';
import * as GUI from '../../lib/utils/dat.gui';
import { VehicleInteraction } from './VehicleInteraction';
import { CharacterControls } from './CharacterControls';
import { CharacterPhysics } from './CharacterPhysics';
import { WeaponInteraction } from './WeaponInteraction';

export class Character extends THREE.Object3D implements IWorldEntity, IDamageable, IDieable {
  private characterControls: CharacterControls;
  private vehicleInteraction: VehicleInteraction;
  private weaponInteraction: WeaponInteraction;
  private characterPhysics: CharacterPhysics;
  private clip: THREE.AnimationClip;
  private aimingSettings = {offSet: 1.64, amplitude: 2.49};
  private rightHandGlobalPosition: Vector3;

  public updateOrder = 1;
  public entityType: EntityType = EntityType.Character;

  public isPlayer: boolean;
  public isNpc: boolean;

  public height = 0;
  public tiltContainer: THREE.Group;
  public modelContainer: THREE.Group;
  public materials: THREE.Material[] = [];
  public mixer: THREE.AnimationMixer;
  public animations: any[];

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

  public defaultVelocitySimulatorDamping = 0.8;
  public defaultVelocitySimulatorMass = 50;
  public velocitySimulator: VectorSpringSimulator;
  public moveSpeed = 4;
  public angularVelocity = 0;
  public orientation: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
  public orientationTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
  public defaultRotationSimulatorDamping = 0.5;
  public defaultRotationSimulatorMass = 10;
  public rotationSimulator: RelativeSpringSimulator;
  public viewVector: THREE.Vector3;
  public actions: { [action: string]: KeyBinding };
  public characterCapsule: CapsuleCollider;

  // Ray casting
  public rayResult: CANNON.RaycastResult = new CANNON.RaycastResult();
  public rayHasHit = false;
  public rayCastLength = 0.57;
  public raySafeOffset = 0.03;
  public wantsToJump = false;
  public initJumpSpeed = -1;
  public groundImpactData: GroundImpactData = new GroundImpactData();
  public raycastBox: THREE.Mesh;

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
    this.characterControls = new CharacterControls(this);
    this.characterPhysics = new CharacterPhysics(this);
    this.weaponInteraction = new WeaponInteraction(this);
    this.setAnimations(gltf.animations);

    // The visuals group is centered for easy character tilting
    this.tiltContainer = new THREE.Group();
    this.add(this.tiltContainer);

    // Model container is used to reliably ground the character, as animation can alter the position of the model itself
    this.modelContainer = new THREE.Group();
    this.modelContainer.position.y = -0.57;
    this.tiltContainer.add(this.modelContainer);
    this.modelContainer.add(gltf.scene);

    this.mixer = new THREE.AnimationMixer(gltf.scene);

    this.velocitySimulator = new VectorSpringSimulator(60, this.defaultVelocitySimulatorMass, this.defaultVelocitySimulatorDamping);
    this.rotationSimulator = new RelativeSpringSimulator(60, this.defaultRotationSimulatorMass, this.defaultRotationSimulatorDamping);

    this.viewVector = new THREE.Vector3();

    // Actions
    this.actions = this.characterControls.initActions();

    // Physics
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
    this.raycastBox = new THREE.Mesh(boxGeo, boxMat);
    this.raycastBox.visible = false;

    // Physics pre/post step callback bindings
    this.characterCapsule.body.preStep = (body: CANNON.Body) => {
      this.physicsPreStep(body, this);
    };
    this.characterCapsule.body.postStep = (body: CANNON.Body) => {
      this.physicsPostStep(body, this);
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
  // Character animation
  public setAnimations(animations: []): void {
    this.animations = animations;
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
    if (this.characterPhysics.physicsEnabled) {
      this.characterCapsule.body.previousPosition = new CANNON.Vec3(x, y, z);
      this.characterCapsule.body.position = new CANNON.Vec3(x, y, z);
      this.characterCapsule.body.interpolatedPosition = new CANNON.Vec3(x, y, z);
    } else {
      this.position.x = x;
      this.position.y = y;
      this.position.z = z;
    }
  }

  public resetVelocity(): void {
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.z = 0;

    this.characterCapsule.body.velocity.x = 0;
    this.characterCapsule.body.velocity.y = 0;
    this.characterCapsule.body.velocity.z = 0;

    this.velocitySimulator.init();
  }

  public setArcadeVelocityTarget(velZ: number, velX: number = 0, velY: number = 0): void {
    this.velocityTarget.z = velZ;
    this.velocityTarget.x = velX;
    this.velocityTarget.y = velY;
  }

  public setOrientation(vector: THREE.Vector3, instantly: boolean = false): void {
    const lookVector = new THREE.Vector3().copy(vector).setY(0).normalize();
    this.orientationTarget.copy(lookVector);

    if (instantly) {
      this.orientation.copy(lookVector);
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
    this.characterPhysics.setPhysicsEnabled(value);
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
    this.characterControls.handleKeyboardEvent(event, code, pressed);
  }

  public handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void {
    this.characterControls.handleMouseButton(event, code, pressed);
  }

  public handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void {
   this.characterControls.handleMouseMove(event, deltaX, deltaY);
  }

  public handleMouseWheel(event: WheelEvent, value: number): void {
   this.characterControls.handleMouseWheel(event, value);
  }

  public triggerAction(actionName: string, value: boolean): void {
    this.characterControls.triggerAction(actionName, value);
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
    if (this.characterPhysics.physicsEnabled) { this.springMovement(timeStep); }
    if (this.characterPhysics.physicsEnabled) { this.springRotation(timeStep); }
    if (this.characterPhysics.physicsEnabled) { this.rotateModel(); }
    if (this.mixer !== undefined) { this.mixer.update(timeStep); }

    // Sync physics/graphics
    if (this.characterPhysics.physicsEnabled) {
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
    this.characterControls.inputReceiverInit();
  }

  public displayControls(): void {
    this.characterControls.displayControls();
  }

  public resetControls(): void {
    this.characterControls.resetControls();
  }

  public inputReceiverUpdate(timeStep: number): void {
    this.characterControls.inputReceiverUpdate(timeStep);
  }
  // Character animation
  public setAnimation(clipName: string, fadeIn: number, runOnlyOnce?: boolean, lockWhenFinished?: boolean): number {
    if (this.mixer !== undefined) {
      // gltf
      this.clip = THREE.AnimationClip.findByName(this.animations, clipName);

      const action = this.mixer.clipAction(this.clip);
      if (action === null) {
        console.error(`Animation ${clipName} not found!`);
        return 0;
      }
      if (runOnlyOnce) {
        action.setLoop(THREE.LoopOnce, 1);
      }
      if (lockWhenFinished) {
        action.clampWhenFinished = true;
      }
      this.mixer.stopAllAction();
      action.fadeIn(fadeIn);
      action.play();
      return action.getClip().duration;
    }
  }
  // Character animation
  public updateAimAnimation(clipName: string, cameraRotation, vector): void {
    if (this.mixer !== undefined) {
      this.clip = THREE.AnimationClip.findByName(this.animations, clipName);
      const action = this.mixer.clipAction(this.clip);
      // pitch UP max: 2 - pitch DOWN min: 0
      action.time = (cameraRotation.getWorldDirection(vector).y + this.aimingSettings.offSet) / this.aimingSettings.amplitude;
      action.paused = true;
      action.stopWarping();
      /*action.zeroSlopeAtStart = true;
      action.zeroSlopeAtEnd = true;
      action.time = (cameraRotation.getWorldDirection(vector).y + this.aimingSettings.offSet) / this.aimingSettings.amplitude;*/
    }
  }

  public springMovement(timeStep: number): void {
    // Simulator
    this.velocitySimulator.target.copy(this.velocityTarget);
    this.velocitySimulator.simulate(timeStep);

    // Update values
    this.velocity.copy(this.velocitySimulator.position);
    this.acceleration.copy(this.velocitySimulator.velocity);
  }

  public springRotation(timeStep: number): void {
    // Spring rotation
    // Figure out angle between current and target orientation
    const angle = Utils.getSignedAngleBetweenVectors(this.orientation, this.orientationTarget);

    // Simulator
    this.rotationSimulator.target = angle;
    this.rotationSimulator.simulate(timeStep);
    const rot = this.rotationSimulator.position;

    // Updating values
    this.orientation.applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
    this.angularVelocity = this.rotationSimulator.velocity;
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
        this.setOrientation(this.orientation);
      } else {
        this.setOrientation(moveVector);
      }
    }
  }

  public rotateModel(): void {
    this.lookAt(this.position.x + this.orientation.x, this.position.y + this.orientation.y, this.position.z + this.orientation.z);
    this.tiltContainer.rotation.z = (-this.angularVelocity * 2.3 * this.velocity.length());
    this.tiltContainer.position.setY((Math.cos(Math.abs(this.angularVelocity * 2.3 * this.velocity.length())) / 2) - 0.5);
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
    this.characterControls.transferControls(entity);
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

  public physicsPreStep(body: CANNON.Body, character: Character): void {
    this.characterPhysics.physicsPreStep(body, character);
  }

  public feetRaycast(): void {
    this.characterPhysics.feetRaycast();
  }

  public physicsPostStep(body: CANNON.Body, character: Character): void {
    this.characterPhysics.physicsPostStep(body, character);
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
      world.graphicsWorld.add(this.raycastBox);

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
      world.graphicsWorld.remove(this.raycastBox);
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

