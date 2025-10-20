import {useState} from 'react';

import {MarketDataTable} from './tables/MarketDataTable';
import {PlannerTutorialModal} from '../tutorials/PlannerTutorial';

import t4_blue from '../../assets/t4_blue.png';
import t4_blueSolar from '../../assets/t4_bluesolar.png';
import t4_fusion from '../../assets/t4_fusion.png';
import t4_leap from '../../assets/t4_leap.png';
import t4_red from '../../assets/t4_red.png';
import t4_redSolar from '../../assets/t4_redsolar.png';
import t4_shard from '../../assets/t4_shard.png';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

export function MarketDataView(){
  const [modalVis, setModalVis] = useState(false); // PlannerTutorialModal visibility

	return(
    <>
      <PlannerTutorialModal defaultActiveKey="3" modalVis={modalVis} setModalVis={setModalVis}/>
      <Container fluid>
        <MarketDataTable
          title="Fusion Materials"
          color="#F90"
          image={t4_fusion}
          mat="fusions"
        />
        <MarketDataTable
          title="Shards"
          color="#E47"
          image={t4_shard}
          mat="shards"
        />
        <MarketDataTable
          title="Leapstones"
          color="#D36"
          image={t4_leap}
          mat="leaps"
        />
        <MarketDataTable
          title="Destruction Stones"
          color="#F44"
          image={t4_red}
          mat="reds"
        />
        <MarketDataTable
          title="Guardian Stones"
          color="#27B"
          image={t4_blue}
          mat="blues"
        />
        <MarketDataTable
          title="Lava's Breaths"
          color="#F43"
          image={t4_redSolar}
          mat="redSolars"
        />
        <MarketDataTable
          title="Glacier's Breaths"
          color="#28C"
          image={t4_blueSolar}
          mat="blueSolars"
        />
        <Button className="d-block mt-3 mx-auto" variant="primary" onClick={() => setModalVis(true)}>
          Show Help
        </Button>
      </Container>
    </>
	);
}