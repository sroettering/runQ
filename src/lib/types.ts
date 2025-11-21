export type Task<T> = () => Promise<T>;

export type RunQOptions = {
    concurrency: number;
};
