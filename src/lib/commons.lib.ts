import * as cheerio from 'cheerio';
import * as fs from 'fs';
import axios from 'axios';
import * as parser from 'fast-xml-parser';
import * as FormData from 'form-data';
import { IHeadres, IMyClassUrl } from '../interfaces/headres.interface';

class CommonDownload {
  private headres: IHeadres = {
    'Content-Type': 'text/html; charset=utf-8',
    Referer: '',
    Cookie: '',
  };

  private classUrl: IMyClassUrl;

  constructor(cookie: string, universitySet: IMyClassUrl) {
    this.headres.Cookie = cookie;
    this.headres.Referer = universitySet.REFERER_URL;
    this.classUrl.VIEW_LIST_URL = universitySet.VIEW_LIST_URL;
    this.classUrl.MY_CLASS_DEFAULT = universitySet.MY_CLASS_DEFAULT;
    this.classUrl.UNIPLAYER_DEFAULT = universitySet.UNIPLAYER_DEFAULT;
  }

  public async myClassList(id: number): Promise<Array<string>> {
    const html = await axios({
      method: 'get',
      url: `${this.classUrl.VIEW_LIST_URL}${id}`,
      headers: this.headres,
    });

    const $ = cheerio.load(html.data);
    const activityinstance: Array<any> = $('.total_sections .activityinstance > a');

    const myClassUrlArray = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const i in activityinstance) {
      if (typeof activityinstance[i].attribs !== 'undefined' && typeof activityinstance[i].attribs.onclick !== 'undefined' && activityinstance[i].attribs.onclick !== '') {
        let onclickList = activityinstance[i].attribs.onclick.replace('window.open(', '').split(',');
        onclickList = onclickList[0].replace(/'/g, '').split('i=');
        if (onclickList[0].indexOf('xncommons') !== -1) {
          myClassUrlArray.push(onclickList[1]);
        }
      }
    }

    return myClassUrlArray;
  }

  public async myClassView(viewCode: string): Promise<any> {
    const { headres } = this;
    const html2 = await axios({
      method: 'get',
      url: `${this.classUrl.MY_CLASS_DEFAULT}${viewCode}`,
      headers: headres,
    });
    let html2split = html2.data.split('content_id=');
    html2split = html2split[1].split('%');
    html2split = html2split[0].split('&');

    const html3 = await axios({
      method: 'get',
      url: `${this.classUrl.UNIPLAYER_DEFAULT}${html2split[0]}`,
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

  public async Download(apiRes: string, apiTitle: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: apiRes,
        responseType: 'stream',
      }).then(videoDownload => {
        const fileSet = videoDownload.data.pipe(fs.createWriteStream(`./download/${apiTitle}.mp4`));
        fileSet.on('finish', () => {
          resolve(true);
        });
        fileSet.on('error', err => {
          reject(err);
        });
      });
    });
  }
}

export default CommonDownload;
