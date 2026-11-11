import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Kadras',
  tagline: 'Cloud Native Platforms Toolkit',
  favicon: 'img/favicon.ico',

  // Opt into Docusaurus v4 behavior (incl. the Rspack/SWC-based faster build)
  // to make the next major upgrade seamless.
  future: {
    v4: true,
    faster: true,
  },

  url: 'https://kadras-io.github.io',
  baseUrl: '/kadras-docs/',
  trailingSlash: true,

  // GitHub Pages deployment config.
  organizationName: 'kadras-io',
  projectName: 'kadras-docs',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
      onBrokenMarkdownImages: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/kadras-io/kadras-docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Kadras',
      logo: {
        alt: 'Kadras - Cloud Native Platforms Toolkit',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'introduction',
          position: 'left',
          label: 'Engineering Platform',
        },
        {to: '/about', label: 'About', position: 'left'},
        {
          href: 'https://github.com/kadras-io',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'About',
              to: '/about',
            },
            {
              label: 'Docs',
              to: '/docs/introduction',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Bluesky',
              href: 'https://bsky.app/profile/kadras.bsky.social',
            },
            {
              label: 'Mastodon',
              href: 'https://fosstodon.org/@kadras',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/kadras-io',
            },
            {
              label: 'Thomas Vitale',
              href: 'https://thomasvitale.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Kadras. Built by Thomas Vitale.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
