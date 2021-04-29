import * as cheerio from 'cheerio';
import * as fs from 'fs';
import axios from 'axios';
import * as parser from 'fast-xml-parser';
import * as FormData from 'form-data';

class SSUDownload {
  constructor(cookie: string) {
    this.headres.Cookie = cookie;
  }

  private headres = {
    'Content-Type': 'text/html; charset=utf-8',
    Referer: 'http://myclass.ssu.ac.kr/',
    Cookie: '',
  };

  public async myClassList(id: number) {
    const html = await axios({
      method: 'get',
      url: `http://myclass.ssu.ac.kr/course/view.php?id=${id}`,
      headers: this.headres,
    });

    const $: any = cheerio.load(html.data);
    const activityinstance: any = $('.total_sections .activityinstance > a');

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

  public async myClassView(url: string): Promise<any> {
    const { headres } = this;
    const html2 = await axios({
      method: 'get',
      url: `http://myclass.ssu.ac.kr/mod/xncommons/viewer/default/default.php?id=${url}`,
      headers: headres,
    });
    let html2split = html2.data.split('content_id=');
    html2split = html2split[1].split('%');
    html2split = html2split[0].split('&');

    const html3 = await axios({
      method: 'get',
      url: ` http://commons.ssu.ac.kr/viewer/ssplayer/uniplayer_support/content.php?content_id=${html2split[0]}`,
      headers: headres,
    });

    // const xmlHtml = await xml2js.parseStringPromise(html3.data);
    const jsonObj = parser.parse(html3.data);

    const type = jsonObj.content.content_playing_info.content_type;
    const fileName = jsonObj.content.content_playing_info.story_list.story.main_media_list.main_media;
    const apiRes =
      type === 'video1'
        ? jsonObj.content.content_playing_info.main_media.desktop.html5.media_uri
        : jsonObj.content.service_root.media.media_uri[0].replace('[MEDIA_FILE]', fileName).replace('/playlist.m3u8', '');
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

export default SSUDownload;
