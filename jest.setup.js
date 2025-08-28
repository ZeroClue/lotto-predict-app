// jest.setup.js
import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Polyfill for structuredClone (required by Chakra UI)
if (!global.structuredClone) {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

if (typeof global.Request === 'undefined') {
  global.Request = require('node-fetch').Request;
}

if (typeof global.Response === 'undefined') {
  global.Response = require('node-fetch').Response;
}