import KGUDownload from './lib/kgu.lib';
import SsuDownload from './lib/ssu.lib';

(async () => {
  const ssu = new SsuDownload('쿠키값');
  await ssu.myClassList(321011);

})()

