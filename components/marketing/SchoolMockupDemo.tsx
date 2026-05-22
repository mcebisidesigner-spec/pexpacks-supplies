"use client";

import { useState } from "react";
import styles from "./SchoolMockupDemo.module.css";

type DemoView = "website" | "portal" | "updates";
type DeviceView = "desktop" | "mobile";

interface StationeryItem {
  name: string;
  qty: number;
}

interface GradePack {
  id: string;
  name: string;
  price: number;
  items: StationeryItem[];
}

const gradePacks: GradePack[] = [
  {
    id: "r",
    name: "Grade R Stationery Pack",
    price: 580,
    items: [
      { name: "Retractable Wax Crayons (12pk)", qty: 1 },
      { name: "Glue Sticks (40g)", qty: 2 },
      { name: "Blunt Nose Scissors", qty: 1 },
      { name: "Thick HB Graphite Pencils", qty: 2 },
      { name: "A4 Blank Drawing Book", qty: 1 },
    ],
  },
  {
    id: "1",
    name: "Grade 1 Stationery Pack",
    price: 720,
    items: [
      { name: "Coloured Pencils (12pk)", qty: 1 },
      { name: "HB Graphite Pencils", qty: 4 },
      { name: "Glue Sticks (40g)", qty: 3 },
      { name: "Premium Eraser", qty: 1 },
      { name: "Exercise Books (A4 72pg lined)", qty: 2 },
      { name: "Pencil Case (33cm)", qty: 1 },
    ],
  },
  {
    id: "4",
    name: "Grade 4 Stationery Pack",
    price: 890,
    items: [
      { name: "Blue Ballpoint Pens (4pk)", qty: 1 },
      { name: "HB Graphite Pencils", qty: 6 },
      { name: "Glue Sticks (40g)", qty: 2 },
      { name: "Math Set (Compass, Protractor)", qty: 1 },
      { name: "Exercise Books (A4 72pg lined)", qty: 6 },
      { name: "Shatterproof Ruler (30cm)", qty: 1 },
      { name: "Blunt Nose Scissors", qty: 1 },
    ],
  },
  {
    id: "7",
    name: "Grade 7 Stationery Pack",
    price: 1050,
    items: [
      { name: "Scientific Calculator (Casio)", qty: 1 },
      { name: "Blue Ballpoint Pens", qty: 2 },
      { name: "Black Ballpoint Pens", qty: 2 },
      { name: "HB Graphite Pencils", qty: 4 },
      { name: "Highlighters (Assorted)", qty: 2 },
      { name: "Exercise Books (A4 72pg)", qty: 8 },
      { name: "Ringbinders (2-Ring A4)", qty: 2 },
      { name: "Eraser & Sharpener Set", qty: 1 },
    ],
  },
];

interface Notice {
  id: number;
  category: "academic" | "sport" | "partnership";
  title: string;
  date: string;
  summary: string;
}

const initialNotices: Notice[] = [
  {
    id: 1,
    category: "partnership",
    title: "Official Pexpacks Partnership Live",
    date: "May 20, 2026",
    summary: "Our new custom school website and parent portal are now online! Order approved stationery packs in 3 clicks. 5% rebate goes to the School Development Fund.",
  },
  {
    id: 2,
    category: "academic",
    title: "Term 2 Mid-Year Examinations",
    date: "May 18, 2026",
    summary: "Exams for Grade 4 to 7 commence on June 5th. Please download the examination timetable and study guidelines from our document library.",
  },
  {
    id: 3,
    category: "sport",
    title: "Under-13 Cricket Finals",
    date: "May 15, 2026",
    summary: "Our boys' U13 team has made it to the district finals! Join us this Saturday at 09:00 at the main field to show your support.",
  },
];

