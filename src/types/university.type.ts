export const UniversityArray = ['숭실대', '경기대', '기타'] as const;
export type University = typeof UniversityArray[number];

export enum SsuDefaultURL {
  REFERER_URL = 'http://myclass.ssu.ac.kr/',
  VIEW_LIST_URL = 'http://myclass.ssu.ac.kr/course/view.php?id=',
  MY_CLASS_DEFAULT = 'http://myclass.ssu.ac.kr/mod/xncommons/viewer/default/default.php?id=',
  UNIPLAYER_DEFAULT = 'http://commons.ssu.ac.kr/viewer/ssplayer/uniplayer_support/content.php?content_id=',
}

export enum KguDefaultURL {
  VIEW_LIST_URL = 'http://myclass.kgu.ac.kr/course/view.php?id=',
}
