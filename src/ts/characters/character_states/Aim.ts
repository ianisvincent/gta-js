import { CharacterStateBase } from "./CharacterStateBase";
import { ICharacterState } from "../../interfaces/ICharacterState";
import { Character } from "../Character";
import { Idle } from "./Idle";
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { BodyPart } from "../../enums/BodyPart";

export class Aim extends CharacterStateBase implements ICharacterState {
    public rayCaster: THREE.Raycaster;
    private intersectedObject: any;
    private dummySphereImpact: any;
    private shootingCount = 0;
    private readonly recoilForce = 0.008;

    constructor(character: Character) {
        super(character);
        this.rayCaster = new THREE.Raycaster();
        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 10;

        this.character.setArcadeVelocityTarget(0);
        this.playAnimation('aim_pistol_idle', 0.1, true);
    }

    public update(timeStep: number): void {
        super.update(timeStep);
        this.fallInAir();
        this.spawnObjectOnPoint();
        if (this.character.cameraOperator) {
            this.rayCaster.setFromCamera(new THREE.Vector2(0.05, 0), this.character.cameraOperator.camera)
            const intersects = this.rayCaster.intersectObjects(this.character.world.graphicsWorld.children, true);
            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object.type !== 'LineSegments' && this.dummySphereImpact) {
                    this.intersectedObject = intersects[0];
                }
            }
            // If this character stop aiming, go back to idle state
            if (this.animationEnded(timeStep)) {
                this.character.setState(new Idle(this.character))
            }

            if (this.character.actions.shoot.isPressed) {
                console.log(this.shootingCount);
                this.shootingCount += 1;
                if (this.shootingCount === 1) {
                    console.log('shoitt!');
                    this.spawnImpactOnPoint(this.intersectedObject);
                    this.setGunRecoilToForeArms();
                }
            }

        }
    }

    public setGunRecoilToForeArms(): void {
        const rightForeArm = this.character.getObjectByName(BodyPart.RightForeArm);
        const leftForeArm = this.character.getObjectByName(BodyPart.LeftForeArm);
        leftForeArm.rotation.y -= this.recoilForce;
        rightForeArm.rotation.y += this.recoilForce;
        rightForeArm.rotation.z -= this.recoilForce;
    }


    public restoreInitialForeArmsPosition(): void {
        const rightForeArm = this.character.getObjectByName(BodyPart.RightForeArm);
        const leftForeArm = this.character.getObjectByName(BodyPart.LeftForeArm);
        leftForeArm.rotation.y += this.recoilForce;
        rightForeArm.rotation.y -= this.recoilForce;
        rightForeArm.rotation.z += this.recoilForce;
    }

    public onInputChange(): void {
        super.onInputChange();

        if (this.character.actions.aim.justReleased) {
            this.character.setState(new Idle(this.character))
        }

        if (this.character.actions.shoot.justReleased) {
            this.shootingCount = 0;
            this.restoreInitialForeArmsPosition();
        }
    }

    private makeObjectInvisible(): void {
        this.intersectedObject.object.visible = false;
    }

    private spawnObjectOnPoint() {
        const loader = new GLTFLoader();
        loader.load('../build/assets/impact_spawn.glb', (gltf) => {
            gltf.scene.name = 'impact';
            gltf.scene.scale.set(0.08, 0.08, 0.08);
            this.dummySphereImpact = gltf.scene;
            this.character.world.graphicsWorld.add(gltf.scene);

        }, undefined, function (error) {
            console.error(error);
        });
    }

    spawnImpactOnPoint(intersected): void {
        console.log(intersected.object.name);
        this.dummySphereImpact.position.copy(intersected.point);
    }
}
