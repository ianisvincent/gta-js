import { Character } from './Character';
import { VehicleSeat } from '../vehicles/VehicleSeat';
import * as THREE from 'three';
import { Vehicle } from '../vehicles/Vehicle';
import { Driving } from './character_states/vehicles/Driving';
import { IControllable } from '../interfaces/IControllable';
import { EntityType } from '../enums/EntityType';
import { ExitingAirplane } from './character_states/vehicles/ExitingAirplane';
import { ExitingVehicle } from './character_states/vehicles/ExitingVehicle';
import { ClosestObjectFinder } from '../core/ClosestObjectFinder';
import { VehicleEntryInstance } from './VehicleEntryInstance';
import { SeatType } from '../enums/SeatType';
import { Object3D } from 'three';
import { OpenVehicleDoor } from './character_states/vehicles/OpenVehicleDoor';
import { EnteringVehicle } from './character_states/vehicles/EnteringVehicle';

export class VehicleInteraction {
    private readonly character: Character;

    constructor(character: Character) {
        this.character = character;
    }

    public findVehicleToEnter(wantsToDrive: boolean): void {
        // reusable world position variable
        const worldPos = new THREE.Vector3();

        // Find best vehicle
        const vehicleFinder = new ClosestObjectFinder<Vehicle>(this.character.position, 10);
        this.character.world.vehicles.forEach((vehicle) => {
            vehicleFinder.consider(vehicle, vehicle.position);
        });

        if (vehicleFinder.closestObject !== undefined) {
            const vehicle = vehicleFinder.closestObject;
            const vehicleEntryInstance = new VehicleEntryInstance(this.character);
            vehicleEntryInstance.wantsToDrive = wantsToDrive;

            // Find best seat
            const seatFinder = new ClosestObjectFinder<VehicleSeat>(this.character.position);
            for (const seat of vehicle.seats) {
                if (wantsToDrive) {
                    // Consider driver seats
                    if (seat.type === SeatType.Driver) {
                        seat.seatPointObject.getWorldPosition(worldPos);
                        seatFinder.consider(seat, worldPos);
                    }
                    // Consider passenger seats connected to driver seats
                    else if (seat.type === SeatType.Passenger) {
                        for (const connSeat of seat.connectedSeats) {
                            if (connSeat.type === SeatType.Driver) {
                                seat.seatPointObject.getWorldPosition(worldPos);
                                seatFinder.consider(seat, worldPos);
                                break;
                            }
                        }
                    }
                } else {
                    // Consider passenger seats
                    if (seat.type === SeatType.Passenger) {
                        seat.seatPointObject.getWorldPosition(worldPos);
                        seatFinder.consider(seat, worldPos);
                    }
                }
            }

            if (seatFinder.closestObject !== undefined) {
                const targetSeat = seatFinder.closestObject;
                vehicleEntryInstance.targetSeat = targetSeat;

                const entryPointFinder = new ClosestObjectFinder<Object3D>(this.character.position);

                for (const point of targetSeat.entryPoints) {
                    point.getWorldPosition(worldPos);
                    entryPointFinder.consider(point, worldPos);
                }

                if (entryPointFinder.closestObject !== undefined) {
                    vehicleEntryInstance.entryPoint = entryPointFinder.closestObject;
                    this.character.triggerAction('up', true);
                    this.character.vehicleEntryInstance = vehicleEntryInstance;
                }
            }
        }
    }

    public enterVehicle(seat: VehicleSeat, entryPoint: THREE.Object3D): void {
        this.character.resetControls();

        if (seat.door?.rotation < 0.5) {
            this.character.setState(new OpenVehicleDoor(this.character, seat, entryPoint));
        } else {
            this.character.setState(new EnteringVehicle(this.character, seat, entryPoint));
        }
    }

    public teleportToVehicle(vehicle: Vehicle, seat: VehicleSeat): void {
        this.character.resetVelocity();
        this.character.rotateModel();
        this.character.setPhysicsEnabled(false);
        (vehicle as unknown as THREE.Object3D).attach(this.character);

        this.character.setPosition(seat.seatPointObject.position.x, seat.seatPointObject.position.y + 0.6, seat.seatPointObject.position.z);
        this.character.quaternion.copy(seat.seatPointObject.quaternion);

        this.occupySeat(seat);
        this.character.setState(new Driving(this.character, seat));

        this.startControllingVehicle(vehicle, seat);
    }

    public startControllingVehicle(vehicle: IControllable, seat: VehicleSeat): void {
        if (this.character.controlledObject !== vehicle) {
            this.character.transferControls(vehicle);
            this.character.resetControls();

            this.character.controlledObject = vehicle;
            this.character.controlledObject.allowSleep(false);
            vehicle.inputReceiverInit();

            vehicle.controllingCharacter = this.character;
        }
    }

    public stopControllingVehicle(): void {
        if (this.character.controlledObject?.controllingCharacter === this.character) {
            this.character.controlledObject.allowSleep(true);
            this.character.controlledObject.controllingCharacter = undefined;
            this.character.controlledObject.resetControls();
            this.character.controlledObject = undefined;
            this.character.inputReceiverInit();
        }
    }

    public exitVehicle(): void {
        if (this.character.occupyingSeat !== null) {
            if (this.character.occupyingSeat.vehicle.entityType === EntityType.Airplane) {
                this.character.setState(new ExitingAirplane(this.character, this.character.occupyingSeat));
            } else {
                this.character.setState(new ExitingVehicle(this.character, this.character.occupyingSeat));
            }

            this.stopControllingVehicle();
        }
    }

    public occupySeat(seat: VehicleSeat): void {
        this.character.world.cameraOperator.drivingMode = true;
        this.character.occupyingSeat = seat;
        seat.occupiedBy = this.character;
    }

    public leaveSeat(): void {
        if (this.character.occupyingSeat !== null) {
            this.character.occupyingSeat.occupiedBy = null;
            this.character.occupyingSeat = null;
            this.character.world.cameraOperator.drivingMode = false;
        }
    }
}
