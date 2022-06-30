import getNumber from './getNumber';

describe('getNumber', () => {
  it('getNumber 12345', async () => {
    expect(JSON.stringify(getNumber('b9 60'))).toBe('{"data":12345,"len":2}');
  });
  it('getNumber 05', async () => {
    expect(JSON.stringify(getNumber('05'))).toBe('{"data":5,"len":1}');
  });
});
