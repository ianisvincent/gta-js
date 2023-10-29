import { Character } from './Character';
import { CollisionGroups } from '../enums/CollisionGroups';
import * as THREE from 'three';
import * as Utils from '../core/FunctionLibrary';
import * as CANNON from 'cannon';

export class CharacterPhysics {
    physicsEnabled = true;
    private readonly character: Character;

    constructor(character: Character) {
        this.character = character;
    }

    public setPhysicsEnabled(value: boolean): void {
        this.physicsEnabled = value;

        if (value === true) {
            this.character.world.physicsWorld.addBody(this.character.characterCapsule.body);
        } else {
            this.character.world.physicsWorld.remove(this.character.characterCapsule.body);
        }
    }


    public physicsPreStep(body: CANNON.Body, character: Character): void {
        character.feetRaycast();

        // Raycast debug
        if (character.rayHasHit) {
            if (character.raycastBox.visible) {
                character.raycastBox.position.x = character.rayResult.hitPointWorld.x;
                character.raycastBox.position.y = character.rayResult.hitPointWorld.y;
                character.raycastBox.position.z = character.rayResult.hitPointWorld.z;
            }
        } else {
            if (character.raycastBox.visible) {
                character.raycastBox.position.set(body.position.x, body.position.y - character.rayCastLength -
                    character.raySafeOffset, body.position.z);
            }
        }
    }

    public feetRaycast(): void {
        // Player ray casting
        // Create ray
        const body = this.character.characterCapsule.body;
        const start = new CANNON.Vec3(body.position.x, body.position.y, body.position.z);
        const end = new CANNON.Vec3(body.position.x, body.position.y -
            this.character.rayCastLength - this.character.raySafeOffset, body.position.z);
        // Raycast options
        const rayCastOptions = {
            collisionFilterMask: CollisionGroups.Default,
            skipBackfaces: true      /* ignore back faces */
        };
        // Cast the ray
        this.character.rayHasHit = this.character.world.physicsWorld.raycastClosest(start, end, rayCastOptions, this.character.rayResult);
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
        if (character.rayHasHit) {
            // Flatten velocity
            newVelocity.y = 0;

            // Move on top of moving objects
            if (character.rayResult.body.mass > 0) {
                const pointVelocity = new CANNON.Vec3();
                character.rayResult.body.getVelocityAtWorldPoint(character.rayResult.hitPointWorld, pointVelocity);
                newVelocity.add(Utils.threeVector(pointVelocity));
            }

            // Measure the normal vector offset from direct "up" vector
            // and transform it into a matrix
            const up = new THREE.Vector3(0, 1, 0);
            const normal = new THREE.Vector3(character.rayResult.hitNormalWorld.x, character.rayResult.hitNormalWorld.y,
                character.rayResult.hitNormalWorld.z);
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
            body.position.y = character.rayResult.hitPointWorld.y +
                character.rayCastLength + (newVelocity.y / character.world.physicsFrameRate);
        } else {
            // If we're in air
            body.velocity.x = newVelocity.x;
            body.velocity.y = newVelocity.y;
            body.velocity.z = newVelocity.z;

            // Save last in-air information
            character.groundImpactData.velocity.x = body.velocity.x;
            character.groundImpactData.velocity.y = body.velocity.y;
            character.groundImpactData.velocity.z = body.velocity.z;
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
                character.rayResult.body.getVelocityAtWorldPoint(character.rayResult.hitPointWorld, add);
                body.velocity.vsub(add, body.velocity);
            }

            // Add positive vertical velocity
            body.velocity.y += 4;
            // Move above ground by 2x safe offset value
            body.position.y += character.raySafeOffset * 2;
            // Reset flag
            character.wantsToJump = false;
        }
    }

}
