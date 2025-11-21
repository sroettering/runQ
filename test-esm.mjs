// Test ESM compatibility
import { RunQ } from './dist/index.js';

console.log('🧪 Testing ESM compatibility...\n');

try {
  // Test import
  if (typeof RunQ !== 'function') {
    throw new Error('RunQ is not a function');
  }
  console.log('✅ ESM import successful');

  // Test instantiation
  const queue = new RunQ({ concurrency: 2 });
  console.log('✅ RunQ instance created');

  // Test methods exist
  const methods = ['enqueue', 'enqueueBatch', 'pause', 'resume'];
  methods.forEach(method => {
    if (typeof queue[method] !== 'function') {
      throw new Error(`Method ${method} not found`);
    }
  });
  console.log('✅ All methods available');

  // Test basic functionality
  const result = await queue.enqueue(async () => {
    return 'test result';
  });

  if (result !== 'test result') {
    throw new Error('Task execution failed');
  }
  console.log('✅ Task execution successful');
  console.log('\n🎉 All ESM compatibility tests passed!\n');

} catch (error) {
  console.error('❌ ESM compatibility test failed:', error.message);
  process.exit(1);
}

