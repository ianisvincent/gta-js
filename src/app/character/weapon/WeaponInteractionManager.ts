import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Character } from '../Character';
import { WeaponType } from '../../weapons/weapon-type';
import { BodyPart } from '../../enums/BodyPart';

export class WeaponInteractionManager {
    private readonly character: Character;

    constructor(character: Character) {
        this.character = character;
    }

    public loadWeapon(weaponType: WeaponType): void {
        const loader = new GLTFLoader();
        const rightHand = this.character.getObjectByName(BodyPart.RightHand);
        loader.load(`../../assets/weapons/${weaponType}.glb`, gltf => {
            gltf.scene.name = weaponType;
            gltf.scene.scale.set(2, 2, 2);
            gltf.scene.rotation.set(1.62, 0.1, 5.05);
            gltf.scene.position.set(0, 13.7, 2.59);
            rightHand.add(gltf.scene);
            /*const gui = new GUI.GUI();
            const gunGUIFolder = gui.addFolder('Gun');
            gunGUIFolder.add(gltf.scene.rotation, 'x', 0, Math.PI * 2, 0.01);
            gunGUIFolder.add(gltf.scene.rotation, 'y', 0, Math.PI * 2, 0.01);
            gunGUIFolder.add(gltf.scene.rotation, 'z', 0, Math.PI * 2, 0.01);

            gunGUIFolder.add(gltf.scene.position, 'x', 0, 100, 0.01);
            gunGUIFolder.add(gltf.scene.position, 'y', 0, 100, 0.01);
            gunGUIFolder.add(gltf.scene.position, 'z', 0, 100, 0.01);*/
        }, undefined, error => {
            console.error(error);
        });
        this.character.hasWeaponLoaded = true;
    }

    public unloadWeapon(): void {
        const rightHand = this.character.getObjectByName(BodyPart.RightHand);
        const gun = this.character.getObjectByName('gun');
        rightHand.remove(gun);
        this.character.hasWeaponLoaded = false;
    }

    lockAiming(character: Character): void {
        this.character.world.cameraOperator.aimingMode = true;
        this.character.world.cameraOperator.targetedCharacter = character;
    }

    unlockAiming(): void {
        this.character.world.cameraOperator.aimingMode = false;
    }

    public setRightHand(): void {
        this.character.children.forEach(children => {
            this.character.rightHand = children.getObjectByName(BodyPart.RightHand);
        });
    }
}
