import { setTimeout as waitFor } from 'node:timers/promises';
import { Task } from './types';
import { WorkerQueue } from './workerQueue';

describe('WorkerQueue', () => {
    it('should handle a single task that completes', async () => {
        const queue = new WorkerQueue({ concurrency: 1 });

        const result = await queue.enqueue(aTask({ result: 'Executed' }));

        expect(result).toEqual('Executed');
    });

    it('should handle a single task that fails', async () => {
        const queue = new WorkerQueue({ concurrency: 1 });

        const result = queue.enqueue(aTask({ rejection: 'Failed' }));

        await expect(result).rejects.toEqual('Failed');
    });

    it('should handle multiple tasks coming in with delays (no concurrency)', async () => {
        const queue = new WorkerQueue<number>({ concurrency: 1 });
        const expectedResults = [0, 1, 2];
        const resultsInOrder: number[] = [];

        const task1 = queue.enqueue(aTask({ result: 0 })).then(res => resultsInOrder.push(res));
        await waitFor(10);
        const task2 = queue.enqueue(aTask({ result: 1, delay: 50 })).then(res => resultsInOrder.push(res));
        await waitFor(10);
        const task3 = queue.enqueue(aTask({ result: 2, delay: 10 })).then(res => resultsInOrder.push(res));

        await Promise.all([task1, task2, task3]);

        expect(resultsInOrder).toEqual(expectedResults);
    });

    it('should handle multiple tasks coming in with delays (with concurrency)', async () => {
        const queue = new WorkerQueue<number>({ concurrency: 3 });
        const expectedResults = [0, 2, 1];
        const resultsInOrder: number[] = [];

        const task1 = queue.enqueue(aTask({ result: 0 })).then(res => resultsInOrder.push(res));
        await waitFor(10);
        const task2 = queue.enqueue(aTask({ result: 1, delay: 50 })).then(res => resultsInOrder.push(res));
        await waitFor(10);
        const task3 = queue.enqueue(aTask({ result: 2, delay: 10 })).then(res => resultsInOrder.push(res));

        await Promise.all([task1, task2, task3]);

        expect(resultsInOrder).toEqual(expectedResults);
    });

    it('should execute a single task', async () => {
        const queue = new WorkerQueue({ concurrency: 1 });

        const result = await queue.enqueueBatch([aTask({ result: 'Executed' })]);

        expect(result).toEqual(['Executed']);
    });

    it('should execute multiple tasks without concurrency', async () => {
        const queue = new WorkerQueue({ concurrency: 1 });

        const result = await queue.enqueueBatch([
            aTask({ result: 'Executed 1' }),
            aTask({ result: 'Executed 2' }),
            aTask({ result: 'Executed 3' }),
        ]);

        expect(result).toEqual(['Executed 1', 'Executed 2', 'Executed 3']);
    });

    it('should execute multiple tasks with concurrency', async () => {
        const queue = new WorkerQueue({ concurrency: 3 });

        const result = await queue.enqueueBatch([
            aTask({ result: 'Executed 1' }),
            aTask({ result: 'Executed 2' }),
            aTask({ result: 'Executed 3' }),
        ]);

        expect(result).toEqual(['Executed 1', 'Executed 2', 'Executed 3']);
    });

    it('should execute multiple tasks with concurrency and timeouts', async () => {
        const queue = new WorkerQueue({ concurrency: 3 });

        const now = Date.now();

        const result = await queue.enqueueBatch([
            aTask({ result: 'Executed 1', delay: 50 }),
            aTask({ result: 'Executed 2', delay: 10 }),
            aTask({ result: 'Executed 3', delay: 30 }),
        ]);

        expect(Date.now() - now).toBeLessThan(90);
        expect(result).toEqual(['Executed 1', 'Executed 2', 'Executed 3']);
    });

    it('should execute multiple tasks and reject if any fail', async () => {
        const queue = new WorkerQueue({ concurrency: 3 });

        const result = queue.enqueueBatch([
            aTask({ result: 'Executed 1', delay: 5 }),
            aTask({ rejection: 'Rejected 2', delay: 1 }),
            aTask({ result: 'Executed 3', delay: 3 }),
        ]);

        await expect(result).rejects.toEqual('Rejected 2');
    });

    it('should only reject results from one queue call', async () => {
        const queue = new WorkerQueue({ concurrency: 3 });

        const result1 = queue.enqueueBatch([
            aTask({ result: 'Executed 1', delay: 5 }),
            aTask({ rejection: 'Rejected 2', delay: 1 }),
        ]);

        const result2 = queue.enqueueBatch([
            aTask({ result: 'Resolved 1', delay: 5 }),
            aTask({ result: 'Resolved 2', delay: 1 }),
        ]);

        await expect(result1).rejects.toEqual('Rejected 2');
        await expect(result2).resolves.toEqual(['Resolved 1', 'Resolved 2']);
    });

    it('should be able to pause and resume the queue', async () => {
        const queue = new WorkerQueue({ concurrency: 1 });
        queue.pause();
        const now = Date.now();
        setTimeout(() => queue.resume(), 100);

        const result = await queue.enqueueBatch([aTask({ result: 'Executed 1' })]);

        expect(Date.now() - now).toBeGreaterThanOrEqual(100);
        expect(result).toEqual(['Executed 1']);
    });

    it('should not interrupt running tasks when queue is paused', async () => {
        const queue = new WorkerQueue({ concurrency: 1 });
        const now = Date.now();
        setTimeout(() => queue.pause(), 50);

        const result = await queue.enqueueBatch([aTask({ result: 'Executed 1', delay: 100 })]);

        expect(Date.now() - now).toBeLessThan(150);
        expect(result).toEqual(['Executed 1']);
    });
});

function aTask<T>({ result, rejection, delay }: { result?: T, rejection?: any, delay?: number }): Task<T> {
    return () => new Promise((resolve, reject) => {
        const resultFn = () => result != null ? resolve(result) : reject(rejection);
        if (delay) {
            setTimeout(() => resultFn(), delay);
        } else {
            resultFn();
        }
    });
}
