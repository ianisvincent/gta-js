import
{
	CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { VehicleSeat } from 'src/app/vehicles/VehicleSeat';
import { CloseVehicleDoorInside } from './CloseVehicleDoorInside';
import { SeatType } from '../../../enums/SeatType';
import { SwitchingSeats } from './SwitchingSeats';
import { CharacterAnimation } from '../../../enums/CharacterAnimation';

export class Sitting extends CharacterStateBase
{
	private seat: VehicleSeat;

	constructor(character: Character, seat: VehicleSeat)
	{
		super(character);

		this.seat = seat;
		this.canFindVehiclesToEnter = false;

		this.character.world.updateControls([
			{
				keys: ['X'],
				desc: 'Switch seats',
			},
			{
				keys: ['F'],
				desc: 'Leave seat',
			}
		]);

		this.playAnimation(CharacterAnimation.Sitting, 0.1);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		if (!this.seat.door?.achievingTargetRotation && this.seat.door?.rotation > 0 && this.noDirection())
		{
			this.character.setState(new CloseVehicleDoorInside(this.character, this.seat));
		}
		else if (this.character.vehicleInteractionManager.vehicleEntryInstance !== null)
		{
			if (this.character.vehicleInteractionManager.vehicleEntryInstance.wantsToDrive)
			{
				for (const possibleDriverSeat of this.seat.connectedSeats)
				{
					if (possibleDriverSeat.type === SeatType.Driver)
					{
						if (this.seat.door?.rotation > 0) this.seat.door.physicsEnabled = true;
						this.character.setState(new SwitchingSeats(this.character, this.seat, possibleDriverSeat));
						break;
					}
				}
			}
			else
			{
				this.character.vehicleInteractionManager.vehicleEntryInstance = null;
			}
		}
	}

	public onInputChange(): void
	{
		if (this.character.actions.seat_switch.justPressed && this.seat.connectedSeats.length > 0)
		{
			this.character.setState(new SwitchingSeats(this.character, this.seat, this.seat.connectedSeats[0]));
		}

		if (this.character.actions.enter.justPressed)
		{
			this.character.exitVehicle();
			console.log('exitting vehicle');
			this.character.world.initDefaultControls();
		}
	}
}
