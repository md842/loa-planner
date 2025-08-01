import {CharacterCard, type Goal} from '../components/CharacterCard';

export default function Home(){
  // Hardcoded placeholder goals. TODO: Load characters/goals dynamically.
  let char1Goals: Goal[] = [];
  char1Goals.push({name: "Adv 21-40", values: {silver: 8613544, gold: 208063, shards: 919322, fusions: 1703, reds: 0, blues: 104032, leaps: 1939, redSolars: 0, blueSolars: 376}});
  char1Goals.push({name: "Weapon +25", values: {silver: 11610890, gold: 258427, shards: 1173395, fusions: 2287, reds: 205827, blues: 0, leaps: 2974, redSolars: 2282, blueSolars: 0}});

	return(
    <main className="home">
      <CharacterCard
        name="Stormvex"
        ilvl="1725"
        class="Aeromancer"
        goals={char1Goals}
      />
    </main>
	);
}