import { defineBuildConfig } from 'obuild/config'

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: [
        './src/index.ts',
        './src/cli.ts',
        './src/types.ts',
        './src/split-text.ts',
        './src/npm.ts',
        './src/agents.ts',
      ],
    },
  ],
})
