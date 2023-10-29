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

    constructor(character: Character) {
        this.character = character;
    }

    public initSpringSimulators(): void {
        this.character.velocitySimulator = new VectorSpringSimulator(60, this.defaultVelocitySimulatorMass,
            this.defaultVelocitySimulatorDamping);
        this.character.rotationSimulator = new RelativeSpringSimulator(60, this.defaultRotationSimulatorMass,
            this.defaultRotationSimulatorDamping);
    }

    public resetVelocity(): void {
        this.character.velocity.x = 0;
        this.character.velocity.y = 0;
        this.character.velocity.z = 0;

        this.character.characterCapsule.body.velocity.x = 0;
        this.character.characterCapsule.body.velocity.y = 0;
        this.character.characterCapsule.body.velocity.z = 0;

        this.character.velocitySimulator.init();
    }

    public springMovement(timeStep: number): void {
        // Simulator
        this.character.velocitySimulator.target.copy(this.character.velocityTarget);
        this.character.velocitySimulator.simulate(timeStep);

        // Update values
        this.character.velocity.copy(this.character.velocitySimulator.position);
        this.character.acceleration.copy(this.character.velocitySimulator.velocity);
    }

    public springRotation(timeStep: number): void {
        // Spring rotation
        // Figure out angle between current and target orientation
        const angle = Utils.getSignedAngleBetweenVectors(this.character.orientation, this.character.orientationTarget);

        // Simulator
        this.character.rotationSimulator.target = angle;
        this.character.rotationSimulator.simulate(timeStep);
        const rot = this.character.rotationSimulator.position;

        // Updating values
        this.character.orientation.applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
        this.angularVelocity = this.character.rotationSimulator.velocity;
    }
}
