import { WeaponType } from '../../weapons/weapon-type';

export class WeaponSlot {
    containerSvgPath: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    type?: WeaponType;
    damage?: number;
    fireRate?: number;
    accuracy?: number;
    range?: number;
    image?: string;
    ammo?: number;
    totalAmmo?: number;
}
