import http from 'http';

export default function closeServer(server: http.Server) {
  return new Promise<void>((resolve, reject) =>
    server.close(err => {
      if (err) {
        reject(err);
      }

      resolve();
    }),
  );
}
