export interface StorybookConfig {
  stories: string[];
  addons?: string[];
  framework?: {
    name: string;
    options?: Record<string, unknown>;
  };
  docs?: {
    autodocs?: boolean | "tag";
  };
}

const config: StorybookConfig = {
  stories: [
    "../components/admin/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../docs/**/*.mdx",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};

export default config;
