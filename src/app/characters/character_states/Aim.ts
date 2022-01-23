import { CharacterStateBase } from "./_stateLibrary";
import { ICharacterState } from "../../interfaces/ICharacterState";
import { Character } from "../Character";
import { Idle } from "./Idle";
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { BodyPart } from "../../enums/BodyPart";
import { Impact } from "../../enums/impact";
import { AimWalkForward } from "./AimWalkForward";
import { AimWalkBackward } from "./AimWalkBackward";
import { AimWalkLeft } from "./AimWalkLeft";
import { AimWalkRight } from "./AimWalkRight";
import { Npc } from "../Npc";
import * as TWEEN from "@tweenjs/tween.js";

export class Aim extends CharacterStateBase implements ICharacterState {
    public rayCaster: THREE.Raycaster;
    private intersectedObject: any;
    private dummySphereImpact: any;
    private shootingCount = 0;
    public tween: TWEEN.Tween<any>;

    constructor(character: Character) {
        super(character);

        this.rayCaster = new THREE.Raycaster();

        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 10;
        this.character.isAiming = true;
        this.character.setArcadeVelocityTarget(0);
        this.playAnimation('aim_pistol_idle', 0.1, true, true);
        this.spawnObjectOnPoint();
    }

    public update(timeStep: number): void {
        super.update(timeStep);
        this.fallInAir();
        this.onDie();
        if (this.character.cameraOperator) {
            const array = this.character.world.graphicsWorld.children.filter((children) => children.name !== 'cameraHelper');
            this.rayCaster.setFromCamera(new THREE.Vector2(0, 0), this.character.cameraOperator.camera)
            const intersects = this.rayCaster.intersectObjects(array, true);
            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object.type !== 'LineSegments' && this.dummySphereImpact) {
                    this.intersectedObject = intersects[0];
                }
            }
            // If this character stop aiming, go back to idle state
         /*   if (this.animationEnded(timeStep)) {
                this.character.setState(new Idle(this.character))
            }*/

            if (this.character.actions.shoot.isPressed) {
                this.shootingCount += 1;
                if (this.shootingCount === 1) {
                    this.spawnImpactOnTarget(this.intersectedObject);
                    //this.setGunRecoilToForeArms();
                    this.playAnimation('shoot', 0.1, true, true);
                }
            }

            if (this.character.actions.up.isPressed) {
                this.character.setState(new AimWalkForward(this.character))
            }
            if (this.character.actions.down.isPressed) {
                this.character.setState(new AimWalkBackward(this.character))
            }
            if (this.character.actions.left.isPressed) {
                this.character.setState(new AimWalkLeft(this.character))
            }
            if (this.character.actions.right.isPressed) {
                this.character.setState(new AimWalkRight(this.character))
            }
        }
    TWEEN.update();
    }

    public setGunRecoilToForeArms(): void {
        const rightForeArm = this.character.getObjectByName(BodyPart.RightForeArm)
        const gun = rightForeArm.getObjectByName('gun');

        const coords = {x: gun.rotation.x, y: gun.rotation.y, z: gun.rotation.z}
        const tween = new TWEEN.Tween(coords)
            .to({x: gun.rotation.x, y: gun.rotation.y - 0.08, z: gun.rotation.z}, 50)
            .easing(TWEEN.Easing.Elastic.Out)

            .onUpdate(() => {
                gun.rotation.set(coords.x, coords.y, coords.z)
            })

        const tween2 = new TWEEN.Tween(coords)
            .to({x: gun.rotation.x, y: gun.rotation.y, z: gun.rotation.z}, 50)
            .easing(TWEEN.Easing.Quartic.Out)

            .onUpdate(() => {
                gun.rotation.set(coords.x, coords.y, coords.z)
            })

        tween.chain((tween2));
        tween.start();
    }

    public onInputChange(): void {
        super.onInputChange();

        if (this.character.actions.aim.justReleased) {
            this.character.setState(new Idle(this.character))
        }

        if (this.character.actions.shoot.justReleased) {
            this.shootingCount = 0;
        }
    }

    private makeObjectInvisible(): void {
        this.intersectedObject.object.visible = false;
    }

    private spawnObjectOnPoint() {
        const loader = new GLTFLoader();
        loader.load('../../assets/impact_spawn.glb', (gltf) => {
            gltf.scene.name = Impact.Bullet;
            gltf.scene.scale.set(0.05, 0.05, 0.05);
            this.dummySphereImpact = gltf.scene;
            this.character.world.graphicsWorld.add(gltf.scene);

        }, undefined, function (error) {
            console.error(error);
        });
    }

    spawnImpactOnTarget(intersectedTarget): void {
        if (intersectedTarget.object.parent instanceof Npc) {
            intersectedTarget.object.attach(this.dummySphereImpact);
            /* We convert the intersect point from world to local pos */
            const impactLocalPos = intersectedTarget.object.worldToLocal(intersectedTarget.point);
            /* So we can then apply the dummy sphere position locally inside intersected object */
            this.dummySphereImpact.position.set(impactLocalPos.x, impactLocalPos.y, impactLocalPos.z);

            intersectedTarget.object.parent.isGettingShot = true;

            const characterNpc = intersectedTarget.object.parent as Npc;
            characterNpc.takeDamage(50);
        }
    }
}
