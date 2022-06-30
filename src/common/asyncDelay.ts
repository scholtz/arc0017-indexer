/**
 * Forces the thread to sleep for X milliseconds
 * @param {*} delayInms - The number of milliseconds to sleep
 * @returns
 */
const asyncDelay = (delayInms: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
};

export default asyncDelay;
