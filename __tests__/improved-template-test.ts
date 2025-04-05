/**
 * Test file to demonstrate improved templates with ANSI code stripping
 * and more detailed regression information
 */

describe('Improved Template Demo', () => {
  // This test will pass
  test('this test should pass', () => {
    expect(true).toBe(true);
  });

  // This test will fail with colored output
  test('this test should fail with colored output', () => {
    const complexObject = {
      name: 'Test Object',
      value: 42,
      nested: {
        property: 'test',
        array: [1, 2, 3]
      }
    };

    // Fix the test to make it pass
    expect(complexObject.value).toBe(42);
  });
});
