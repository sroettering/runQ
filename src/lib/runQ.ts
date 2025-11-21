import { debug } from 'node:util';
import { RunQOptions, Task } from './types';
import { Worker } from './worker';

/**
 * A task queue that executes tasks with configurable concurrency.
 * Tasks can be enqueued individually or in batches and will be executed
 * according to the specified queueing behavior (FIFO or LIFO).
 *
 * @template T The type of the result returned by tasks in the queue
 */
export class RunQ<T> {
    private queuedTasks: Array<Worker<T>> = [];
    private runningTasks = 0;
    private isRunning = true;
    private readonly options: RunQOptions = {
        concurrency: 5,
    };
    private logger = debug('runQ');

    /**
     * Creates a new RunQ instance with the specified options.
     *
     * @param options Configuration options for the queue
     * @param options.concurrency Maximum number of tasks to run concurrently (default: 5)
     */
    constructor(options: Partial<RunQOptions>) {
        this.options = {
            ...this.options,
            ...options,
        };
        this.debugLog(`Queue created with options: ${JSON.stringify(options)}`);
    }

    /**
     * Enqueues a single task to be executed by the queue.
     *
     * @param task The task to be executed
     * @param queueingBehavior The queueing strategy - 'FIFO' (first-in-first-out) or 'LIFO' (last-in-first-out). Defaults to 'FIFO'
     * @returns A promise that resolves with the task result when the task completes
     */
    public enqueue(task: Task<T>, queueingBehavior: 'FIFO' | 'LIFO' = 'FIFO'): Promise<T> {
        return this.enqueueBatch([task], queueingBehavior).then((results) => results[0]);
    }

    /**
     * Enqueues multiple tasks to be executed by the queue.
     *
     * @param tasks An array of tasks to be executed
     * @param queueingBehavior The queueing strategy - 'FIFO' (first-in-first-out) or 'LIFO' (last-in-first-out). Defaults to 'FIFO'
     * @returns A promise that resolves with an array of task results when all tasks complete. If at least one task fails the returned Promise is rejected
     */
    public enqueueBatch(tasks: Task<T>[], queueingBehavior: 'FIFO' | 'LIFO' = 'FIFO'): Promise<T[]> {
        const workers = tasks.map((task) => new Worker(task));

        for (const worker of workers) {
            if (queueingBehavior === 'FIFO') {
                this.queuedTasks.push(worker);
            } else {
                this.queuedTasks.unshift(worker);
            }
        }
        this.debugLog(`Enqueued ${tasks.length} new tasks. New queue length: ${this.queuedTasks.length}`);

        this.flush();

        return Promise.all(workers.map(({ workerPromise }) => workerPromise));
    }

    /**
     * Pauses the execution of queued tasks.
     * Currently running tasks will complete, but no new tasks will be started
     * until the queue is resumed.
     */
    public pause() {
        this.isRunning = false;
        this.debugLog(`Queue paused`);
    }

    /**
     * Resumes the execution of queued tasks after the queue has been paused.
     * Queued tasks will begin executing again according to the concurrency limit.
     */
    public resume() {
        this.isRunning = true;
        this.debugLog(`Queue resumed`);
        this.flush();
    }

    private flush() {
        while (this.isRunning && this.queuedTasks.length && this.runningTasks < this.options.concurrency) {
            this.runTask(this.queuedTasks.shift()!);
        }
    }

    private runTask(worker: Worker<T>) {
        this.runningTasks++;

        const done = () => {
            this.debugLog(`${worker}`);
            return this.completeTask();
        };

        this.debugLog('Starting task');
        worker.run().then(done, done);
    }

    private completeTask() {
        this.runningTasks--;
        this.flush();

        if (!this.queuedTasks.length) {
            this.debugLog(`Queue completed`);
        }
    }

    private debugLog(message: string) {
        this.logger(`[RunQ | ${new Date().toISOString()}]: ${message}`);
    }
}
