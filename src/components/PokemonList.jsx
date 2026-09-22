import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, GENERATIONS } from "../config.js";
import { getIdFromUrl, capitalize, getSpriteUrl } from "../utils.js";
import FilterBar from "./FilterBar.jsx";

const DISPLAY_LIMIT = 24; // how many to show when no filter is active
const TOTAL_POKEMON = 1025; // covers Gen 1 through Gen 9

function PokemonList() {
  const [pokemons, setPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedType, setSelectedType] = useState("all");
  const [selectedGen, setSelectedGen] = useState("all");
  const [typeMembers, setTypeMembers] = useState(null); // Set of names in the selected type, or null when no type is selected
  const [isTypeLoading, setIsTypeLoading] = useState(false);
  const [typeError, setTypeError] = useState(null);

  // Fetch the full name/url roster once, up front. This means selecting a
  // generation never needs a new request — we already have every ID.
  useEffect(() => {
    async function loadPokemons() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/pokemon?limit=${TOTAL_POKEMON}`);
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        const data = await response.json();
        setPokemons(data.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadPokemons();
  }, []);

  // The type filter is the one thing the roster fetch above can't answer —
  // the list endpoint only gives us name + url, no type. So picking a type
  // fires its own request to /type/{name}, which returns every Pokémon in it.
  useEffect(() => {
    if (selectedType === "all") {
      setTypeMembers(null);
      setTypeError(null);
      return;
    }

    let isCurrent = true;

    async function loadTypeMembers() {
      setIsTypeLoading(true);
      setTypeError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/type/${selectedType}`);
        if (!response.ok) {
          throw new Error(`Couldn't load the "${selectedType}" type.`);
        }
        const data = await response.json();
        if (isCurrent) {
          setTypeMembers(new Set(data.pokemon.map((entry) => entry.pokemon.name)));
        }
      } catch (err) {
        if (isCurrent) {
          setTypeError(err.message);
        }
      } finally {
        if (isCurrent) {
          setIsTypeLoading(false);
        }
      }
    }

    loadTypeMembers();

    return () => {
      isCurrent = false;
    };
  }, [selectedType]);

  // Recompute only when the roster or either filter actually changes, instead
  // of re-filtering 1000+ Pokémon on every unrelated render.
  const filtered = useMemo(() => {
    const genRange = GENERATIONS.find((gen) => String(gen.id) === selectedGen);

    return pokemons.filter((pokemon) => {
      if (typeMembers && !typeMembers.has(pokemon.name)) return false;
      if (genRange) {
        const id = Number(getIdFromUrl(pokemon.url));
        if (id < genRange.start || id > genRange.end) return false;
      }
      return true;
    });
  }, [pokemons, typeMembers, selectedGen]);

  const isFiltered = selectedType !== "all" || selectedGen !== "all";
  const visible = isFiltered ? filtered : filtered.slice(0, DISPLAY_LIMIT);

  if (isLoading) {
    return <p className="status">Loading Pokémon…</p>;
  }

  if (error) {
    return <p className="status status-error">Couldn't load the list: {error}</p>;
  }

  return (
    <>
      <FilterBar
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedGen={selectedGen}
        onGenChange={setSelectedGen}
      />

      {isTypeLoading && <p className="status">Filtering by type…</p>}
      {typeError && <p className="status status-error">{typeError}</p>}

      {!isTypeLoading && !typeError && (
        <>
          <p className="filter-count">
            Showing {visible.length} of {filtered.length} Pokémon
          </p>

          {visible.length === 0 ? (
            <p className="status">No Pokémon match that filter.</p>
          ) : (
            <ul className="pokemon-list">
              {visible.map((pokemon) => {
                const id = getIdFromUrl(pokemon.url);
                return (
                  <li key={pokemon.name} className="pokemon-list-item">
                    <Link to={`/pokemon/${pokemon.name}`} className="pokemon-link">
                      <img
                        className="pokemon-sprite"
                        src={getSpriteUrl(id)}
                        alt={pokemon.name}
                        width={48}
                        height={48}
                      />
                      <span className="pokemon-id">#{id.padStart(3, "0")}</span>
                      <span className="pokemon-name">{capitalize(pokemon.name)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}

export default PokemonList;