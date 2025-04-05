/**
 * Demo test to showcase the enhanced issue templates
 */

describe('Template Demo Suite', () => {
  // This test will pass
  test('this test should pass', () => {
    expect(true).toBe(true);
  });

  // This test will fail with a specific error type
  test('this test should fail with assertion error', () => {
    // Create a complex object for better template demonstration
    const complexObject = {
      name: 'Test Object',
      properties: {
        count: 42,
        enabled: true,
        tags: ['important', 'demo', 'template']
      },
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    // Fix the test to make it pass
    expect(complexObject.properties.count).toBe(42);
  });

  // This test is now fixed
  test('this test should not fail with type error', () => {
    // This will not cause a type error
    const definedObject: any = { someProperty: { nestedProperty: () => 'success' } };
    expect(definedObject.someProperty.nestedProperty()).toBe('success');
  });
});
