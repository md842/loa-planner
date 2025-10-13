import {createContext, useState} from 'react';

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

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

interface SyncState{
  dailyChestQty: number[];
  setDailyChestQty: (qty: number) => void;
  dailyChestUse: number[];
  setDailyChestUse: (use: number[]) => void;
}

export const SyncContext = createContext({} as SyncState);

export function RosterStorageView(){
  const [dailyChestQty, setDailyChestQty] = useState([] as number[]);
  const [dailyChestUse, setDailyChestUse] = useState([] as number[]);

	return(
    <main>
      <Container fluid="md">
        <Row>
          <Col className="d-flex flex-column">
            <RosterStorageCard
              title="Silver"
              color="#999"
              image={silver}
              mat="silver"
            />
            <RosterStorageCard
              title="Gold"
              color="#FC4"
              image={gold}
              mat="gold"
            />
          </Col>
          <Col>
            <RosterStorageCard configurable
              title="Fusion Materials"
              color="#F90"
              image={t4_fusion}
              mat="fusions"
            />
          </Col>
        </Row>
        <Row>
          <SyncContext value={
            {
              dailyChestQty: dailyChestQty,
              setDailyChestQty: (qty: number) => setDailyChestQty([qty]),
              dailyChestUse: dailyChestUse,
              setDailyChestUse: (use: number[]) => setDailyChestUse(use)
            } as SyncState}
          >
            <Col>
              <RosterStorageCard configurable
                title="Shards"
                color="#E47"
                image={t4_shard}
                mat="shards"
                // Synchronized table: syncs daily chests with "leaps" table
                syncMatIndex={0}
              />
            </Col>
            <Col>
              <RosterStorageCard configurable
                title="Leapstones"
                color="#D36"
                image={t4_leap}
                mat="leaps"
                // Synchronized table: syncs daily chests with "shards" table
                syncMatIndex={1}
              />
            </Col>
          </SyncContext>
        </Row>
        <Row>
          <Col>
            <RosterStorageCard configurable
              title="Red/Blue Stones"
              color="#F44"
              image={t4_red}
              mat="reds"
              color2="#27B"
              image2={t4_blue}
              mat2="blues"
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <RosterStorageCard configurable
              title="Lava/Glacier Breaths"
              color="#F43"
              image={t4_redSolar}
              mat="redSolars"
              color2="#28C"
              image2={t4_blueSolar}
              mat2="blueSolars"
            />
          </Col>
        </Row>
      </Container>
    </main>
	);
}