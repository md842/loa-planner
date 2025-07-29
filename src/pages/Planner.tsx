import {CharacterCard, type Goal} from '../components/CharacterCard';

export default function Home(){
  // Hardcoded placeholder goals. TODO: Load characters/goals dynamically.
  let char1Goals = new Array<Goal>;
  char1Goals.push({name: "Adv 21-40", silver: 22671871, gold: 548920, shards: 2475511, fusions: 4401, reds: 0, blues: 274460, leaps: 5206, redsolars: 0, bluesolars: 991});
  char1Goals.push({name: "Weapon +25", silver: 11610890, gold: 258427, shards: 1173395, fusions: 2287, reds: 205827, blues: 0, leaps: 2974, redsolars: 2282, bluesolars: 0});

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