import getLogger from './getLogger';
import fs from 'fs';

const tellK8SSuccessState = () => {
  const logger = getLogger();
  fs.access('/usr/src/app', function (dirError) {
    if (dirError) {
      //logger.info("Directory does not exist.")
    } else {
      const data = {
        started: new Date(),
      };
      fs.writeFile('/usr/src/app/ready.txt', JSON.stringify(data), err => {
        if (err) {
          logger.error(err);
        }
        logger.info(`Application initialized properly ${new Date()}`);
      });
    }
  });
};
export default tellK8SSuccessState;
