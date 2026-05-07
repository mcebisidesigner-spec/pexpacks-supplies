import { allCities, allGrades } from "@/data/schools";
import styles from "./Schools.module.css";

type SchoolFiltersProps = {
  query: string;
  city: string;
  grade: string;
  onQueryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onGradeChange: (value: string) => void;
};

export function SchoolFilters({ query, city, grade, onQueryChange, onCityChange, onGradeChange }: SchoolFiltersProps) {
  return (
    <div className={styles.filters}>
      <label>
        <span>School name</span>
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search by school" />
      </label>
      <label>
        <span>Filter by city</span>
        <select value={city} onChange={(event) => onCityChange(event.target.value)}>
          <option value="all">All cities</option>
          {allCities.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Filter by grade</span>
        <select value={grade} onChange={(event) => onGradeChange(event.target.value)}>
          <option value="all">All Grades</option>
          {allGrades.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
