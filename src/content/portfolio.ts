/**
 * ─────────────────────────────────────────────────────────────
 *  NIHĀN Studios — all site content lives here.
 *
 *  To add portfolio work: drop images into /public/assets/<section>/
 *  and add a project entry below. The 3D gates pick up the images
 *  automatically (apps → phone screens, games → screen ring,
 *  web → browser windows, ai → orbiting cards).
 * ─────────────────────────────────────────────────────────────
 */

export type SectionId = 'ai' | 'apps' | 'games' | 'web';

export interface Project {
  title: string;
  slug?: string;
  repository?: string;
  hackathon?: string;
  status?: string;
  releaseDate?: string;
  type: string;
  summary: string;
  images: string[];
  video?: string;
  /** 'portrait' for phone screenshots, 'landscape' (default) for everything else */
  orientation?: 'landscape' | 'portrait';
  link?: string;
  linkLabel?: string;
}

export interface Service {
  title: string;
  text: string;
}

export interface PortfolioSection {
  id: SectionId;
  index: string;
  name: string;
  nav: string;
  kicker: string;
  intro: string;
  tags: string[];
  hint: string;
  services: Service[];
  projects: Project[];
}

export const site = {
  email: 'hello@nihanstudios.com',
  github: 'https://github.com/AnasAliK',
  tagline: 'Beyond the known.',
  mission: 'We create worlds worth looking beyond the door for.',
};

const makinz: Project = {
  title: 'MakinZ',
  slug: 'mackinz',
  status: 'Available in early access',
  releaseDate: 'December 2026',
  type: 'Mobile app · Habits & wellness',
  summary:
    'A quest-driven habits and wellness app. Complete healthy routines, earn XP and coins, track nutrition and level up a polar-bear explorer through a playful mobile interface.',
  orientation: 'portrait',
  images: [1, 2, 3, 4, 5, 6, 7].map((n) => `/assets/apps/mackinz-${n}.jpg`),
};

const omnipitch: Project = {
  title: 'OmniPitch AI',
  hackathon: 'Google AI Seekho Hackathon',
  type: 'React Native · Expo · Football management',
  summary:
    'A cross-platform football management app built with React Native, Expo and TypeScript. Expo Router connects squad dashboards, training schedules, scenarios and agent traces, while React Context keeps training changes in sync and Reanimated powers interface transitions.',
  orientation: 'portrait',
  images: [1, 2, 3, 4, 5, 6, 7].map((n) => `/assets/apps/omnipitch-${n}.png`),
  repository: 'https://github.com/AnasAliK/OmniPitch-AI',
};

const mimaar: Project = {
  title: 'Mimaar AI',
  hackathon: 'Meta AI Developer Hackathon',
  type: 'React · TypeScript · Construction & real estate',
  summary:
    'A responsive site-analysis web application built with React, TypeScript and Vite, with GSAP animations and a Python backend. Upload individual site photos or a whole room, inspect interactive overlays, edit quantities and vendor price lists, and export PDF quotations. English, Urdu and Arabic reports, right-to-left layouts and searchable analysis history support the full workflow.',
  images: [1, 2, 3, 4, 5, 6].map((n) => `/assets/web/mimaar-${n}.jpg`),
  video: '/assets/web/mimaar-demo.mp4',
  repository: 'https://github.com/HafizAnas-101Dev/Mimaar-AI',
};

const chatbot: Project = {
  title: 'AI Chatbot',
  type: 'Python · Gradio · Conversational web interface',
  summary:
    'A browser-based chat application built in Python with Gradio. Its web interface connects user messages to the OpenAI API and presents responses in a conversational workflow.',
  images: [
    '/assets/web/chatbot-desktop.png',
    '/assets/web/chatbot-conversation.png',
    '/assets/web/chatbot-mobile.png',
  ],
  repository: 'https://github.com/AnasAliK/AI-Chatbot',
};

export const portfolio: PortfolioSection[] = [
  {
    id: 'games',
    index: '01',
    name: 'Games',
    nav: 'Games',
    kicker: 'Worlds worth exploring',
    intro:
      'From survival shooters and competitive arenas to timed puzzles and MakinZ’s wellness adventure — games built around movement, choices, rewards and progression.',
    tags: ['Unreal Engine', 'Gameplay systems', 'Animation & locomotion', 'Level design'],
    hint: 'Click a screen to open the game',
    services: [],
    projects: [
      {
        title: 'Zombie Wave Survival',
        type: 'First-person shooter',
        summary:
          'Hold the line on a coastal bridge against escalating waves of the undead. Limited ammo, makeshift barricades, nowhere to run.',
        images: [
          ...[1, 2, 3, 4, 5, 6].map((n) => `/assets/games/zombie-new-${n}.png`),
          ...[1, 2].map((n) => `/assets/games/zombie-${n}.jpg`),
        ],
      },
      {
        title: 'GASP × Lyra',
        type: 'Third-person team shooter · Motion-matched movement',
        summary:
          'A fast-paced team arena shooter rebuilt on fluid, motion-matched locomotion — capture points and tight gunplay, with traversal and vaulting that feel alive.',
        images: [1, 2, 3, 4, 5, 6, 7].map((n) => `/assets/games/gasp-lyra-recording-${n}.jpg`),
        video: '/assets/games/gasp-lyra-recording.mp4',
      },
      {
        ...makinz,
        type: 'Mobile game · Quests & progression',
        summary:
          'A cosy wellness adventure that turns healthy routines into quests. Complete challenges, collect XP and coins, and level up a polar-bear explorer. Its rewards and character progression make everyday habits part of a playful journey.',
      },
      {
        title: 'Typo Panic',
        type: 'Timed text puzzle · Comedy',
        summary:
          'A fast-paced text puzzle game where every second counts. Step into the role of a virtual assistant and fix chaotic, embarrassing messages before they cause trouble. The challenge combines quick reading, fast corrections and comic situations.',
        images: ['/assets/portfolio/image_cover.jpg'],
        link: 'https://assassinx0.itch.io/typo-panic',
      },
      {
        title: 'Anxious Antic',
        type: 'Game concept · Planned for Unity',
        status: 'Concept — planned for development in Unity',
        summary:
          'A timed comedy game concept planned for development in Unity. The idea is a frantic twenty-second rush through awkward, hilarious social moments, with short rounds turning everyday social pressure into a quick burst of playful chaos.',
        images: ['/assets/portfolio/Anx_Cover.jpg'],
        link: 'https://assassinx0.itch.io/anxious-antic',
      },
    ],
  },
  {
    id: 'ai',
    index: '02',
    name: 'Artificial Intelligence',
    nav: 'AI',
    kicker: 'The mind behind the veil',
    intro:
      'Intelligent systems that see the patterns the eye cannot — assistants, agents and automation woven quietly into the products people use every day.',
    tags: ['AI assistants & agents', 'Automation', 'Computer vision', 'Data & insight'],
    hint: 'Or click the summit',
    services: [
      { title: 'Assistants & agents', text: 'Conversational assistants and task agents built on modern language models, grounded in your data.' },
      { title: 'Automation', text: 'Workflows that read, decide and act — removing the repetitive work hidden inside your business.' },
      { title: 'Vision & perception', text: 'Image and video understanding for apps, games and real-world operations.' },
      { title: 'Data & insight', text: 'Turning raw data into dashboards, predictions and decisions you can trust.' },
    ],
    // Shared media and identity, with descriptions tailored to this category.
    // Use this pattern when adding projects that belong to multiple categories.
    projects: [
      {
        ...mimaar,
        type: 'AI · Computer vision & multilingual site analysis',
        summary:
          'An AI pipeline for construction and real-estate photos. SAM segmentation identifies surfaces, openings and possible defects, while measurement and pricing code calculates quantities and cost ranges. Muse models interpret findings and write reports in English, Urdu or Arabic. Confidence labels, evidence traces and editable detections make the results reviewable. Outputs are rough estimates rather than engineering or safety assessments.',
      },
      {
        ...omnipitch,
        type: 'AI · Football performance analysis & training automation',
        summary:
          'An autonomous coaching assistant built around an Observe, Orient, Decide, Act loop. Its analysis engine compares player metrics against positional thresholds, flags technical, physical and tactical anomalies, and assigns confidence scores. An intervention generator adjusts individual training sessions, while agent traces explain each decision. The prototype combines real squad rosters with synthetic performance statistics.',
      },
      {
        ...chatbot,
        type: 'AI · Conversational assistant',
        summary:
          'A conversational AI project connecting a Python application to the OpenAI API. Users enter natural-language messages and receive model-generated replies, exploring language-model integration through an accessible chat experience.',
      },
    ],
  },
  {
    id: 'apps',
    index: '03',
    name: 'Applications',
    nav: 'Apps',
    kicker: 'Tools that live in your pocket',
    intro:
      'Applications for everyday progress — from OmniPitch’s AI-assisted football coaching workflows to MakinZ’s quest-driven habits and wellness.',
    tags: ['iOS & Android', 'Cross-platform', 'UI / UX design', 'Backend & APIs'],
    hint: 'Or click the summit',
    services: [
      { title: 'Product design', text: 'Research, flows and polished interfaces people enjoy returning to.' },
      { title: 'Mobile', text: 'Native-feeling iOS and Android apps from a single, maintainable codebase.' },
      { title: 'Backend', text: 'Accounts, sync, payments and APIs that scale with your users.' },
      { title: 'Launch', text: 'Store listings, analytics and the iterations that follow.' },
    ],
    projects: [
      omnipitch,
      makinz,
      {
        title: 'App Prototype',
        type: 'Figma · Application interface design',
        summary:
          'An application interface prototype designed in Figma for Alpha Gaming Store. The project explores the visual design and screen layouts of a gaming-store app before implementation.',
        orientation: 'portrait',
        images: ['/assets/apps/alpha-store-home.png', '/assets/apps/alpha-store-favorites.png'],
        link: 'https://www.figma.com/design/u76NacyGso60cq5InDSyut/Alpha-Gaming-Store?node-id=0-1',
        linkLabel: 'View Figma design',
      },
    ],
  },
  {
    id: 'web',
    index: '04',
    name: 'Websites',
    nav: 'Websites',
    kicker: 'Gateways to your world',
    intro:
      'Fast, cinematic websites — from elegant landing pages to full platforms. Like the one you are travelling through right now.',
    tags: ['Interactive 3D / WebGL', 'Web apps', 'E-commerce', 'Performance & SEO'],
    hint: 'Hover the summit to unfold it',
    services: [
      { title: 'Immersive 3D', text: 'WebGL experiences, scroll-driven storytelling and interactive product showcases.' },
      { title: 'Web applications', text: 'Dashboards, portals and platforms with clean architecture and fast interfaces.' },
      { title: 'Brand sites & stores', text: 'Landing pages, portfolios and e-commerce that carry your identity with care.' },
      { title: 'Performance', text: 'Lightweight, accessible, search-friendly — and hosted wherever you need.' },
    ],
    projects: [
      mimaar,
      {
        title: 'Alpha Store',
        type: 'E-commerce · Gaming accessories',
        summary:
          'A web storefront for gaming accessories, bringing the store’s products into an online shopping interface. The project presents a gaming-focused retail experience with its implementation available in the linked repository.',
        images: ['/assets/portfolio/alphastore.png'],
        repository: 'https://github.com/AnasAliK/Gaming-Accessories-Store',
      },
      chatbot,
      {
        title: 'Cognitive Cleanse',
        type: 'Next.js · Web application',
        summary:
          'A web project built with Next.js and React. Its implementation uses the Next.js App Router and a reusable component structure to organise the site’s interface and pages.',
        images: ['home', 'dashboard', 'cleanse', 'join', 'support'].map(
          (screen) => `/assets/web/cognitive-${screen}-desktop.png`,
        ),
        repository: 'https://github.com/AnasAliK/CognitiveCleanse',
      },
    ],
  },
];

export const sectionById = Object.fromEntries(portfolio.map((s) => [s.id, s])) as Record<SectionId, PortfolioSection>;

export function projectSlug(p: Project) {
  if (p.slug) return p.slug;
  return p.title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const sectionHref = (id: SectionId) => `/work/${id}`;
export const projectHref = (id: SectionId, p: Project) => `/work/${id}/${projectSlug(p)}`;
