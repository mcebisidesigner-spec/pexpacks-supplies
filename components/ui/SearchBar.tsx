import { allCities, allGrades } from "@/data/schools";
import { IconCircle } from "./IconCircle";
import styles from "./SearchBar.module.css";

type SearchBarProps = {
  compact?: boolean;
  defaultQuery?: string;
  defaultCity?: string;
  defaultGrade?: string;
  action?: string;
};

export function SearchBar({
  compact = false,
  defaultQuery = "",
  defaultCity = "all",
  defaultGrade = "all",
  action = "/schools"
}: SearchBarProps) {
  return (
    <form className={[styles.searchBar, compact ? styles.compact : ""].filter(Boolean).join(" ")} action={action}>
      <label className={styles.field}>
        <span>School name</span>
        <input name="q" type="search" defaultValue={defaultQuery} placeholder="Parktown Primary School" />
      </label>
      <label className={styles.field}>
        <span>Filter by city</span>
        <select name="city" defaultValue={defaultCity}>
          <option value="all">All Cities</option>
          {allCities.map((city) => (
            <option value={city} key={city}>
              {city}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span>Filter by grade</span>
        <select name="grade" defaultValue={defaultGrade}>
          <option value="all">All Grades</option>
          {allGrades.map((grade) => (
            <option value={grade} key={grade}>
              {grade}
            </option>
          ))}
        </select>
      </label>
      <button className={styles.submit} type="submit" aria-label="Search school packs">
        <IconCircle direction="search" tone="orange" />
      </button>
    </form>
  );
}