const views: Array<{
  key: DemoView;
  label: string;
  title: string;
  text: string;
}> = [
  {
    key: "website",
    label: "School Website",
    title: "A professional site built around your brand",
    text: "Designed around your school badge, colours, and motto. Fully responsive on desktop and mobile, hosted and maintained by Pexpacks completely free.",
  },
  {
    key: "portal",
    label: "Parent Portal",
    title: "Order school packs in 3 simple clicks",
    text: "Pexpacks builds an integrated parent portal directly on your school site. Parents select their child's grade, customize options, and checkout securely.",
  },
  {
    key: "updates",
    label: "News Desk & Notices",
    title: "A dynamic communication hub for families",
    text: "Keep your school community updated. School admins can publish news, examination schedules, sporting notices, and partnership announcements.",
  },
];

export function SchoolMockupDemo() {
  const [activeView, setActiveView] = useState<DemoView>("website");
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");
  const current = views.find((v) => v.key === activeView)!;

  // Mock School Website state
  const [selectedGrade, setSelectedGrade] = useState<string>("4");
  const [websiteToast, setWebsiteToast] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Mock Parent Portal state
  const [portalGrade, setPortalGrade] = useState<string>("4");
  const [includeLabels, setIncludeLabels] = useState<boolean>(true);
  const [includePexcover, setIncludePexcover] = useState<boolean>(false);
  const [portalCheckoutSuccess, setPortalCheckoutSuccess] = useState<boolean>(false);

  // Mock News Desk state
  const [newsFilter, setNewsFilter] = useState<string>("all");
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newContent, setNewContent] = useState<string>("");
  const [newCategory, setNewCategory] = useState<"academic" | "sport" | "partnership">("academic");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const activeGradePack = gradePacks.find((p) => p.id === selectedGrade)!;
  const activePortalPack = gradePacks.find((p) => p.id === portalGrade)!;

  const calculatePortalTotal = () => {
    let total = activePortalPack.price;
    if (includeLabels) total += 45;
    if (includePexcover) total += 85;
    return total;
  };

  const handleOrderPack = (gradeName: string) => {
    setWebsiteToast(`Opening Stationery Portal for ${gradeName}...`);
    setTimeout(() => {
      setActiveView("portal");
      setPortalGrade(selectedGrade);
      setWebsiteToast(null);
    }, 1200);
  };

  const handlePortalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPortalCheckoutSuccess(true);
  };

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newNotice: Notice = {
      id: Date.now(),
      category: newCategory,
      title: newTitle,
      date: "Today",
      summary: newContent,
    };

    setNotices([newNotice, ...notices]);
    setNewTitle("");
    setNewContent("");
    setShowAddForm(false);
  };

  const filteredNotices = notices.filter(
    (n) => newsFilter === "all" || n.category === newsFilter
  );

  return (
    <div className={styles.container} aria-label="Interactive partner website demo">
      {/* Intro Description */}
      <div className={styles.introBlock}>
        <div className={styles.segmentedControl} role="tablist" aria-label="Choose demo view">
          {views.map((view) => (
            <button
              className={`${styles.segmentButton} ${
                activeView === view.key ? styles.segmentButtonActive : ""
              }`}
              key={view.key}
              type="button"
              role="tab"
              aria-selected={activeView === view.key}
              onClick={() => {
                setActiveView(view.key);
                setPortalCheckoutSuccess(false);
                setShowAddForm(false);
              }}
            >
              {view.label}
            </button>
          ))}
        </div>

        <div className={styles.textDetails}>
          <div className={styles.copyBlock}>
            <span className={styles.eyebrow}>{current.label}</span>
            <h3>{current.title}</h3>
            <p>{current.text}</p>
          </div>
        </div>
      </div>

      {/* Browser shell container */}
      <div className={styles.browserFrame}>
        {/* Browser header bar */}
        <div className={styles.browserHeaderBar}>
          <div className={styles.browserDots}>
            <span className={styles.dotClose}></span>
            <span className={styles.dotMin}></span>
            <span className={styles.dotMax}></span>
          </div>
          <div className={styles.browserUrl}>
            <span className={styles.lockIcon}>🔒</span>
            <span>
              {activeView === "website" && "https://www.oakridgeacademy.co.za"}
              {activeView === "portal" && "https://www.oakridgeacademy.co.za/stationery-portal"}
              {activeView === "updates" && "https://www.oakridgeacademy.co.za/news-desk"}
            </span>
          </div>
          <div className={styles.deviceSwitcher}>
            <button
              className={`${styles.deviceBtn} ${deviceView === "desktop" ? styles.deviceBtnActive : ""}`}
              onClick={() => setDeviceView("desktop")}
              title="Desktop View"
              type="button"
            >
              🖥️ Desktop
            </button>
            <button
              className={`${styles.deviceBtn} ${deviceView === "mobile" ? styles.deviceBtnActive : ""}`}
              onClick={() => setDeviceView("mobile")}
              title="Mobile View"
              type="button"
            >
              📱 Mobile
            </button>
          </div>
        </div>

        {/* Browser body view */}
        <div className={`${styles.browserBody} ${deviceView === "mobile" ? styles.browserBodyMobile : ""}`}>
          
          {/* TOAST NOTIFICATION */}
          {websiteToast && (
            <div className={styles.toast}>
              <span className={styles.toastSpinner}>🌀</span> {websiteToast}
            </div>
          )}

          {/* ────── VIEW 1: SCHOOL WEBSITE MOCKUP ────── */}
          {activeView === "website" && (
            <div className={styles.mockSchoolSite}>
              {/* Header */}
              <header className={styles.mockHeader}>
                <div className={styles.mockLogoArea}>
                  <svg className={styles.mockCrest} width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 5 L90 25 V65 C90 80 50 95 50 95 C50 95 10 80 10 65 V25 L50 5 Z" fill="#1a2a40" stroke="#ff6f59" strokeWidth="4"/>
                    <path d="M50 15 L80 30 V60 C80 72 50 83 50 83 C50 83 20 72 20 60 V30 L50 15 Z" fill="#219e9a"/>
                    <path d="M35 55 C42 50 50 52 50 52 C50 52 58 50 65 55 V38 C58 33 50 35 50 35 C50 35 42 33 35 38 V55 Z" fill="#ffffff"/>
                    <path d="M50 35 V52" stroke="#1a2a40" strokeWidth="2"/>
                    <path d="M50 20 L52 25 L58 25 L53 28 L55 34 L50 30 L45 34 L47 28 L42 25 L48 25 Z" fill="#ff6f59"/>
                  </svg>
                  <div className={styles.mockSchoolName}>
                    <strong>Oakridge Academy</strong>
                    <span>Inspiring Excellence</span>
                  </div>
                </div>

                <nav className={`${styles.mockNav} ${isMobileMenuOpen ? styles.mockNavOpen : ""}`}>
                  <a href="#" onClick={(e) => e.preventDefault()} className={styles.mockNavLinkActive}>Home</a>
                  <a href="#" onClick={(e) => e.preventDefault()}>About Us</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveView("portal"); }}>Stationery Portal</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveView("updates"); }}>News & Notices</a>
                  <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
                </nav>

                <button 
                  className={styles.mockMenuToggle} 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle menu"
                  type="button"
                >
                  ☰
                </button>
              </header>

              {/* Partnership Announcement */}
              <div className={styles.mockPromoBanner}>
                <span className={styles.bannerBadge}>Partnership</span>
                <p>
                  Official 2026 school stationery packs are now available online. 
                  <strong> 5% of all orders</strong> are rebated back to our School Development Fund!
                </p>
                <button className={styles.bannerBtn} onClick={() => setActiveView("portal")} type="button">
                  Open Portal
                </button>
              </div>

              {/* Hero Section */}
              <div className={styles.mockHero}>
                <div className={styles.mockHeroContent}>
                  <h1>Shaping Tomorrow's Leaders, Today</h1>
                  <p>
                    Oakridge Academy is an independent primary and high school providing elite quality 
                    education, sports and cultural programs in a modern, values-driven environment.
                  </p>
                  <div className={styles.mockHeroBtns}>
                    <button className={styles.mockHeroBtnPrimary} onClick={() => {
                      const element = document.getElementById("stationery-selector");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }} type="button">
                      Stationery Packs 2026
                    </button>
                    <button className={styles.mockHeroBtnSecondary} onClick={(e) => {
                      e.preventDefault();
                      setWebsiteToast("Downloading 2026 School Prospectus PDF...");
                      setTimeout(() => setWebsiteToast(null), 1500);
                    }} type="button">
                      Download Prospectus
                    </button>
                  </div>
                </div>
                <div className={styles.mockHeroVisual}>
                  <div className={styles.mockAbstractArt}>
                    <div className={styles.artCircle1}></div>
                    <div className={styles.artCircle2}></div>
                    <div className={styles.artCard}>
                      <div className={styles.artLine}></div>
                      <div className={styles.artLineShort}></div>
                      <div className={styles.artGrid}>
                        <div>✏️</div>
                        <div>📚</div>
                        <div>🎨</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features of Web Services Section */}
              <div className={styles.mockServicesSection}>
                <div className={styles.mockSectionHeading}>
                  <h2>Our Integrated Partnership Web Services</h2>
                  <p>In partnership with Pexpacks, our school community benefits from fully-managed, zero-cost digital services.</p>
                </div>
                <div className={styles.mockServicesGrid}>
                  <div className={styles.mockServiceCard}>
                    <div className={styles.cardIcon}>💻</div>
                    <h4>Free Managed Website</h4>
                    <p>Designed around Oakridge Academy's badge and colours. Hosted & maintained with full security and zero school admin workload.</p>
                  </div>
                  <div className={styles.mockServiceCard}>
                    <div className={styles.cardIcon}>🛒</div>
                    <h4>Integrated Parent Portal</h4>
                    <p>Parents order official pre-packed grade packs in minutes. Reduces school administration lists and collection chaos.</p>
                  </div>
                  <div className={styles.mockServiceCard}>
                    <div className={styles.cardIcon}>💰</div>
                    <h4>Development Fund Rebate</h4>
                    <p>5% of every stationery pack sale on this site goes directly back into school facility improvements & bursaries.</p>
                  </div>
                </div>
              </div>

              {/* Interactive Selector Widget */}
              <div className={styles.mockSelectorWidget} id="stationery-selector">
                <div className={styles.widgetHeader}>
                  <h3>Get Your Official 2026 Stationery Pack</h3>
                  <p>Choose your child's grade below to preview and order the exact lists approved by school teachers.</p>
                </div>

                <div className={styles.widgetSelectorArea}>
                  <div className={styles.selectWrapper}>
                    <label htmlFor="grade-select">Select Grade:</label>
                    <select
                      id="grade-select"
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                    >
                      <option value="r">Grade R</option>
                      <option value="1">Grade 1</option>
                      <option value="4">Grade 4</option>
                      <option value="7">Grade 7</option>
                    </select>
                  </div>

                  <div className={styles.packSummaryBox}>
                    <div className={styles.packHeaderLine}>
                      <h4>{activeGradePack.name}</h4>
                      <span className={styles.packPrice}>R{activeGradePack.price.toFixed(2)}</span>
                    </div>

                    <p className={styles.listTitle}>Includes {activeGradePack.items.length} teacher-approved items:</p>
                    <ul className={styles.mockItemList}>
                      {activeGradePack.items.map((item, idx) => (
                        <li key={idx}>
                          <span>✅ {item.name}</span>
                          <strong>x{item.qty}</strong>
                        </li>
                      ))}
                    </ul>

                    <div className={styles.packRebateHint}>
                      🎓 Reinvestment Value: <strong>R{(activeGradePack.price * 0.05).toFixed(2)}</strong> goes to Oakridge Development Fund
                    </div>

                    <button 
                      className={styles.widgetOrderBtn}
                      onClick={() => handleOrderPack(activeGradePack.name)}
                      type="button"
                    >
                      Configure & Order Pack
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className={styles.mockFooter}>
                <div className={styles.footerGrid}>
                  <div>
                    <h5>Oakridge Academy</h5>
                    <p>12 Oakridge Drive, Sandton, South Africa</p>
                  </div>
                  <div>
                    <h5>Partnership Hub</h5>
                    <p>Web portal powered by <a href="#" onClick={(e) => e.preventDefault()}>Pexpacks Supplies</a></p>
                  </div>
                </div>
                <div className={styles.footerBottom}>
                  <p>&copy; 2026 Oakridge Academy. All rights reserved.</p>
                </div>
              </footer>
            </div>
          )}

          {/* ────── VIEW 2: PARENT PORTAL MOCKUP ────── */}
          {activeView === "portal" && (
            <div className={styles.mockPortal}>
              {/* Portal Header */}
              <div className={styles.portalNav}>
                <div className={styles.portalLogo}>
                  <svg className={styles.mockCrest} width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 5 L90 25 V65 C90 80 50 95 50 95 C50 95 10 80 10 65 V25 L50 5 Z" fill="#1a2a40" stroke="#ff6f59" strokeWidth="4"/>
                    <path d="M50 15 L80 30 V60 C80 72 50 83 50 83 C50 83 20 72 20 60 V30 L50 15 Z" fill="#219e9a"/>
                  </svg>
                  <span>Oakridge Parent Portal</span>
                </div>
                <button className={styles.portalBackBtn} onClick={() => setActiveView("website")} type="button">
                  &larr; Back to School Site
                </button>
              </div>

              {/* Portal Checkout Success */}
              {portalCheckoutSuccess ? (
                <div className={styles.portalSuccess}>
                  <div className={styles.successIcon}>🎉</div>
                  <h3>Order Placed Successfully!</h3>
                  <p>Thank you for ordering. Your payment has been processed securely.</p>
                  
                  <div className={styles.receiptBox}>
                    <p><strong>Order Ref:</strong> #OR-2026-98124</p>
                    <p><strong>Pack:</strong> {activePortalPack.name}</p>
                    <p><strong>Options:</strong> {includeLabels ? "Name Labels (+R45)" : ""} {includePexcover ? "Pexcover Protective Wraps (+R85)" : ""}</p>
                    <p><strong>Total Paid:</strong> R{calculatePortalTotal().toFixed(2)}</p>
                    <p><strong>Fund Contribution:</strong> R{(activePortalPack.price * 0.05).toFixed(2)}</p>
                  </div>

                  <div className={styles.deliveryBadge}>
                    🚚 Packs will be delivered directly to the child's classroom before the term starts.
                  </div>

                  <button 
                    className={styles.portalSuccessBtn} 
                    onClick={() => {
                      setPortalCheckoutSuccess(false);
                      setIncludeLabels(true);
                      setIncludePexcover(false);
                    }}
                    type="button"
                  >
                    Order Another Pack
                  </button>
                </div>
              ) : (
                <div className={styles.portalLayout}>
                  <div className={styles.portalMain}>
                    <h3>Stationery Pack Customisation</h3>
                    <p>Configure options for your child's pre-packed grade stationery list.</p>

                    <div className={styles.portalStep}>
                      <label htmlFor="portal-grade-select">1. Verify Grade Pack:</label>
                      <select
                        id="portal-grade-select"
                        value={portalGrade}
                        onChange={(e) => setPortalGrade(e.target.value)}
                      >
                        <option value="r">Grade R Pack (R580.00)</option>
                        <option value="1">Grade 1 Pack (R720.00)</option>
                        <option value="4">Grade 4 Pack (R890.00)</option>
                        <option value="7">Grade 7 Pack (R1,050.00)</option>
                      </select>
                    </div>

                    <div className={styles.portalStep}>
                      <span className={styles.stepLabel}>2. Optional Pack Add-ons:</span>
                      
                      <label className={styles.portalCheckboxLabel}>
                        <input
                          type="checkbox"
                          checked={includeLabels}
                          onChange={(e) => setIncludeLabels(e.target.checked)}
                        />
                        <div className={styles.checkboxText}>
                          <strong>Pre-printed Name Labels (+R45.00)</strong>
                          <span>We print high-durability name labels and apply them to all your child's items before packing.</span>
                        </div>
                      </label>

                      <label className={styles.portalCheckboxLabel}>
                        <input
                          type="checkbox"
                          checked={includePexcover}
                          onChange={(e) => setIncludePexcover(e.target.checked)}
                        />
                        <div className={styles.checkboxText}>
                          <strong>Pexcover Protective Book Wraps (+R85.00)</strong>
                          <span>All exercise books will be wrapped in premium, heavy-duty protective slip covers.</span>
                        </div>
                      </label>
                    </div>

                    <div className={styles.portalStep}>
                      <span className={styles.stepLabel}>3. Item Breakdown ({activePortalPack.items.length} items):</span>
                      <div className={styles.portalItemsBox}>
                        {activePortalPack.items.map((item, idx) => (
                          <div className={styles.portalItemRow} key={idx}>
                            <span>{item.name}</span>
                            <strong>x{item.qty}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <aside className={styles.portalSidebar}>
                    <div className={styles.summaryStickyBox}>
                      <h4>Order Summary</h4>
                      
                      <div className={styles.summaryDetails}>
                        <div className={styles.summaryRow}>
                          <span>{activePortalPack.name}</span>
                          <span>R{activePortalPack.price.toFixed(2)}</span>
                        </div>
                        {includeLabels && (
                          <div className={styles.summaryRow}>
                            <span>Name Labels applied</span>
                            <span>R45.00</span>
                          </div>
                        )}
                        {includePexcover && (
                          <div className={styles.summaryRow}>
                            <span>Pexcover Book Wraps</span>
                            <span>R85.00</span>
                          </div>
                        )}
                        <hr className={styles.summaryDivider} />
                        <div className={`${styles.summaryRow} ${styles.summaryTotalRow}`}>
                          <span>Total Amount</span>
                          <span>R{calculatePortalTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      <div className={styles.rebateDisplay}>
                        🤝 School fund receives <strong>R{(activePortalPack.price * 0.05).toFixed(2)}</strong> from this order.
                      </div>

                      <form onSubmit={handlePortalSubmit} className={styles.checkoutForm}>
                        <div className={styles.fieldGroup}>
                          <label htmlFor="student-name">Student Full Name:</label>
                          <input type="text" id="student-name" required placeholder="e.g. John Doe" />
                        </div>
                        <div className={styles.fieldGroup}>
                          <label htmlFor="parent-email">Parent Email:</label>
                          <input type="email" id="parent-email" required placeholder="name@domain.co.za" />
                        </div>
                        <button type="submit" className={styles.portalCheckoutBtn}>
                          Proceed to Payment (R{calculatePortalTotal()})
                        </button>
                      </form>

                      <div className={styles.secureBadge}>
                        🛡️ 256-bit encrypted checkout. Powered by Pexpacks Secure.
                      </div>
                    </div>
                  </aside>
                </div>
              )}
            </div>
          )}

          {/* ────── VIEW 3: NEWS DESK MOCKUP ────── */}
          {activeView === "updates" && (
            <div className={styles.mockNewsDesk}>
              {/* News Desk Header */}
              <div className={styles.newsHeader}>
                <div className={styles.newsLogo}>
                  <svg className={styles.mockCrest} width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 5 L90 25 V65 C90 80 50 95 50 95 C50 95 10 80 10 65 V25 L50 5 Z" fill="#1a2a40" stroke="#ff6f59" strokeWidth="4"/>
                  </svg>
                  <span>Oakridge Notice Board</span>
                </div>
                <button className={styles.addNoticeTriggerBtn} onClick={() => setShowAddForm(!showAddForm)} type="button">
                  {showAddForm ? "View Notice Board" : "➕ Admin: Add Notice"}
                </button>
              </div>

              {showAddForm ? (
                <div className={styles.addNoticeFormBox}>
                  <h3>Add Notice (Admin Simulation)</h3>
                  <p>Simulate how easy it is for school administrators to post announcements on this website.</p>
                  
                  <form onSubmit={handleAddNotice}>
                    <div className={styles.formGroup}>
                      <label htmlFor="notice-title">Announcement Title:</label>
                      <input
                        type="text"
                        id="notice-title"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g., Winter Sports Day Announcement"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="notice-cat">Category:</label>
                      <select
                        id="notice-cat"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as "academic" | "sport" | "partnership")}
                      >
                        <option value="academic">Academic</option>
                        <option value="sport">Sport / Extracurricular</option>
                        <option value="partnership">Pexpacks Stationery Partnership</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="notice-content">Notice Content Detail:</label>
                      <textarea
                        id="notice-content"
                        required
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Type the full notice detail here..."
                        rows={4}
                      />
                    </div>

                    <div className={styles.formBtns}>
                      <button type="submit" className={styles.submitNoticeBtn}>
                        Publish Notice
                      </button>
                      <button type="button" className={styles.cancelNoticeBtn} onClick={() => setShowAddForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className={styles.newsDeskLayout}>
                  {/* Category filters */}
                  <div className={styles.newsFilters}>
                    <button
                      className={`${styles.filterBtn} ${newsFilter === "all" ? styles.filterBtnActive : ""}`}
                      onClick={() => setNewsFilter("all")}
                      type="button"
                    >
                      All Notices
                    </button>
                    <button
                      className={`${styles.filterBtn} ${newsFilter === "academic" ? styles.filterBtnActive : ""}`}
                      onClick={() => setNewsFilter("academic")}
                      type="button"
                    >
                      Academic
                    </button>
                    <button
                      className={`${styles.filterBtn} ${newsFilter === "sport" ? styles.filterBtnActive : ""}`}
                      onClick={() => setNewsFilter("sport")}
                      type="button"
                    >
                      Sport
                    </button>
                    <button
                      className={`${styles.filterBtn} ${newsFilter === "partnership" ? styles.filterBtnActive : ""}`}
                      onClick={() => setNewsFilter("partnership")}
                      type="button"
                    >
                      Partnership
                    </button>
                  </div>

                  {/* Notices list */}
                  <div className={styles.noticesContainer}>
                    {filteredNotices.length === 0 ? (
                      <p className={styles.noNotices}>No notices found in this category.</p>
                    ) : (
                      filteredNotices.map((notice) => (
                        <div className={styles.noticeCard} key={notice.id}>
                          <div className={styles.noticeMeta}>
                            <span className={`${styles.noticeCategoryBadge} ${styles[`badge_${notice.category}`]}`}>
                              {notice.category}
                            </span>
                            <span className={styles.noticeDate}>{notice.date}</span>
                          </div>
                          <h4>{notice.title}</h4>
                          <p>{notice.summary}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Sidebar stats */}
                  <aside className={styles.newsSidebar}>
                    <div className={styles.downloadCard}>
                      <h4>Document Downloads</h4>
                      <ul>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setWebsiteToast("Downloading School Calendar 2026..."); setTimeout(() => setWebsiteToast(null), 1500); }}>📅 2026 Academic Calendar (PDF)</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setWebsiteToast("Downloading Stationery Lists..."); setTimeout(() => setWebsiteToast(null), 1500); }}>📝 Full Grade stationery Lists (PDF)</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setWebsiteToast("Downloading School Code of Conduct..."); setTimeout(() => setWebsiteToast(null), 1500); }}>📖 Code of Conduct (PDF)</a></li>
                      </ul>
                    </div>

                    <div className={styles.sidebarStatsBox}>
                      <h4>Rebate Progress</h4>
                      <p>Track funds raised this year via stationery pack sales reinvested into school facilities.</p>
                      <div className={styles.progressBar}>
                        <div className={styles.progressBarFill} style={{ width: "65%" }}></div>
                      </div>
                      <div className={styles.progressBarLabels}>
                        <strong>R22,750 Raised</strong>
                        <span>Goal: R35,000</span>
                      </div>
                    </div>
                  </aside>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Visual bar — key stats */}
      <div className={styles.statBar}>
        <div>
          <strong>R35k</strong>
          <span>Website value</span>
        </div>
        <div>
          <strong>R0</strong>
          <span>Monthly fee</span>
        </div>
        <div>
          <strong>3 clicks</strong>
          <span>Parent checkout</span>
        </div>
        <div>
          <strong>5% rebate</strong>
          <span>School funding</span>
        </div>
      </div>
    </div>
  );
}

