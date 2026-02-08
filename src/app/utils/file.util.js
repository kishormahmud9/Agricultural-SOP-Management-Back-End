export const sanitizeFileName = (filename) => {
  return filename
    .replace(/[\r\n"]/g, "")
    .replace(/[^\w.\- ]+/g, "")
    .trim();
};
