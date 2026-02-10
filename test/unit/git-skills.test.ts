import { join } from 'pathe'
import { describe, expect, it } from 'vitest'
import { fetchGitSkills, parseGitSkillInput, parseSkillFrontmatterName } from '../../src/sources/git-skills'

describe('git-skills', () => {
  describe('parseGitSkillInput', () => {
    it('returns null for scoped npm packages', () => {
      expect(parseGitSkillInput('@scope/pkg')).toBeNull()
      expect(parseGitSkillInput('@vue/compiler-sfc')).toBeNull()
      expect(parseGitSkillInput('@nuxt/kit')).toBeNull()
    })

    it('returns null for simple npm package names', () => {
      expect(parseGitSkillInput('vue')).toBeNull()
      expect(parseGitSkillInput('nuxt')).toBeNull()
      expect(parseGitSkillInput('lodash')).toBeNull()
    })

    it('parses GitHub shorthand (owner/repo)', () => {
      expect(parseGitSkillInput('vercel-labs/agent-skills')).toEqual({
        type: 'github',
        owner: 'vercel-labs',
        repo: 'agent-skills',
      })
      expect(parseGitSkillInput('nuxt/nuxt')).toEqual({
        type: 'github',
        owner: 'nuxt',
        repo: 'nuxt',
      })
    })

    it('parses GitHub HTTPS URLs', () => {
      expect(parseGitSkillInput('https://github.com/vercel-labs/agent-skills')).toEqual({
        type: 'github',
        owner: 'vercel-labs',
        repo: 'agent-skills',
      })
    })

    it('parses GitHub URLs with .git suffix', () => {
      expect(parseGitSkillInput('https://github.com/owner/repo.git')).toEqual({
        type: 'github',
        owner: 'owner',
        repo: 'repo',
      })
    })

    it('parses GitHub tree URLs with ref and skill path', () => {
      const result = parseGitSkillInput('https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines')
      expect(result).toEqual({
        type: 'github',
        owner: 'vercel-labs',
        repo: 'agent-skills',
        ref: 'main',
        skillPath: 'skills/web-design-guidelines',
      })
    })

    it('parses GitHub tree URLs with just ref', () => {
      const result = parseGitSkillInput('https://github.com/owner/repo/tree/develop')
      expect(result).toEqual({
        type: 'github',
        owner: 'owner',
        repo: 'repo',
        ref: 'develop',
      })
    })

    it('parses GitLab URLs', () => {
      expect(parseGitSkillInput('https://gitlab.com/owner/repo')).toEqual({
        type: 'gitlab',
        owner: 'owner',
        repo: 'repo',
      })
    })

    it('parses SSH git@ URLs', () => {
      expect(parseGitSkillInput('git@github.com:owner/repo.git')).toEqual({
        type: 'github',
        owner: 'owner',
        repo: 'repo',
      })
      expect(parseGitSkillInput('git@github.com:vercel-labs/agent-skills')).toEqual({
        type: 'github',
        owner: 'vercel-labs',
        repo: 'agent-skills',
      })
    })

    it('parses local paths starting with ./', () => {
      const result = parseGitSkillInput('./test/fixtures/mock-skills-repo')
      expect(result).toEqual({
        type: 'local',
        localPath: expect.stringContaining('test/fixtures/mock-skills-repo'),
      })
    })

    it('parses local paths starting with ../', () => {
      const result = parseGitSkillInput('../other-repo')
      expect(result).toEqual({
        type: 'local',
        localPath: expect.stringContaining('other-repo'),
      })
    })

    it('parses absolute paths', () => {
      const result = parseGitSkillInput('/tmp/skills-repo')
      expect(result).toEqual({
        type: 'local',
        localPath: '/tmp/skills-repo',
      })
    })

    it('parses ~ home paths', () => {
      const result = parseGitSkillInput('~/projects/skills')
      expect(result).toEqual({
        type: 'local',
        localPath: expect.stringContaining('projects/skills'),
      })
    })

    it('returns null for non-matching URLs', () => {
      expect(parseGitSkillInput('https://example.com/something')).toBeNull()
      expect(parseGitSkillInput('https://bitbucket.org/owner/repo')).toBeNull()
    })
  })

  describe('parseSkillFrontmatterName', () => {
    it('extracts name and description from frontmatter', () => {
      const content = `---
name: web-design-guidelines
description: Guidelines for web design best practices
---

# Web Design Guidelines
`
      expect(parseSkillFrontmatterName(content)).toEqual({
        name: 'web-design-guidelines',
        description: 'Guidelines for web design best practices',
      })
    })

    it('returns empty object when no frontmatter', () => {
      expect(parseSkillFrontmatterName('# Just a heading')).toEqual({})
      expect(parseSkillFrontmatterName('')).toEqual({})
    })

    it('handles frontmatter with only name', () => {
      const content = `---
name: my-skill
---
`
      expect(parseSkillFrontmatterName(content)).toEqual({
        name: 'my-skill',
      })
    })

    it('handles frontmatter with extra fields', () => {
      const content = `---
name: test
description: A test skill
version: 1.0.0
author: someone
---
`
      const result = parseSkillFrontmatterName(content)
      expect(result.name).toBe('test')
      expect(result.description).toBe('A test skill')
    })
  })

  describe('fetchGitSkills (local)', () => {
    const fixtureDir = join(__dirname, '../fixtures/mock-skills-repo')

    it('discovers skills from local skills/ directory', async () => {
      const { skills } = await fetchGitSkills({ type: 'local', localPath: fixtureDir })
      expect(skills.length).toBe(2)

      const names = skills.map(s => s.name).sort()
      expect(names).toEqual(['another-skill', 'test-skill'])
    })

    it('parses frontmatter from local skills', async () => {
      const { skills } = await fetchGitSkills({ type: 'local', localPath: fixtureDir })
      const testSkill = skills.find(s => s.name === 'test-skill')
      expect(testSkill?.description).toBe('A test skill for unit tests')
      expect(testSkill?.content).toContain('# Test Skill')
    })

    it('returns empty for nonexistent path', async () => {
      const { skills } = await fetchGitSkills({ type: 'local', localPath: '/nonexistent/path' })
      expect(skills).toEqual([])
    })

    it('includes skill path relative to repo', async () => {
      const { skills } = await fetchGitSkills({ type: 'local', localPath: fixtureDir })
      const testSkill = skills.find(s => s.name === 'test-skill')
      expect(testSkill?.path).toBe('skills/test-skill')
    })
  })
})
