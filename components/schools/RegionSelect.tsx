import styles from "./Schools.module.css";

type RegionSelectProps = {
  regions: string[];
  value: string;
  onChange: (value: string) => void;
};

export function RegionSelect({ regions, value, onChange }: RegionSelectProps) {
  return (
    <label className={styles.searchField}>
      <span>Region</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="all">Select region</option>
        {regions.map((region) => (
          <option value={region} key={region}>
            {region}
          </option>
        ))}
      </select>
    </label>
  );
}
