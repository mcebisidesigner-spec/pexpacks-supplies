import styles from "./GradeSelect.module.css";

type GradeSelectProps = {
  grades: string[];
  value: string;
  onChange: (value: string) => void;
};

export function GradeSelect({ grades, value, onChange }: GradeSelectProps) {
  return (
    <label className={styles.searchField} htmlFor="grade-select">
      <span>Grade</span>
      <select
        id="grade-select"
        name="grade"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="all">Choose grade</option>
        {grades.map((grade) => (
          <option value={grade} key={grade}>
            {grade}
          </option>
        ))}
      </select>
    </label>
  );
}
