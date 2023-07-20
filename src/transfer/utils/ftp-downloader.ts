// eslint-disable-next-line @typescript-eslint/no-var-requires
const FTP = require('ftp');
import ftp from 'ftp';

async function stream2buffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf = Array<any>();

    stream.on('data', (chunk) => _buf.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(_buf)));
    stream.on('error', (err) => reject(`error converting stream - ${err}`));
  });
}

export const getFileBuffer = (
  path: string,
  config: ftp.Options,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const client: ftp = new FTP();
    client.connect(config);

    client.on('ready', () => {
      client.get(path, (err, stream) => {
        console.error(err);
        if (err) reject(err);
        stream2buffer(stream)
          .then(resolve)
          .catch(reject)
          .finally(() => {
            client.end();
          });
      });
    });

    client.on('error', (err) => {
      console.error('FTP error:', err);
      reject(err);
      client.end();
    });
  });
};
