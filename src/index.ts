import * as core from '@actions/core';
import { parseInputs, runAction } from './executor';

export async function run(): Promise<void> {
  try {
    const inputs = parseInputs();
    await runAction(inputs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.toString() : String(error);
    core.setFailed(message);
  }
}

if (process.env.NODE_ENV !== 'test') {
  void run();
}
