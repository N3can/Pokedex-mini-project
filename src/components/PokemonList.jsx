import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, GENERATIONS } from "../config.js";
import { getIdFromUrl, capitalize, getSpriteUrl } from "../utils.js";
import FilterBar from "./FilterBar.jsx";

const PAGE_SIZE = 24; // how many Pokémon show per page
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

  const [page, setPage] = useState(1);

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
