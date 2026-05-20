"use client";

import { useState } from "react";
import styles from "./SchoolMockupDemo.module.css";

type ModalType = "schedule" | "faculty" | "activities" | "admissions" | null;

export function SchoolMockupDemo() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeTab, setActiveTab] = useState<"home" | "about" | "contact">("home");

  const openModal = (type: ModalType) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <section className={styles.container}>
      <div className={styles.layout}>
        {/* Sidebar explanation */}
        <div className={styles.textCol}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 800,
                textTransform: "uppercase",
                color: "var(--pex-keppel)",
                letterSpacing: "0.08em",
              }}
            >
              Interactive Preview
            </span>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(24px, 3.4vw, 36px)",
                fontWeight: 800,
                color: "var(--pex-navy)",
                lineHeight: 1.25,
              }}
            >
              Take a tour of a Greenwood Academy site
            </h2>
            <p style={{ margin: 0, color: "var(--pex-text-muted)", fontSize: "15px", lineHeight: 1.6 }}>
              Click on the quick access badges inside the browser mockup to see how parents navigate faculty databases, events boards, and document downloads instantly.
            </p>
          </div>

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Fully customized school color schemes and official badges.</span>
            </li>
            <li className={styles.featureItem}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Mobile-responsive rendering designed to load perfectly on standard phones.</span>
            </li>
            <li className={styles.featureItem}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Lightning fast speeds secured with premium hosting.</span>
            </li>
          </ul>
        </div>

        {/* Live CSS Interactive Mockup */}
        <div className={styles.mockupWrapper}>
          <div className={styles.browserFrame}>
            {/* Window Chrome Header */}
            <div className={styles.browserHeader}>
              <div className={styles.windowButtons}>
                <span className={`${styles.dot} ${styles.dotRed}`} />
                <span className={`${styles.dot} ${styles.dotYellow}`} />
                <span className={`${styles.dot} ${styles.dotGreen}`} />
              </div>
              <div className={styles.browserNav}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
              <div className={styles.urlBar}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>https://www.greenwoodacademy.edu.za</span>
              </div>
            </div>

            {/* Browser Content Window */}
            <div className={styles.webpage}>
              {/* Interactive Modal inside the browser frame */}
              {activeModal && (
                <div className={styles.modalBackdrop} onClick={closeModal}>
                  <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                      <h3>
                        {activeModal === "schedule" && "Academic Class Schedule"}
                        {activeModal === "faculty" && "Meet Our Expert Faculty"}
                        {activeModal === "activities" && "Extracurricular Programs"}
                        {activeModal === "admissions" && "Admissions & Registration"}
                      </h3>
                      <span className={styles.modalCloseBtn} onClick={closeModal}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </span>
                    </div>
                    <div className={styles.modalBody}>
                      {activeModal === "schedule" && (
                        <table className={styles.scheduleTable}>
                          <thead>
                            <tr>
                              <th>Time slot</th>
                              <th>Foundation Phase</th>
                              <th>Intermediate Phase</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td><strong>08:00 - 10:00</strong></td>
                              <td>Mathematics & Art</td>
                              <td>English Language Arts</td>
                            </tr>
                            <tr>
                              <td><strong>10:00 - 10:30</strong></td>
                              <td style={{ color: "var(--pex-keppel)", fontWeight: 700 }}>Recess Break</td>
                              <td style={{ color: "var(--pex-keppel)", fontWeight: 700 }}>Recess Break</td>
                            </tr>
                            <tr>
                              <td><strong>10:30 - 12:30</strong></td>
                              <td>Life Skills / Literacy</td>
                              <td>Natural Sciences & Tech</td>
                            </tr>
                            <tr>
                              <td><strong>12:30 - 14:00</strong></td>
                              <td>Story Circle & Read</td>
                              <td>Social Sciences / History</td>
                            </tr>
                          </tbody>
                        </table>
                      )}

                      {activeModal === "faculty" && (
                        <div className={styles.facultyList}>
                          <div className={styles.facultyItem}>
                            <div className={styles.facultyAvatar}>SJ</div>
                            <div className={styles.facultyInfo}>
                              <h5>Dr. Sarah Jenkins</h5>
                              <p>School Principal & Academic Director</p>
                            </div>
                          </div>
                          <div className={styles.facultyItem}>
                            <div className={styles.facultyAvatar}>DK</div>
                            <div className={styles.facultyInfo}>
                              <h5>Mr. David Khumalo</h5>
                              <p>Head of Sports & Physical Education</p>
                            </div>
                          </div>
                          <div className={styles.facultyItem}>
                            <div className={styles.facultyAvatar}>EP</div>
                            <div className={styles.facultyInfo}>
                              <h5>Mrs. Elena Petrova</h5>
                              <p>Department Head of Natural Sciences</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeModal === "activities" && (
                        <div className={styles.extracurricularList}>
                          <div style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px" }}>
                            <strong>⚽ First Team Soccer & Rugby</strong>
                            <p style={{ margin: "2px 0 0", color: "#718096", fontSize: "11px" }}>Practices on Tuesdays & Thursdays at 14:30.</p>
                          </div>
                          <div style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px" }}>
                            <strong>♟ Greenwood Chess & Robotics Club</strong>
                            <p style={{ margin: "2px 0 0", color: "#718096", fontSize: "11px" }}>Weekly competitions and building challenges.</p>
                          </div>
                          <div style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px" }}>
                            <strong>🎭 Drama & Debate League</strong>
                            <p style={{ margin: "2px 0 0", color: "#718096", fontSize: "11px" }}>Preparing annual school theater productions.</p>
                          </div>
                        </div>
                      )}

                      {activeModal === "admissions" && (
                        <div className={styles.admissionSteps}>
                          <div className={styles.stepItem}>
                            <span className={styles.stepNum}>1</span>
                            <div>
                              <strong style={{ fontSize: "13px" }}>Download Form</strong>
                              <p style={{ margin: "2px 0 0", color: "#718096", fontSize: "11px" }}>Complete our secure digital student enrollment forms.</p>
                            </div>
                          </div>
                          <div className={styles.stepItem}>
                            <span className={styles.stepNum}>2</span>
                            <div>
                              <strong style={{ fontSize: "13px" }}>Submit Documentation</strong>
                              <p style={{ margin: "2px 0 0", color: "#718096", fontSize: "11px" }}>Upload previous academic reports and birth certificates.</p>
                            </div>
                          </div>
                          <div className={styles.stepItem}>
                            <span className={styles.stepNum}>3</span>
                            <div>
                              <strong style={{ fontSize: "13px" }}>Learner Assessment</strong>
                              <p style={{ margin: "2px 0 0", color: "#718096", fontSize: "11px" }}>Schedule a modern placement assessment session.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Mock School Brand Navbar */}
              <div className={styles.mockNavbar}>
                <div className={styles.schoolLogo}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
                  </svg>
                  <span>Greenwood Academy</span>
                </div>
                <div className={styles.mockNavLinks}>
                  <span className={activeTab === "home" ? styles.active : ""} onClick={() => setActiveTab("home")}>Home</span>
                  <span className={activeTab === "about" ? styles.active : ""} onClick={() => setActiveTab("about")}>About</span>
                  <span className={activeTab === "contact" ? styles.active : ""} onClick={() => setActiveTab("contact")}>Contact</span>
                </div>
              </div>

              {activeTab === "home" ? (
                <>
                  {/* Mock Hero Header banner */}
                  <div className={styles.mockHero}>
                    <div className={styles.mockHeroPattern} />
                    <h2>Nurturing Minds, Inspiring Futures</h2>
                    <p>A vibrant learning community dedicated to fostering academic excellence, emotional growth, and community values in Gauteng.</p>
                  </div>

                  {/* Mock Interactive Quick Access badges */}
                  <div className={styles.quickLinksSection}>
                    <h3 className={styles.sectionHeading}>Quick Student Portal</h3>
                    <div className={styles.quickLinksGrid}>
                      <div className={styles.quickLinkCard} onClick={() => openModal("schedule")}>
                        <div className={`${styles.iconWrapper} ${styles.iconSchedule}`}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>
                        <h4>Schedule</h4>
                        <p>Class hours</p>
                      </div>

                      <div className={styles.quickLinkCard} onClick={() => openModal("faculty")}>
                        <div className={`${styles.iconWrapper} ${styles.iconFaculty}`}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                        </div>
                        <h4>Faculty</h4>
                        <p>Meet teachers</p>
                      </div>

                      <div className={styles.quickLinkCard} onClick={() => openModal("activities")}>
                        <div className={`${styles.iconWrapper} ${styles.iconExtracurricular}`}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M6 12A6 6 0 0 1 18 12"></path>
                          </svg>
                        </div>
                        <h4>Sports</h4>
                        <p>Activities</p>
                      </div>

                      <div className={styles.quickLinkCard} onClick={() => openModal("admissions")}>
                        <div className={`${styles.iconWrapper} ${styles.iconAdmissions}`}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        </div>
                        <h4>Apply</h4>
                        <p>Registration</p>
                      </div>
                    </div>
                  </div>

                  {/* News and Upcoming Events Grid */}
                  <div className={styles.mainGrid}>
                    <div className={styles.newsCardList}>
                      <h3 className={styles.sectionHeading}>Latest News</h3>
                      <div className={styles.newsItem}>
                        <div className={styles.newsImage}>🗞️</div>
                        <div className={styles.newsContent}>
                          <span className={styles.newsTag}>School Athletics</span>
                          <h4>Inter-School Sports Gala Winners</h4>
                          <p>Greenwood Academy secured first place in the Gauteng regional sports track meet!</p>
                        </div>
                      </div>
                      <div className={styles.newsItem}>
                        <div className={styles.newsImage}>🔬</div>
                        <div className={styles.newsContent}>
                          <span className={styles.newsTag}>Campus Upgrade</span>
                          <h4>Modern Science Lab Unveiled</h4>
                          <p>Thanks to development rebates, our brand new STEM center is fully open for junior classes.</p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.eventsCard}>
                      <h3 className={styles.sectionHeading}>Upcoming Events</h3>
                      <div className={styles.eventList}>
                        <div className={styles.eventItem}>
                          <div className={styles.eventDate}>
                            <span className={styles.eventDateDay}>24</span>
                            <span className={styles.eventDateMonth}>May</span>
                          </div>
                          <div className={styles.eventDetails}>
                            <h5>Parent-Teacher Association</h5>
                            <p>18:30 in the Main School Hall</p>
                          </div>
                        </div>

                        <div className={styles.eventItem}>
                          <div className={styles.eventDate}>
                            <span className={styles.eventDateDay}>02</span>
                            <span className={styles.eventDateMonth}>Jun</span>
                          </div>
                          <div className={styles.eventDetails}>
                            <h5>Midterm Exams Begin</h5>
                            <p>Grade 4 to Grade 7 students</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : activeTab === "about" ? (
                <div style={{ padding: "28px", background: "#ffffff" }}>
                  <h3 style={{ color: "var(--pex-navy)", margin: "0 0 12px 0", fontWeight: 800 }}>About Greenwood Academy</h3>
                  <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#4a5568", lineHeight: 1.5 }}>
                    Founded in 2012, Greenwood Academy provides learner-centered educational experiences. We support modern STEM labs, visual arts curriculum, and a full athletics roster.
                  </p>
                  <blockquote style={{ borderLeft: "4px solid var(--pex-keppel)", paddingLeft: "16px", margin: "0 0 16px 0", fontStyle: "italic", fontSize: "13px", color: "#718096" }}>
                    "To empower tomorrow's leaders with practical skills, critical analytical capacity, and healthy community ideals."
                  </blockquote>
                </div>
              ) : (
                <div style={{ padding: "28px", background: "#ffffff" }}>
                  <h3 style={{ color: "var(--pex-navy)", margin: "0 0 12px 0", fontWeight: 800 }}>Contact Administration</h3>
                  <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#4a5568", lineHeight: 1.5 }}>
                    Have questions about registration, scheduling, or fee statements? Reach out to our front desk team directly.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <strong>📞 Phone:</strong>
                      <span>011 445 6078</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <strong>✉️ Email:</strong>
                      <span>info@greenwoodacademy.co.za</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
