import {type JSX} from 'react';

import gold from '../../assets/gold.png';
import silver from '../../assets/silver.png';
import t4_blue from '../../assets/t4_blue.png';
import t4_blueSolar from '../../assets/t4_bluesolar.png';
import t4_fusion from '../../assets/t4_fusion.png';
import t4_leap from '../../assets/t4_leap.png';
import t4_red from '../../assets/t4_red.png';
import t4_redSolar from '../../assets/t4_redsolar.png';
import t4_shard from '../../assets/t4_shard.png';

/** Props interface for TableHeader. */
interface TableHeaderProps{
  title: JSX.Element;
}

/** Constructs a Table element given a Character object specified by params. */
export function TableHeader(props: TableHeaderProps): JSX.Element{
  return(
    <thead>
      <tr>
        {props.title}
        <th>Gold Value</th>
        <th><img src={silver}/></th>
        <th><img src={gold}/></th>
        <th><img src={t4_shard}/></th>
        <th><img src={t4_fusion}/></th>
        <th><img src={t4_red}/></th>
        <th><img src={t4_blue}/></th>
        <th><img src={t4_leap}/></th>
        <th><img src={t4_redSolar}/></th>
        <th><img src={t4_blueSolar}/></th>
      </tr>
    </thead>
  );
}