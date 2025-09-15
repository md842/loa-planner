import {RosterStorageTable} from '../../components/planner/tables/RosterStorageTable';

export function RosterStorageView(){
	return(
    <main>
      <RosterStorageTable friendlyName="Fusion Materials" mat="fusions"/>
      <RosterStorageTable friendlyName="Reds/Blues" mat="reds" mat2="blues"/>
    </main>
	);
}