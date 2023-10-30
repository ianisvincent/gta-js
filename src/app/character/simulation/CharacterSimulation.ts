import * as THREE from 'three';
import { VectorSpringSimulator } from '../../physics/spring_simulation/VectorSpringSimulator';
import { Character } from '../Character';
import { RelativeSpringSimulator } from '../../physics/spring_simulation/RelativeSpringSimulator';
import * as Utils from '../../core/FunctionLibrary';

export class CharacterSimulation {
    private readonly character: Character;
    private acceleration: THREE.Vector3 = new THREE.Vector3();
    public defaultVelocitySimulatorDamping = 0.8;
    public defaultVelocitySimulatorMass = 50;
    public defaultRotationSimulatorMass = 10;
    public defaultRotationSimulatorDamping = 0.5;
    public angularVelocity = 0;
    public velocitySimulator: VectorSpringSimulator;
    public orientation: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
    public orientationTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
    public rotationSimulator: RelativeSpringSimulator;
    public velocityTarget: THREE.Vector3 = new THREE.Vector3();
    public velocity: THREE.Vector3 = new THREE.Vector3();

    constructor(character: Character) {
        this.character = character;
    }

    public initSpringSimulators(): void {
        this.velocitySimulator = new VectorSpringSimulator(60, this.defaultVelocitySimulatorMass,
            this.defaultVelocitySimulatorDamping);
        this.rotationSimulator = new RelativeSpringSimulator(60, this.defaultRotationSimulatorMass,
            this.defaultRotationSimulatorDamping);
    }

    public setArcadeVelocityTarget(velZ: number, velX: number = 0, velY: number = 0): void {
        this.velocityTarget.z = velZ;
        this.velocityTarget.x = velX;
        this.velocityTarget.y = velY;
    }

    public resetVelocity(): void {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.velocity.z = 0;

        this.character.characterCapsule.body.velocity.x = 0;
        this.character.characterCapsule.body.velocity.y = 0;
        this.character.characterCapsule.body.velocity.z = 0;

        this.velocitySimulator.init();
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
}