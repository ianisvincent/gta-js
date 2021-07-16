import * as THREE from 'three';
import { ICharacterAI } from '../../interfaces/ICharacterAI';
import { PathNode } from '../../world/PathNode';
import { WalkFollowTarget } from "./WalkFollowTarget";

export class WalkOnPath extends WalkFollowTarget implements ICharacterAI {
    public nodeRadius: number;
    public reverse: boolean = false;
    private targetNode: PathNode;

    constructor(firstNode: PathNode, nodeRadius: number) {
        super(firstNode.object, 0);
        this.nodeRadius = nodeRadius;
        this.targetNode = firstNode;
    }

    public update(timeStep: number): void {
        super.update(timeStep);

        // Todo only compute once in followTarget
        let source = new THREE.Vector3();
        let target = new THREE.Vector3();
        this.character.getWorldPosition(source); // We get the world position of the character
        this.target.getWorldPosition(target); // We get the world position of the target - the first node object at first
        let viewVector = new THREE.Vector3().subVectors(target, source); // Distance between character and target


        let targetToNextNode = this.targetNode.nextNode.object.position.clone().sub(this.targetNode.object.position);
        targetToNextNode.normalize();
        let slowDownAngle = viewVector.clone().normalize().dot(targetToNextNode);
        let speed = this.character.velocity.length();

        if ((slowDownAngle < 0.7 && viewVector.length() < 50 && speed > 10)) {
            this.character.triggerAction('down', true);
        }
        if (viewVector.length() < this.nodeRadius) {
			if (this.reverse)
			{
				super.setTarget(this.targetNode.previousNode.object);
				this.targetNode = this.targetNode.previousNode;
			}
			else
			{
				super.setTarget(this.targetNode.nextNode.object);
				this.targetNode = this.targetNode.nextNode;
			}
		}
    }
}
