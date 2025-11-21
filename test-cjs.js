const {RunQ} = require('./dist/index.cjs');
const q = new RunQ({concurrency: 2});
console.log('✅ CommonJS: RunQ instance created successfully');
console.log('✅ CommonJS: Type check passed:', typeof q.enqueue === 'function');
