export type Task<T> = () => Promise<T>;

export type WorkerQueueOptions = {
    concurrency: number;
};
