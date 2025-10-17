import {type ReactNode} from 'react';

import gold from '../../../assets/gold.png';
import silver from '../../../assets/silver.png';
import t4_blue from '../../../assets/t4_blue.png';
import t4_blueSolar from '../../../assets/t4_bluesolar.png';
import t4_fusion from '../../../assets/t4_fusion.png';
import t4_leap from '../../../assets/t4_leap.png';
import t4_red from '../../../assets/t4_red.png';
import t4_redSolar from '../../../assets/t4_redsolar.png';
import t4_shard from '../../../assets/t4_shard.png';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

/** Props interface for TableHeader. */
interface TableHeaderProps{
  title: ReactNode;
}

/** Constructs the header row of the parent table. */
export function TableHeader(props: TableHeaderProps): ReactNode{
  return(
    <Container className="container-table m-0">
      <Row className="table-head">
        {props.title}
        <Col className="table-cell">Gold Value</Col>
        <Col className="table-cell"><img src={silver}/></Col>
        <Col className="table-cell"><img src={gold}/></Col>
        <Col className="table-cell"><img src={t4_shard}/></Col>
        <Col className="table-cell"><img src={t4_fusion}/></Col>
        <Col className="table-cell"><img src={t4_red}/></Col>
        <Col className="table-cell"><img src={t4_blue}/></Col>
        <Col className="table-cell"><img src={t4_leap}/></Col>
        <Col className="table-cell"><img src={t4_redSolar}/></Col>
        <Col className="table-cell"><img src={t4_blueSolar}/></Col>
      </Row>
    </Container>
  );
}