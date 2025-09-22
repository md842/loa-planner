import {useState} from 'react';

import {RosterStorageCard} from '../../components/planner/RosterStorageCard';

import gold from '../../assets/gold.png';
import silver from '../../assets/silver.png';
import t4_blue from '../../assets/t4_blue.png';
import t4_blueSolar from '../../assets/t4_bluesolar.png';
import t4_fusion from '../../assets/t4_fusion.png';
import t4_leap from '../../assets/t4_leap.png';
import t4_red from '../../assets/t4_red.png';
import t4_redSolar from '../../assets/t4_redsolar.png';
import t4_shard from '../../assets/t4_shard.png';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

export function RosterStorageView(){
  const [dailyChests, setDailyChestQty] = useState([] as number[]);
  const [dailyChestSel, setDailyChestSel] = useState([] as boolean[]);

	return(
    <main>
      <Container fluid="md">
        <Row>
          <RosterStorageCard
            friendlyName="Silver"
            color="#999"
            image={silver}
            mat="silver"
          />
          <RosterStorageCard
            friendlyName="Gold"
            color="#FC4"
            image={gold}
            mat="gold"
          />
        </Row>
        <Row>
          <RosterStorageCard configurable
            friendlyName="Fusion Materials"
            color="#F90"
            image={t4_fusion}
            mat="fusions"
          />
          <RosterStorageCard configurable
            friendlyName="Shards"
            color="#E47"
            image={t4_shard}
            mat="shards"
            // Controlling table: controls daily chests in "leaps" table
            setDailyChestQty={(qty: number) => setDailyChestQty([qty])}
            dailyChestSel={dailyChestSel}
            setDailyChestSel={(controllingTable: boolean) => setDailyChestSel([controllingTable])}
          />
          <RosterStorageCard configurable
            friendlyName="Leapstones"
            color="#D36"
            image={t4_leap}
            mat="leaps"
            // Controlled table: daily chests controlled by "shards" table
            dailyChests={dailyChests}
            dailyChestSel={dailyChestSel}
            setDailyChestSel={(controllingTable: boolean) => setDailyChestSel([controllingTable])}
          />
        </Row>
        <Row>
          <RosterStorageCard configurable
            friendlyName="Red/Blue Stones"
            color="#F44"
            image={t4_red}
            mat="reds"
            color2="#27B"
            image2={t4_blue}
            mat2="blues"
          />
          <RosterStorageCard configurable
            friendlyName="Lava/Glacier Breaths"
            color="#F43"
            image={t4_redSolar}
            mat="redSolars"
            color2="#28C"
            image2={t4_blueSolar}
            mat2="blueSolars"
          />
        </Row>
      </Container>
    </main>
	);
}