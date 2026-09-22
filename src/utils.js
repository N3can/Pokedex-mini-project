import { SPRITE_BASE_URL } from "./config.js";

export function getIdFromUrl(url) {
  // url looks like "https://pokeapi.co/api/v2/pokemon/25/"
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

export function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getSpriteUrl(id) {
  return `${SPRITE_BASE_URL}/${id}.png`;
}
// Walks the (possibly branching) evolution chain tree PokéAPI returns and
// flattens it into a lookup: name -> { name, id, from, to }.
// "from" is the name it evolves from (or null), "to" is an array of names it
// evolves into (usually one, but e.g. Eevee has several).
export function parseEvolutionChain(chain) {
  const map = new Map();

  function walk(node, parentName) {
    const name = node.species.name;
    const id = getIdFromUrl(node.species.url);

    if (!map.has(name)) {
      map.set(name, { name, id, from: parentName, to: [] });
    }

    if (parentName && map.has(parentName)) {
      const parentEntry = map.get(parentName);
      if (!parentEntry.to.includes(name)) {
        parentEntry.to.push(name);
      }
    }

    node.evolves_to.forEach((child) => walk(child, name));
  }

  walk(chain, null);
  return map;
}