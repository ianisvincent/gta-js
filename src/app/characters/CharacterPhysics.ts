import { Character } from './Character';
import { CollisionGroups } from '../enums/CollisionGroups';
import * as THREE from 'three';
import * as Utils from '../core/FunctionLibrary';
import * as CANNON from 'cannon';
import { GroundImpactData } from './GroundImpactData';

export class CharacterPhysics {
    private readonly character: Character;
    private rayCastLength = 0.57;
    private raySafeOffset = 0.03;
    isEnabled = true;
    public rayResult: CANNON.RaycastResult = new CANNON.RaycastResult();
    public rayHasHit = false;
    public groundImpactData: GroundImpactData = new GroundImpactData();
    public raycastBox: THREE.Mesh;

    constructor(character: Character) {
        this.character = character;
    }

    public setPhysicsEnabled(value: boolean): void {
        this.isEnabled = value;
        if (value === true) {
            this.character.world.physicsWorld.addBody(this.character.characterCapsule.body);
        } else {
            this.character.world.physicsWorld.remove(this.character.characterCapsule.body);
        }
    }

    public physicsPreStep(body: CANNON.Body, character: Character): void {
        character.feetRaycast();
        // Raycast debug
        if (this.rayHasHit) {
            if (this.raycastBox.visible) {
                this.raycastBox.position.x = this.rayResult.hitPointWorld.x;
                this.raycastBox.position.y = this.rayResult.hitPointWorld.y;
                this.raycastBox.position.z = this.rayResult.hitPointWorld.z;
            }
        } else {
            if (this.raycastBox.visible) {
                this.raycastBox.position.set(body.position.x, body.position.y - this.rayCastLength -
                    this.raySafeOffset, body.position.z);
            }
        }
    }

    public feetRaycast(): void {
        // Player ray casting
        // Create ray
        const body = this.character.characterCapsule.body;
        const start = new CANNON.Vec3(body.position.x, body.position.y, body.position.z);
        const end = new CANNON.Vec3(body.position.x, body.position.y -
            this.rayCastLength - this.raySafeOffset, body.position.z);
        // Raycast options
        const rayCastOptions = {
            collisionFilterMask: CollisionGroups.Default,
            skipBackfaces: true      /* ignore back faces */
        };
        // Cast the ray
        this.rayHasHit = this.character.world.physicsWorld.raycastClosest(start, end, rayCastOptions, this.rayResult);
    }

    public physicsPostStep(body: CANNON.Body, character: Character): void {
        // Get velocities
        const simulatedVelocity = new THREE.Vector3(body.velocity.x, body.velocity.y, body.velocity.z);
        // Take local velocity
        let arcadeVelocity = new THREE.Vector3().copy(character.velocity).multiplyScalar(character.moveSpeed);
        // Turn local into global
        arcadeVelocity = Utils.appplyVectorMatrixXZ(character.orientation, arcadeVelocity);

        let newVelocity = new THREE.Vector3();

        // Additive velocity mode
        if (character.arcadeVelocityIsAdditive) {
            newVelocity.copy(simulatedVelocity);

            const globalVelocityTarget = Utils.appplyVectorMatrixXZ(character.orientation, character.velocityTarget);
            const add = new THREE.Vector3().copy(arcadeVelocity).multiply(character.arcadeVelocityInfluence);

            if (Math.abs(simulatedVelocity.x) < Math.abs(globalVelocityTarget.x * character.moveSpeed)
                || Utils.haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)) {
                newVelocity.x += add.x;
            }
            if (Math.abs(simulatedVelocity.y) < Math.abs(globalVelocityTarget.y * character.moveSpeed)
                || Utils.haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)) {
                newVelocity.y += add.y;
            }
            if (Math.abs(simulatedVelocity.z) < Math.abs(globalVelocityTarget.z * character.moveSpeed)
                || Utils.haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)) {
                newVelocity.z += add.z;
            }
        } else {
            newVelocity = new THREE.Vector3(
                THREE.MathUtils.lerp(simulatedVelocity.x, arcadeVelocity.x, character.arcadeVelocityInfluence.x),
                THREE.MathUtils.lerp(simulatedVelocity.y, arcadeVelocity.y, character.arcadeVelocityInfluence.y),
                THREE.MathUtils.lerp(simulatedVelocity.z, arcadeVelocity.z, character.arcadeVelocityInfluence.z),
            );
        }
        // If we're hitting the ground, stick to ground
        if (this.rayHasHit) {
            // Flatten velocity
            newVelocity.y = 0;

            // Move on top of moving objects
            if (this.rayResult.body.mass > 0) {
                const pointVelocity = new CANNON.Vec3();
                this.rayResult.body.getVelocityAtWorldPoint(this.rayResult.hitPointWorld, pointVelocity);
                newVelocity.add(Utils.threeVector(pointVelocity));
            }

            // Measure the normal vector offset from direct "up" vector
            // and transform it into a matrix
            const up = new THREE.Vector3(0, 1, 0);
            const normal = new THREE.Vector3(this.rayResult.hitNormalWorld.x, this.rayResult.hitNormalWorld.y,
                this.rayResult.hitNormalWorld.z);
            const q = new THREE.Quaternion().setFromUnitVectors(up, normal);
            const m = new THREE.Matrix4().makeRotationFromQuaternion(q);

            // Rotate the velocity vector
            newVelocity.applyMatrix4(m);

            // Compensate for gravity
            // newVelocity.y -= body.world.physicsWorld.gravity.y / body.character.world.physicsFrameRate;

            // Apply velocity
            body.velocity.x = newVelocity.x;
            body.velocity.y = newVelocity.y;
            body.velocity.z = newVelocity.z;
            // Ground character
            body.position.y = this.rayResult.hitPointWorld.y +
                this.rayCastLength + (newVelocity.y / character.world.physicsFrameRate);
        } else {
            // If we're in air
            body.velocity.x = newVelocity.x;
            body.velocity.y = newVelocity.y;
            body.velocity.z = newVelocity.z;

            // Save last in-air information
            this.groundImpactData.velocity.x = body.velocity.x;
            this.groundImpactData.velocity.y = body.velocity.y;
            this.groundImpactData.velocity.z = body.velocity.z;
        }
        // Jumping
        if (character.wantsToJump) {
            // If initJumpSpeed is set
            if (character.initJumpSpeed > -1) {
                // Flatten velocity
                body.velocity.y = 0;
                const speed = Math.max(character.velocitySimulator.position.length() * 4, character.initJumpSpeed);
                body.velocity = Utils.cannonVector(character.orientation.clone().multiplyScalar(speed));
            } else {
                // Moving objects compensation
                const add = new CANNON.Vec3();
                this.rayResult.body.getVelocityAtWorldPoint(this.rayResult.hitPointWorld, add);
                body.velocity.vsub(add, body.velocity);
            }

            // Add positive vertical velocity
            body.velocity.y += 4;
            // Move above ground by 2x safe offset value
            body.position.y += this.raySafeOffset * 2;
            // Reset flag
            character.wantsToJump = false;
        }
    }

}
