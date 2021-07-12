import * as THREE from 'three';

import { FollowTarget } from './FollowTarget';
import { ICharacterAI } from '../../interfaces/ICharacterAI';
import { PathNode } from '../../world/PathNode';

export class WalkOnPath extends FollowTarget implements ICharacterAI {
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
        this.character.getWorldPosition(source);
        this.target.getWorldPosition(target);
        let viewVector = new THREE.Vector3().subVectors(target, source);
        viewVector.y = 0;

        if (this.targetNode.nextNode) {
            let targetToNextNode = this.targetNode.nextNode.object.position.clone().sub(this.targetNode.object.position);
            targetToNextNode.y = 0;
            targetToNextNode.normalize();
            let slowDownAngle = viewVector.clone().normalize().dot(targetToNextNode);
            if ((slowDownAngle < 0.7 && viewVector.length() < 50)) {
                this.character.triggerAction('up', true);
            }
        }

        if (viewVector.length() < this.nodeRadius) {
            if (this.reverse) {
                super.setTarget(this.targetNode.previousNode.object);
                this.targetNode = this.targetNode.previousNode;
            } else {
                if (this.targetNode.nextNode) {
                    super.setTarget(this.targetNode.nextNode.object);
                    this.targetNode = this.targetNode.nextNode;
                }
            }
        }
    }
}
