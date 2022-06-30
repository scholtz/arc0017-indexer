const getNumber = (data: string) => {
  // data  = b9 60 -> 12345
  data = data.replace(' ', '');
  var leadingBit = true;
  let index = 0;
  let out = 0;
  while (leadingBit) {
    const byte = data.substring(index * 2, index * 2 + 2);
    const num = parseInt(byte, 16);
    leadingBit = num >> 7 == 1;
    out += (num % 128) * Math.pow(128, index);
    index++;
  }
  return { data: out, len: index };
};
export default getNumber;
