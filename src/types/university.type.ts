export const UniversityArray = ['숭실대', '경기대', '기타'] as const;
export type University = typeof UniversityArray[number];

export enum SsuDefaultURL {
  VIEW_LIST_URL = 'http://myclass.ssu.ac.kr/course/view.php?id=',
}

export enum KguDefaultURL {
  VIEW_LIST_URL = 'http://myclass.kgu.ac.kr/course/view.php?id=',
}
