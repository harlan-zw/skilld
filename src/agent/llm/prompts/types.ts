/**
 * Prompt types
 */

export interface PromptPreset {
  id: string
  name: string
  description: string
  build: (packageName: string, packageDocs: string) => string
}
