module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000/"],
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready in",
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
        // Throttle to simulate a mid-tier mobile device
        throttling: {
          cpuSlowdownMultiplier: 2,
        },
      },
    },
    assert: {
      assertions: {
        // Performance: warn at 80, fail below 60
        "categories:performance": ["warn", { minScore: 0.8 }],
        // Accessibility: fail below 90
        "categories:accessibility": ["error", { minScore: 0.9 }],
        // Best Practices: warn at 85
        "categories:best-practices": ["warn", { minScore: 0.85 }],
        // SEO: fail below 90
        "categories:seo": ["error", { minScore: 0.9 }],
      },
    },
    upload: {
      // Use temporary public storage (free, no account needed)
      target: "temporary-public-storage",
    },
  },
};
