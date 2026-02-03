#!/usr/bin/env node
import { stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline'

const rl = createInterface({
  input: stdin,
  output: stdout,
})

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer)
    })
  })
}

function showIntro(): void {
  stdout.write('\n')
  stdout.write('╔════════════════════════════════════╗\n')
  stdout.write('║    Welcome to Interactive Setup    ║\n')
  stdout.write('╚════════════════════════════════════╝\n')
  stdout.write('\n')
}

async function spinner(duration: number): Promise<void> {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  const message = 'Installing dependencies'
  const startTime = Date.now()

  return new Promise((resolve) => {
    let frameIndex = 0

    const interval = setInterval(() => {
      if (Date.now() - startTime >= duration) {
        clearInterval(interval)
        stdout.write(`\r${frames[0]} ${message}... done!\n`)
        resolve()
        return
      }

      stdout.write(`\r${frames[frameIndex % frames.length]} ${message}...`)
      frameIndex++
    }, 80)
  })
}

function showCompletion(): void {
  stdout.write('\n')
  stdout.write('✓ Setup completed successfully!\n')
  stdout.write('\n')
}

async function main(): Promise<void> {
  showIntro()

  const name = await question('What is your name? ')
  stdout.write(`\nHello, ${name}!\n\n`)

  const continueAnswer = await question('Do you want to continue? (yes/no) ')

  if (continueAnswer.toLowerCase() === 'yes' || continueAnswer.toLowerCase() === 'y') {
    await spinner(2000)
    showCompletion()
  }
  else {
    stdout.write('\nSetup cancelled.\n\n')
  }

  rl.close()
}

main().catch(console.error)
