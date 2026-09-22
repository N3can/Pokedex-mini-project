export const API_BASE_URL = "https://pokeapi.co/api/v2";
export const SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

// Hardcoded because the 18 types never change — no need to fetch them just to
// populate a dropdown.
export const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark",
  "steel", "fairy",
];

// National Pokédex ID ranges per generation. PokéAPI's /generation/{id}
// endpoint exists too, but it returns species entries, not the same shape as
// the /pokemon list we already have — an ID range is simpler to filter with
// since we already extract each Pokémon's ID from its url.
export const GENERATIONS = [
  { id: 1, label: "Gen 1", start: 1, end: 151 },
  { id: 2, label: "Gen 2", start: 152, end: 251 },
  { id: 3, label: "Gen 3", start: 252, end: 386 },
  { id: 4, label: "Gen 4", start: 387, end: 493 },
  { id: 5, label: "Gen 5", start: 494, end: 649 },
  { id: 6, label: "Gen 6", start: 650, end: 721 },
  { id: 7, label: "Gen 7", start: 722, end: 809 },
  { id: 8, label: "Gen 8", start: 810, end: 905 },
  { id: 9, label: "Gen 9", start: 906, end: 1025 },
];