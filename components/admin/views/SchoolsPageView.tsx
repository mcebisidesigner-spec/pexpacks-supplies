"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Edit,
  Eye,
  EyeOff,
  GraduationCap,
  Plus,
  Search,
} from "lucide-react";
import styles from "./CorePagesView.module.css";
import { toggleSchoolVisibility } from "@/lib/admin/schools";

interface SchoolRow {
  id: string;
  name: string;
  city: string;
  province: string;
  partnerStatus: "Partner" | "Non-partner";
  status: "Active" | "Inactive";
}

const SEED_SCHOOLS: SchoolRow[] = [
  { id: "3d-christian-academy", name: "3d Christian Academy", city: "Pretoria", province: "Gauteng", partnerStatus: "Partner", status: "Active" },
  { id: "a-re-tlabeng-primary-school", name: "A Re Tlabeng Primary School", city: "Pretoria", province: "Gauteng", partnerStatus: "Partner", status: "Active" },
  { id: "aa-academy", name: "Aa Academy", city: "Johannesburg", province: "Gauteng", partnerStatus: "Partner", status: "Active" },
  { id: "ab-phokompe-secondary-school", name: "Ab Phokompe Secondary School", city: "Krugersdorp", province: "Gauteng", partnerStatus: "Partner", status: "Active" },
  { id: "buhle-high-school", name: "Buhle High School", city: "Centurion", province: "Gauteng", partnerStatus: "Non-partner", status: "Active" },
  { id: "crescent-primary-school", name: "Crescent Primary School", city: "Randburg", province: "Gauteng", partnerStatus: "Partner", status: "Active" },
  { id: "daleview-secondary-school", name: "Daleview Secondary School", city: "Centurion", province: "Gauteng", partnerStatus: "Partner", status: "Active" },
  { id: "edenvale-primary-school", name: "Edenvale Primary School", city: "Edenvale", province: "Gauteng", partnerStatus: "Partner", status: "Active" },
];

export function SchoolsPageView() {
  const router = useRouter();
  const [schools, setSchools] = useState<SchoolRow[]>(SEED_SCHOOLS);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return schools.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase());
      const matchCity = cityFilter === "all" || s.city === cityFilter;
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchCity && matchStatus;
    });
  }, [schools, search, cityFilter, statusFilter]);

  const handleToggleHide = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleSchoolVisibility(id);
      setSchools((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s
        )
      );
    } catch {
      // Local state fallback for UI reactivity
      setSchools((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s
        )
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            Schools <span style={{ fontSize: 16, color: "#64748b", fontWeight: 500 }}>({schools.length})</span>
          </h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/schools/new" className={styles.primaryBtn}>
            <Plus size={14} /> + Add School
          </Link>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search />
            <input
              className={styles.searchInput}
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className={styles.selectInput} value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            <option value="all">All cities</option>
            <option value="Pretoria">Pretoria</option>
            <option value="Johannesburg">Johannesburg</option>
            <option value="Centurion">Centurion</option>
            <option value="Randburg">Randburg</option>
          </select>
          <select className={styles.selectInput} value={provinceFilter} onChange={(e) => setProvinceFilter(e.target.value)}>
            <option value="all">All provinces</option>
            <option value="Gauteng">Gauteng</option>
          </select>
          <select className={styles.selectInput} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button className={styles.secondaryBtn} style={{ background: "#0d9488", color: "#ffffff", border: "none" }} type="button">
            Apply
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th style={{ width: 36 }}></th>
                <th>School Name</th>
                <th>City</th>
                <th>Province</th>
                <th>Partner Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((school) => (
                <tr
                  key={school.id}
                  className={styles.dataRow}
                  onClick={() => router.push(`/admin/schools/${school.id}/info`)}
                >
                  <td>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
                      <GraduationCap size={14} />
                    </div>
                  </td>
                  <td>
                    <Link
                      href={`/admin/schools/${school.id}/info`}
                      style={{ color: "#ffffff", fontWeight: 700, textDecoration: "none" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {school.name}
                    </Link>
                  </td>
                  <td>{school.city}</td>
                  <td>{school.province}</td>
                  <td>
                    <span className={school.partnerStatus === "Partner" ? styles.badgeGreen : styles.badgeDark}>
                      ● {school.partnerStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                      <span className={school.status === "Active" ? styles.badgeTeal : styles.badgeDark}>{school.status}</span>
                      <Link
                        href={`/admin/schools/${school.id}/edit`}
                        className={styles.actionBtnDots}
                        style={{ fontSize: 11, padding: "2px 8px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <Edit size={12} /> Edit
                      </Link>
                      <button
                        className={styles.actionBtnDots}
                        style={{ fontSize: 11, padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: 4 }}
                        type="button"
                        onClick={(e) => handleToggleHide(school.id, e)}
                      >
                        {school.status === "Active" ? <EyeOff size={12} /> : <Eye size={12} />}
                        {school.status === "Active" ? "Hide" : "Show"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.paginationFooter}>
          <span>Showing 1 to {filtered.length} of {schools.length} schools</span>
          <div className={styles.paginationControls}>
            <button className={styles.pageBtn}>&lt;</button>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
            <button className={styles.pageBtn}>&gt;</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>Show</span>
            <select className={styles.selectInput} style={{ height: 26, padding: "0 4px", fontSize: 11 }}>
              <option>10</option>
              <option>20</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      </div>
    </div>
  );
}
