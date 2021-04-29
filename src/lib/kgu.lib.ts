import * as cheerio from 'cheerio';
import * as fs from 'fs';
import axios from 'axios';
import * as parser from 'fast-xml-parser';
import FormData from 'form-data';

class KGUDownload {
  constructor(cookie: string) {
    this.headres.Cookie = cookie;
  }

  private headres = {
    'Content-Type': 'text/html; charset=utf-8',
    Referer: 'http://lms.kyonggi.ac.kr/',
    Cookie: '',
  };

  /**
   * 로그인을 진행합니다
   *
   * @param id
   * @param password
   */
  public async login(id: string, password: string) {
    const form = new FormData();
    form.append('username', id);
    form.append('password', password);

    const user = await axios({
      method: 'post',
      url: 'https://lms.kyonggi.ac.kr/login/index.php',
      headers: {
        'Content-Type': 'multipart/form-data',
        Referer: 'http://lms.kyonggi.ac.kr/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
      },
      data: form,
    });
  }

  /**
   * 강의 전체 목록을 가져옵니다.
   *
   * @param id
   */
  public async myClassList(id: number) {
    const html = await axios({
      method: 'get',
      url: `http://lms.kyonggi.ac.kr/course/view.php?id=${id}`,
      headers: this.headres,
    });

    const $ = cheerio.load(html.data);
    const activityinstance: Array<any> = $('.total_sections .activityinstance > a');

    // eslint-disable-next-line no-restricted-syntax
    for (const i in activityinstance) {
      if (typeof activityinstance[i].attribs !== 'undefined' && typeof activityinstance[i].attribs.onclick !== 'undefined' && activityinstance[i].attribs.onclick !== '') {
        let onclickList = activityinstance[i].attribs.onclick.replace('window.open(', '').split(',');
        onclickList = onclickList[0].replace(/'/g, '').split('i=');
        if (onclickList[0].indexOf('xncommons') !== -1) {
          // eslint-disable-next-line no-await-in-loop
          await this.myClassView(onclickList[1]); // 강의를 연속적으로 받으면 문제가 생김. 1강의씩 순차적으로
        }
      }
    }
  }

  /**
   * 강의의 실제 View 페이지를 조회합니다.
   *
   * @param url
   * @returns
   */
  public async myClassView(url: string): Promise<any> {
    const { headres } = this;

    // 강의의 실제 코드를 가져오기
    const html2 = await axios({
      method: 'get',
      url: `http://lms.kyonggi.ac.kr/mod/xncommons/viewer/default/default.php?id=${url}`,
      headers: headres,
    });

    let html2split = html2.data.split('content_id=');
    html2split = html2split[1].split('%');
    html2split = html2split[0].split('&');

    const html3 = await axios({
      method: 'get',
      url: `http://cms.kyonggi.ac.kr/viewer/ssplayer/uniplayer_support/content.php?content_id=${html2split[0]}`,
      headers: headres,
    });

    const jsonObj = parser.parse(html3.data);
    const type = jsonObj.content.content_playing_info.content_type;
    const apiRes =
      type === 'video1'
        ? jsonObj.content.content_playing_info.main_media.desktop.html5.media_uri
        : jsonObj.content.service_root.media.media_uri[0].replace('[MEDIA_FILE]', 'screen.mp4');
    const apiTitle = jsonObj.content.content_metadata.title.replace(/:/g, '');

    return { apiRes, apiTitle };
  }

  public async Download(apiRes: string, apiTitle: string) {
    const videoDownload = await axios({
      method: 'get',
      url: apiRes,
      responseType: 'stream',
    });
    const fileSet = videoDownload.data.pipe(fs.createWriteStream(`./download/${apiTitle}.mp4`));
    fileSet.on('finish', () => {
      return true;
    });
    fileSet.on('error', err => {
      return false;
    });
  }
}

export default KGUDownload;
