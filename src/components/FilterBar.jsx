import { POKEMON_TYPES, GENERATIONS } from "../config.js";
import { capitalize } from "../utils.js";

function FilterBar({ selectedType, onTypeChange, selectedGen, onGenChange }) {
  return (
    <div className="filter-bar">
      <select
        className="filter-select"
        value={selectedType}
        onChange={(event) => onTypeChange(event.target.value)}
        aria-label="Filter by type"
      >
        <option value="all">All types</option>
        {POKEMON_TYPES.map((type) => (
          <option key={type} value={type}>
            {capitalize(type)}
          </option>
        ))}
      </select>

      <select
        className="filter-select"
        value={selectedGen}
        onChange={(event) => onGenChange(event.target.value)}
        aria-label="Filter by generation"
      >
        <option value="all">All generations</option>
        {GENERATIONS.map((gen) => (
          <option key={gen.id} value={String(gen.id)}>
            {gen.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterBar;