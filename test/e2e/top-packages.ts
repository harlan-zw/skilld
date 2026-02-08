/**
 * Curated list of ~200 popular npm packages for resolution crosscheck.
 * Covers diverse ecosystem categories to surface edge cases in doc resolution.
 */
export const TOP_PACKAGES: string[] = [
  // Frameworks
  'react',
  'vue',
  'angular',
  'svelte',
  'solid-js',
  'ember-source',
  'preact',
  'lit',
  'qwik',
  '@builder.io/qwik',

  // Meta-frameworks
  'next',
  'nuxt',
  '@sveltejs/kit',
  'astro',
  '@remix-run/react',
  'gatsby',
  '@angular/cli',
  'create-react-app',

  // Build tools
  'webpack',
  'rollup',
  'esbuild',
  'vite',
  'parcel',
  'turbo',
  'tsup',
  'unbuild',
  'swc',
  '@swc/core',
  'oxc',
  'rspack',
  '@rsbuild/core',

  // CSS / styling
  'tailwindcss',
  'postcss',
  'autoprefixer',
  'sass',
  'less',
  'styled-components',
  '@emotion/react',
  '@emotion/styled',
  'unocss',
  'windicss',
  '@vanilla-extract/css',

  // State management
  'redux',
  '@reduxjs/toolkit',
  'zustand',
  'pinia',
  'mobx',
  'jotai',
  'recoil',
  'xstate',
  '@tanstack/react-query',
  '@tanstack/vue-query',
  'swr',
  'valtio',
  'nanostores',

  // Routing
  'react-router',
  'react-router-dom',
  'vue-router',
  '@tanstack/react-router',

  // HTTP / server
  'express',
  'fastify',
  'koa',
  'hono',
  'h3',
  'nitro',
  'axios',
  'node-fetch',
  'got',
  'ky',
  'undici',
  'ofetch',
  'superagent',

  // Testing
  'jest',
  'vitest',
  'mocha',
  'cypress',
  'playwright',
  '@testing-library/react',
  '@testing-library/vue',
  'chai',
  'sinon',
  'ava',
  'tap',
  'happy-dom',
  'jsdom',

  // CLI
  'commander',
  'yargs',
  'inquirer',
  'chalk',
  'ora',
  'citty',
  'cac',
  '@clack/prompts',
  'prompts',
  'meow',
  'arg',
  'mri',
  'consola',

  // Utilities
  'lodash',
  'lodash-es',
  'ramda',
  'date-fns',
  'dayjs',
  'moment',
  'uuid',
  'nanoid',
  'defu',
  'destr',
  'ohash',
  'pathe',
  'ufo',
  'scule',
  'perfect-debounce',
  'mlly',
  'pkg-types',
  'local-pkg',
  'c12',
  'unenv',
  'std-env',
  'unplugin',

  // Validation
  'zod',
  'yup',
  'joi',
  'ajv',
  'superstruct',
  'valibot',
  'io-ts',
  'arktype',

  // DB / ORM
  'prisma',
  '@prisma/client',
  'drizzle-orm',
  'typeorm',
  'sequelize',
  'knex',
  'mongoose',
  'better-sqlite3',
  'pg',
  'mysql2',
  'ioredis',
  'redis',

  // Auth
  'passport',
  'jsonwebtoken',
  'bcrypt',
  'next-auth',
  'lucia',
  '@auth/core',

  // Monorepo
  'lerna',
  'nx',
  '@changesets/cli',
  'turborepo',

  // Docs / content
  '@nuxt/content',
  'nextra',
  '@docusaurus/core',
  'storybook',
  'vitepress',
  'fumadocs-core',

  // Type tools
  'typescript',
  'effect',
  'ts-morph',
  'type-fest',

  // Linting / formatting
  'eslint',
  'prettier',
  'biome',
  '@biomejs/biome',
  'oxlint',

  // Bundler plugins
  'babel',
  '@babel/core',
  '@babel/preset-env',
  'terser',
  'rollup-plugin-visualizer',
  '@vitejs/plugin-react',
  '@vitejs/plugin-vue',

  // Node.js utilities
  'fs-extra',
  'globby',
  'fast-glob',
  'chokidar',
  'execa',
  'cross-env',
  'dotenv',
  'debug',
  'pino',
  'winston',
  'morgan',

  // Markdown / parsing
  'marked',
  'remark',
  'rehype',
  'unified',
  'shiki',
  'markdown-it',
  'mdx',

  // Realtime / messaging
  'socket.io',
  'ws',
  'pusher',
  'ably',

  // GraphQL
  'graphql',
  '@apollo/client',
  'urql',
  'graphql-yoga',

  // 3D / visualization
  'three',
  'd3',
  'chart.js',
  'echarts',

  // Reactive / functional
  'rxjs',
  'fp-ts',

  // Cloud / services
  'firebase',
  '@aws-sdk/client-s3',
  'stripe',
  '@supabase/supabase-js',
  '@cloudflare/workers-types',

  // Image / media
  'sharp',
  'jimp',
  'canvas',

  // Crypto / security
  'argon2',
  'helmet',
  'cors',
  'csurf',

  // i18n
  'i18next',
  'vue-i18n',
  'react-intl',

  // Forms / UI
  'react-hook-form',
  'formik',
  '@headlessui/react',
  'radix-ui',
  '@radix-ui/react-dialog',
  'shadcn-ui',

  // Animation
  'framer-motion',
  'gsap',
  'popmotion',
  '@vueuse/motion',

  // Misc popular
  'p-limit',
  'p-queue',
  'lru-cache',
  'semver',
  'minimatch',
  'micromatch',
  'tar',
  'archiver',
  'cheerio',
  'puppeteer',
]
