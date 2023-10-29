import { Character } from './Character';
import * as Utils from '../core/FunctionLibrary';
import * as THREE from 'three';
import { VectorSpringSimulator } from '../physics/spring_simulation/VectorSpringSimulator';
import { RelativeSpringSimulator } from '../physics/spring_simulation/RelativeSpringSimulator';

export class CharacterSimulation {
    private readonly character: Character;
    public defaultVelocitySimulatorDamping = 0.8;
    public defaultVelocitySimulatorMass = 50;
    public defaultRotationSimulatorMass = 10;
    public defaultRotationSimulatorDamping = 0.5;
    public angularVelocity = 0;
    public velocitySimulator: VectorSpringSimulator;
    public orientation: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
    public orientationTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
    public rotationSimulator: RelativeSpringSimulator;

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
        this.character.velocityTarget.z = velZ;
        this.character.velocityTarget.x = velX;
        this.character.velocityTarget.y = velY;
    }

    public resetVelocity(): void {
        this.character.velocity.x = 0;
        this.character.velocity.y = 0;
        this.character.velocity.z = 0;

        this.character.characterCapsule.body.velocity.x = 0;
        this.character.characterCapsule.body.velocity.y = 0;
        this.character.characterCapsule.body.velocity.z = 0;

        this.velocitySimulator.init();
    }

    public springMovement(timeStep: number): void {
        // Simulator
        this.velocitySimulator.target.copy(this.character.velocityTarget);
        this.velocitySimulator.simulate(timeStep);

        // Update values
        this.character.velocity.copy(this.velocitySimulator.position);
        this.character.acceleration.copy(this.velocitySimulator.velocity);
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
