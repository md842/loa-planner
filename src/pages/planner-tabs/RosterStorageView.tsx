import {RosterStorageCard} from '../../components/planner/RosterStorageCard';

export function RosterStorageView(){
	return(
    <main>
      <RosterStorageCard
        friendlyName="Fusion Materials"
        color="#F90"
        mat="fusions"
      />
      <RosterStorageCard
        friendlyName="Shards"
        color="#E47"
        mat="shards"
      />
      <RosterStorageCard
        friendlyName="Leapstones"
        color="#D37"
        mat="leaps"
      />
      <RosterStorageCard
        friendlyName="Red/Blue Stones"
        color="#F44"
        mat="reds"
        color2="#27B"
        mat2="blues"
      />
      <RosterStorageCard
        friendlyName="Lava/Glacier Breaths"
        color="#F43"
        mat="redSolars"
        color2="#28C"
        mat2="blueSolars"
      />
    </main>
	);
}