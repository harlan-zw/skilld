import { defineBuildConfig } from 'obuild/config'

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: [
        './src/index.ts',
        './src/cli.ts',
        './src/types.ts',
        './src/cache/index.ts',
        './src/retriv/index.ts',
        './src/retriv/worker.ts',
        './src/agent/index.ts',
        './src/sources/index.ts',
      ],
    },
  ],
})
