import styles from "./Schools.module.css";

type GradeSelectProps = {
  grades: string[];
  value: string;
  onChange: (value: string) => void;
};

export function GradeSelect({ grades, value, onChange }: GradeSelectProps) {
  return (
    <label className={styles.searchField}>
      <span>Grade</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="all">Select grade</option>
        {grades.map((grade) => (
          <option value={grade} key={grade}>
            {grade}
          </option>
        ))}
      </select>
    </label>
  );
}
