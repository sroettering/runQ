# RunQ

[![CI](https://github.com/sroettering/runq/actions/workflows/ci.yml/badge.svg)](https://github.com/sroettering/runq/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/runq.svg)](https://www.npmjs.com/package/runq)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, flexible task queue for Node.js and TypeScript that executes async tasks with configurable concurrency control.

## Features

- ⚡️ **Configurable Concurrency**: Control how many tasks run simultaneously
- 🔄 **Flexible Queueing**: Support for both FIFO (First-In-First-Out) and LIFO (Last-In-First-Out) strategies
- ⏸️ **Pause/Resume**: Pause and resume task execution on demand
- 📦 **Batch Processing**: Enqueue single tasks or batches
- 🔒 **Type-Safe**: Full TypeScript support with generic types
- 🪶 **Lightweight**: Minimal dependencies, simple API

## Installation

```bash
npm install runq
```

## Usage

### Basic Example

```typescript
import { RunQ } from 'runq';

// Create a queue with a concurrency of 3
const queue = new RunQ({ concurrency: 3 });

// Define an async task
const task = async () => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
};

// Enqueue the task
const result = await queue.enqueue(task);
console.log(result);
```

### Batch Processing

```typescript
import { RunQ } from 'runq';

const queue = new RunQ({ concurrency: 5 });

// Create multiple tasks
const tasks = [
  () => fetch('https://api.example.com/user/1').then(r => r.json()),
  () => fetch('https://api.example.com/user/2').then(r => r.json()),
  () => fetch('https://api.example.com/user/3').then(r => r.json()),
];

// Enqueue all tasks at once
const results = await queue.enqueueBatch(tasks);
console.log(results); // Array of all results
```

### FIFO vs LIFO Queueing

```typescript
import { RunQ } from 'runq';

const queue = new RunQ({ concurrency: 1 });

// FIFO (First-In-First-Out) - default behavior
await queue.enqueue(task1, 'FIFO'); // Executes first
await queue.enqueue(task2, 'FIFO'); // Executes second
await queue.enqueue(task3, 'FIFO'); // Executes third

// LIFO (Last-In-First-Out)
await queue.enqueue(task1, 'LIFO'); // Executes third
await queue.enqueue(task2, 'LIFO'); // Executes second
await queue.enqueue(task3, 'LIFO'); // Executes first
```

### Pause and Resume

```typescript
import { RunQ } from 'runq';

const queue = new RunQ({ concurrency: 2 });

// Enqueue some tasks
queue.enqueue(task1);
queue.enqueue(task2);

// Pause the queue (running tasks will complete, but no new tasks will start)
queue.pause();

// Later... resume processing
queue.resume();
```

### Error Handling

```typescript
import { RunQ } from 'runq';

const queue = new RunQ({ concurrency: 3 });

// Single task error handling
try {
  const result = await queue.enqueue(async () => {
    throw new Error('Task failed');
  });
} catch (error) {
  console.error('Task failed:', error);
}

// Batch error handling - if any task fails, the whole batch rejects
try {
  const results = await queue.enqueueBatch([task1, task2, task3]);
} catch (error) {
  console.error('One or more tasks failed:', error);
}
```

### TypeScript Support

```typescript
import { RunQ } from 'runq';

// Strongly typed queue
const queue = new RunQ<string>({ concurrency: 5 });

// Type-safe tasks
const task = async (): Promise<string> => {
  return 'Hello, World!';
};

const result: string = await queue.enqueue(task);
```

## API Reference

### `new RunQ(options)`

Creates a new task queue instance.

**Options:**
- `concurrency` (number): Maximum number of tasks to run concurrently. Default: `5`

**Example:**
```typescript
const queue = new RunQ({ concurrency: 10 });
```

### `enqueue(task, queueingBehavior?)`

Enqueues a single task for execution.

**Parameters:**
- `task` (Task<T>): An async function that returns a Promise
- `queueingBehavior` ('FIFO' | 'LIFO'): Queueing strategy. Default: `'FIFO'`

**Returns:** `Promise<T>` - Resolves with the task result

**Example:**
```typescript
const result = await queue.enqueue(async () => {
  return 'Task result';
});
```

### `enqueueBatch(tasks, queueingBehavior?)`

Enqueues multiple tasks for execution.

**Parameters:**
- `tasks` (Task<T>[]): Array of async functions that return Promises
- `queueingBehavior` ('FIFO' | 'LIFO'): Queueing strategy. Default: `'FIFO'`

**Returns:** `Promise<T[]>` - Resolves with an array of all task results. Rejects if any task fails.

**Example:**
```typescript
const results = await queue.enqueueBatch([task1, task2, task3]);
```

### `pause()`

Pauses the queue. Currently running tasks will complete, but no new tasks will be started until the queue is resumed.

**Example:**
```typescript
queue.pause();
```

### `resume()`

Resumes a paused queue. Queued tasks will begin executing again according to the concurrency limit.

**Example:**
```typescript
queue.resume();
```

## Use Cases

### Rate Limiting API Requests

```typescript
const queue = new RunQ({ concurrency: 3 });

const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const tasks = userIds.map(id => 
  () => fetch(`https://api.example.com/users/${id}`).then(r => r.json())
);

// Only 3 requests will run at a time
const users = await queue.enqueueBatch(tasks);
```

### Database Operations

```typescript
const queue = new RunQ({ concurrency: 5 });

const records = await queue.enqueueBatch([
  () => db.users.create({ name: 'Alice' }),
  () => db.users.create({ name: 'Bob' }),
  () => db.users.create({ name: 'Charlie' }),
]);
```

### File Processing

```typescript
const queue = new RunQ({ concurrency: 4 });

const files = ['file1.txt', 'file2.txt', 'file3.txt'];

const tasks = files.map(file =>
  async () => {
    const content = await fs.readFile(file, 'utf-8');
    const processed = processContent(content);
    await fs.writeFile(`processed-${file}`, processed);
    return `Processed ${file}`;
  }
);

await queue.enqueueBatch(tasks);
```

## License

MIT © runq contributors

## Contributing

Contributions are welcome! This is an open-source project and everyone can clone and adjust it to their needs.

