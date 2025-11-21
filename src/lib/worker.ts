import { Task } from './types';

type WorkerState = {
    createdAt: number;
    status: 'idle' | 'running' | 'completed' | 'failed',
    startedAt?: number;
    finishedAt?: number;
    idleTime?: number;
    runTime?: number;
}

export class Worker<T> {
    private state: WorkerState = {
        createdAt: Date.now(),
        status: 'idle',
    };

    public workerPromise: Promise<T>;

    // @ts-ignore
    private resolve: (resolvedValue: T) => void;

    // @ts-ignore
    private reject: (reason?: any) => void;

    constructor(private task: Task<T>) {
        this.workerPromise = new Promise<T>((resolve, reject) => {
            this.resolve = (result: T) => {
                this.onComplete();
                resolve(result);
            }
            this.reject = (reason?: any) => {
                this.onFailed();
                reject(reason);
            }
        });
    }

    public run(): Promise<T> {
        this.onStart();
        const taskPromise = this.task();
        taskPromise.then(this.resolve, this.reject);
        return taskPromise;
    }

    private onStart() {
        this.state.status = 'running';
        this.state.startedAt = Date.now();
        this.state.idleTime = this.state.startedAt - this.state.createdAt;
    }

    private onComplete() {
        this.state.status = 'completed';
        this.state.finishedAt = Date.now();
        this.state.runTime = this.state.finishedAt - this.state.startedAt!;
    }

    private onFailed() {
        this.state.status = 'failed';
        this.state.finishedAt = Date.now();
        this.state.runTime = this.state.finishedAt - this.state.startedAt!;
    }

    public toString() {
        let result = `Task ${this.state.status};`;
        if (!this.state.idleTime) {
            result += ` idle time: ${Date.now() - this.state.createdAt}ms;`;
        }
        if (this.state.idleTime) {
            result += ` idle time: ${this.state.idleTime}ms;`;
        }
        if (this.state.idleTime && !this.state.runTime) {
            result += ` run time: ${Date.now() - this.state.startedAt!}ms;`;
        }
        if (this.state.runTime) {
            result += ` run time: ${this.state.runTime}ms;`;
        }
        return result;
    }
}
