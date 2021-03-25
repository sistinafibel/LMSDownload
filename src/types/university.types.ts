export const UniversityArray = ['숭실대', '경기대', '기타'] as const;
export type University = typeof UniversityArray[number];

enum SsuDefaultURL {
  VIEW_LIST_URL = 'http://myclass.ssu.ac.kr/course/view.php?id='
}
