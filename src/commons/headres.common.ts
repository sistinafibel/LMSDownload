import { University } from '../types/university.type';
import { IHeadres } from '../interfaces/headres.interface';

class HeadresCommons {
  private headres: IHeadres = {
    'Content-Type': 'text/html; charset=utf-8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
    Referer: '',
    Cookie: '',
  };

  private ssuHeadres = () => {
    this.headres.Referer = 'http://myclass.ssu.ac.kr';
    this.headres.Cookie = '';
  };

  private kguHeadres = () => {
    this.headres.Referer = 'http://lms.kyonggi.ac.kr';
    this.headres.Cookie = '';
  };

  constructor(name: University, referer = '', cookie = '') {
    if (name === '숭실대') {
      this.ssuHeadres();
    } else if (name === '경기대') {
      this.kguHeadres();
    } else {
      this.headres.Referer = referer;
      this.headres.Cookie = cookie;
    }
  }

  public getHeadres() {
    return this.headres;
  }
}

export default HeadresCommons;
