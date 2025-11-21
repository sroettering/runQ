// Test CommonJS compatibility
const { WorkerQueue } = require('./dist/index.cjs');

console.log('🧪 Testing CommonJS compatibility...\n');

try {
  // Test import
  if (typeof WorkerQueue !== 'function') {
    throw new Error('WorkerQueue is not a function');
  }
  console.log('✅ CommonJS import successful');

  // Test instantiation
  const queue = new WorkerQueue({ concurrency: 2 });
  console.log('✅ WorkerQueue instance created');

  // Test methods exist
  const methods = ['enqueue', 'enqueueBatch', 'pause', 'resume'];
  methods.forEach(method => {
    if (typeof queue[method] !== 'function') {
      throw new Error(`Method ${method} not found`);
    }
  });
  console.log('✅ All methods available');

  // Test basic functionality
  queue.enqueue(async () => {
    return 'test result';
  }).then(result => {
    if (result !== 'test result') {
      throw new Error('Task execution failed');
    }
    console.log('✅ Task execution successful');
    console.log('\n🎉 All CommonJS compatibility tests passed!\n');
    process.exit(0);
  }).catch(err => {
    console.error('❌ Task execution failed:', err.message);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ CommonJS compatibility test failed:', error.message);
  process.exit(1);
}

