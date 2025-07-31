import {CharacterCard, type Goal} from '../components/CharacterCard';

export default function Home(){
  // Hardcoded placeholder goals. TODO: Load characters/goals dynamically.
  let char1Goals: Goal[] = [];
  char1Goals.push({name: "Adv 21-40", values: {silver: 22671871, gold: 548920, shards: 2475511, fusions: 4401, reds: 0, blues: 274460, leaps: 5206, redSolars: 0, blueSolars: 991}});
  char1Goals.push({name: "Weapon +25", values: {silver: 11610890, gold: 258427, shards: 1173395, fusions: 2287, reds: 205827, blues: 0, leaps: 2974, redSolars: 2282, blueSolars: 0}});

	return(
    <main className="home">
      <CharacterCard
        name="Stormvex"
        ilvl="1720"
        class="Aeromancer"
        goals={char1Goals}
      />
    </main>
	);
}