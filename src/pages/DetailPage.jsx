import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { capitalize, getSpriteUrl, parseEvolutionChain } from "../utils.js";

function DetailPage() {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [evolution, setEvolution] = useState(null); // { from: {name,id}|null, to: [{name,id}] }
  const [isEvoLoading, setIsEvoLoading] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadPokemon() {
      setIsLoading(true);
      setError(null);
      setPokemon(null);
      try {
        const response = await fetch(`${API_BASE_URL}/pokemon/${name}`);
        if (!response.ok) {
          throw new Error(`No Pokémon named "${name}" — check the spelling.`);
        }
        const data = await response.json();
        if (isCurrent) {
          setPokemon(data);
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadPokemon();

    return () => {
      isCurrent = false;
    };
  }, [name]); // re-run whenever the :name in the URL changes

  // Evolution info depends on the pokemon we just loaded (specifically its
  // species url), so this is a second, separate effect rather than being
  // crammed into the fetch above — two different concerns, two effects.
  useEffect(() => {
    if (!pokemon) return;

    let isCurrent = true;

    async function loadEvolution() {
      setIsEvoLoading(true);
      setEvolution(null);
      try {
        const speciesResponse = await fetch(pokemon.species.url);
        const speciesData = await speciesResponse.json();

        const chainResponse = await fetch(speciesData.evolution_chain.url);
        const chainData = await chainResponse.json();

        const chainMap = parseEvolutionChain(chainData.chain);
        const current = chainMap.get(pokemon.species.name);

        if (isCurrent && current) {
          setEvolution({
            from: current.from ? chainMap.get(current.from) : null,
            to: current.to.map((n) => chainMap.get(n)),
          });
        }
      } catch {
        // Evolution info is a nice-to-have — if it fails to load, the rest
        // of the page still works fine without it.
        if (isCurrent) setEvolution(null);
      } finally {
        if (isCurrent) setIsEvoLoading(false);
      }
    }

    loadEvolution();

    return () => {
      isCurrent = false;
    };
  }, [pokemon]);

  if (isLoading) return <p className="status">Loading {name}…</p>;
  if (error) return <p className="status status-error">{error}</p>;

  const hasEvolutionInfo =
    evolution && (evolution.from || evolution.to.length > 0);

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">← Back to list</Link>
      <img
        src={pokemon.sprites.other["official-artwork"].front_default}
        alt={pokemon.name}
        width={200}
        height={200}
      />
      <h2>{capitalize(pokemon.name)}</h2>
      <p className="pokemon-types">
        {pokemon.types.map((t) => t.type.name).join(", ")}
      </p>
      <ul className="stat-list">
        {pokemon.stats.map((s) => (
          <li key={s.stat.name}>
            <span className="stat-name">{s.stat.name}</span>
            <span className="stat-value">{s.base_stat}</span>
          </li>
        ))}
      </ul>

      {isEvoLoading && <p className="status">Loading evolution…</p>}

      {!isEvoLoading && hasEvolutionInfo && (
        <div className="evolution-section">
          <h3>Evolution</h3>
          <div className="evolution-links">
            {evolution.from && (
              <Link
                to={`/pokemon/${evolution.from.name}`}
                className="evolution-link"
              >
                <img
                  src={getSpriteUrl(evolution.from.id)}
                  alt={evolution.from.name}
                  width={56}
                  height={56}
                />
                <span>← {capitalize(evolution.from.name)}</span>
              </Link>
            )}
            {evolution.to.map((next) => (
              <Link
                key={next.name}
                to={`/pokemon/${next.name}`}
                className="evolution-link"
              >
                <img
                  src={getSpriteUrl(next.id)}
                  alt={next.name}
                  width={56}
                  height={56}
                />
                <span>{capitalize(next.name)} →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailPage;