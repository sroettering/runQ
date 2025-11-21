// Test TypeScript types compilation
import { RunQ } from './dist/index.js';
import type { Task, RunQOptions } from './dist/index.js';

// Test type inference
const queue = new RunQ<string>({ concurrency: 2 });

// Test typed task
const typedTask: Task<string> = async () => {
  return 'typed result';
};

// Test options type
const options: RunQOptions = {
  concurrency: 5
};

const queue2 = new RunQ<number>(options);

// Test method types
const result: Promise<string> = queue.enqueue(typedTask);

// Test batch with types
const tasks: Task<string>[] = [
  async () => 'result1',
  async () => 'result2'
];

const results: Promise<string[]> = queue.enqueueBatch(tasks);

// Test pause/resume types
queue.pause();
queue.resume();

// Test queueing behavior parameter
queue.enqueue(typedTask, 'FIFO');
queue.enqueue(typedTask, 'LIFO');
queue.enqueueBatch(tasks, 'FIFO');
queue.enqueueBatch(tasks, 'LIFO');

// Test with different return types
const numberQueue = new RunQ<number>({ concurrency: 3 });
const numberTask: Task<number> = async () => 42;
const numberResult: Promise<number> = numberQueue.enqueue(numberTask);

// If this compiles without errors, all type tests pass
export {};

