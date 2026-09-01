"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  HelpCircle,
  MessageSquareQuote,
  FileText,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type {
  CmsAnnouncementRow,
  CmsFaqRow,
  CmsTestimonialRow,
  CmsResourceRow,
} from "@/lib/admin/content";
import { AnnouncementsTab } from "./AnnouncementsTab";
import { FaqsTab } from "./FaqsTab";
import { TestimonialsTab } from "./TestimonialsTab";
import { ResourcesTab } from "./ResourcesTab";
import styles from "./CmsContentManager.module.css";

interface UnifiedCmsViewProps {
  metrics: {
    announcementsCount: number;
    activeAnnouncementsCount: number;
    faqsCount: number;
    publishedFaqsCount: number;
    testimonialsCount: number;
    featuredTestimonialsCount: number;
    resourcesCount: number;
    publicResourcesCount: number;
  };
  announcements: CmsAnnouncementRow[];
  faqs: CmsFaqRow[];
  testimonials: CmsTestimonialRow[];
  resources: CmsResourceRow[];
}

export function UnifiedCmsView({
  metrics,
  announcements,
  faqs,
  testimonials,
  resources,
}: UnifiedCmsViewProps) {
  const [activeTab, setActiveTab] = useState<"announcements" | "faqs" | "testimonials" | "resources">("announcements");

  return (
    <div className={styles.cmsRoot}>
      {/* KPI Metrics Ribbon */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Eyebrow Banners</span>
            <div className={styles.metricIcon}>
              <Megaphone size={18} />
            </div>
          </div>
          <div className={styles.metricValue}>{metrics.activeAnnouncementsCount}</div>
          <span className={styles.metricSubtext}>
            {metrics.announcementsCount} total configured
          </span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Live FAQs</span>
            <div className={styles.metricIcon}>
              <HelpCircle size={18} />
            </div>
          </div>
          <div className={styles.metricValue}>{metrics.publishedFaqsCount}</div>
          <span className={styles.metricSubtext}>
            {metrics.faqsCount} total questions
          </span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Social Proof</span>
            <div className={styles.metricIcon}>
              <MessageSquareQuote size={18} />
            </div>
          </div>
          <div className={styles.metricValue}>{metrics.featuredTestimonialsCount}</div>
          <span className={styles.metricSubtext}>
            {metrics.testimonialsCount} parent/school reviews
          </span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Resource Hub</span>
            <div className={styles.metricIcon}>
              <FileText size={18} />
            </div>
          </div>
          <div className={styles.metricValue}>{metrics.publicResourcesCount}</div>
          <span className={styles.metricSubtext}>
            {metrics.resourcesCount} parent guides & kits
          </span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className={styles.tabsContainer}>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "announcements" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("announcements")}
        >
          <Megaphone size={16} />
          <span>Announcements & Eyebrows</span>
          <span className={styles.tabBadge}>{announcements.length}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "faqs" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("faqs")}
        >
          <HelpCircle size={16} />
          <span>Frequently Asked Questions</span>
          <span className={styles.tabBadge}>{faqs.length}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "testimonials" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("testimonials")}
        >
          <MessageSquareQuote size={16} />
          <span>Testimonials & Social Proof</span>
          <span className={styles.tabBadge}>{testimonials.length}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "resources" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("resources")}
        >
          <FileText size={16} />
          <span>Resource Hub Downloads</span>
          <span className={styles.tabBadge}>{resources.length}</span>
        </button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <Link
            href="/admin/content/sections"
            className={styles.tabButton}
            style={{ border: "1px dashed rgba(51, 65, 85, 0.8)" }}
          >
            <Layers size={14} />
            <span>Marketing Copy Sections</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Active Tab Panel */}
      <div>
        {activeTab === "announcements" && <AnnouncementsTab initialAnnouncements={announcements} />}
        {activeTab === "faqs" && <FaqsTab initialFaqs={faqs} />}
        {activeTab === "testimonials" && <TestimonialsTab initialTestimonials={testimonials} />}
        {activeTab === "resources" && <ResourcesTab initialResources={resources} />}
      </div>
    </div>
  );
}
