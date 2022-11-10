/**
 * Date 타입을 'YYYY-MM-DD HH:mm 형식의 문자열로 변환'
 * @param date Date 객체
 */
export const localDateTimeToString = (date: Date) => {
  const year = date.getFullYear();
  let month: string | number = date.getMonth() + 1;
  month = month < 10 ? '0' + month : month;
  let day: string | number = date.getDate();
  day = day < 10 ? '0' + day : day;
  let hour: string | number = date.getHours();
  hour = hour < 10 ? '0' + hour : hour;
  let minute: string | number = date.getMinutes();
  minute = minute < 10 ? '0' + minute : minute;

  return `${year}-${month}-${day} ${hour}:${minute}`;
};
