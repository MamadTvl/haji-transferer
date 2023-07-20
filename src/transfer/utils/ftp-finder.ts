import iconv from 'iconv-lite';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FTP = require('ftp');
import ftp from 'ftp';

function getFilesRecursively(
  ftpClient: ftp,
  remotePath: string,
  callback: (err: Error | null, fileList: string[]) => void,
) {
  const fileList: string[] = [];

  ftpClient.list(remotePath, (err, files) => {
    if (err) {
      callback(err, null);
      return;
    }

    let pendingFiles = files.length;

    if (pendingFiles === 0) {
      callback(null, fileList);
      return;
    }
    files.forEach((file) => {
      const decodedFileName = iconv.decode(
        Buffer.from(file.name, 'binary'),
        'utf-8',
      );
      const filePath = `${remotePath}/${decodedFileName}`;
      if (file.name === '.' || file.name === '..') {
        // Skip current and parent directory entries
        pendingFiles--;
        if (pendingFiles === 0) {
          callback(null, fileList);
        }
      } else if (file.type === 'd') {
        // If it's a directory, get files recursively from it
        getFilesRecursively(ftpClient, filePath, (subErr, subFiles) => {
          if (!subErr) {
            fileList.push(...subFiles);
          }

          pendingFiles--;
          if (pendingFiles === 0) {
            callback(null, fileList);
          }
        });
      } else {
        // If it's a file, add it to the file list
        fileList.push(filePath);
        pendingFiles--;
        if (pendingFiles === 0) {
          callback(null, fileList);
        }
      }
    });
  });
}

export const findFtpPath = (
  path: string,
  config: ftp.Options,
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const ftp = new FTP();
    ftp.connect(config);
    ftp.on('ready', () => {
      getFilesRecursively(ftp, path, (err, fileList) => {
        if (err) {
          console.error('Error occurred:', err);
          reject(err);
        } else {
          resolve(fileList);
        }
        ftp.end();
      });
    });

    ftp.on('error', (err) => {
      console.error('FTP error:', err);
      reject(err);
      ftp.end();
    });
  });
};
