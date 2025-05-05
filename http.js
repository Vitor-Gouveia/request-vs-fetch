import request from "request"

const options = {
  url: "http://localhost:3333/201",
  body: {
    hello: {
      world: "true"
    },
    aaa: ['a', "b"]
  },
  method: "POST",
  json: true,
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer 123",
    "User-Agent": "request"
  }
}

function requestFake(options, callback) {
  let status;
  let headers;
  let err;

  if (!callback) {
    return new Promise((resolve, reject) => {
      fetch(options.url, {
        headers: {
          ...(options.json && { 'Content-Type': 'application/json' }),
          ...(options.headers && options.headers),
        },
        method: options.method,
        ...(options.body && { body: JSON.stringify(options.body) })
      })
        .catch((error) => {
          // caso haja algum erro na chamada fetch(), mas não chegou no servidor
          err = error;
        })
        .then((response) => {
          if (response) {
            headers = response.headers;
            status = response.status;
          }

          if (response && response?.headers?.get('content-type')?.includes('text/html')) {
            return response.text();
          }

          if (response && response?.headers?.get('content-type')?.includes('application/json')) {
            return response.json();
          }
        })
        .catch((error) => {
          err = error;
        })
        .then((body) => {
          if (err) {
            return reject(err);
          }

          resolve({
            ...(status && { statusCode: status }),
            ...(headers && { headers }),
            ...(body && { body })
          });
        });
    });
  }

  fetch(options.url, {
    headers: {
      ...(options?.json && { 'Content-Type': 'application/json' }),
      ...(options?.headers && options.headers),
    },
    method: options.method,
    ...(options.body && { body: JSON.stringify(options.body) })
  })
    .catch((error) => {
      // caso haja algum erro na chamada fetch(), mas não chegou no servidor
      err = error;
    })
    .then((response) => {
      if (response) {
        headers = response.headers;
        status = response.status;
      }

      if (response && response?.headers?.get('content-type')?.includes('text/html')) {
        return response.text();
      }

      if (response && response?.headers?.get('content-type')?.includes('application/json')) {
        return response.json();
      }
    })
    .catch((error) => {
      err = error;
    })
    .then((body) => {
      if (err) {
        return callback(err);
      }

      callback(null, {
        ...(status && { statusCode: status }),
        ...(headers && { headers }),
        ...(body && { body })
      });
    });
}

requestFake(options, (err, response) => {
  console.log(err, {
    body: response.body,
    status: response.statusCode
  })
})

request(options, (err, response) => {
  console.log(err, {
    body: response.body,
    status: response.statusCode
  })
})

// try {
//   const { statusCode, headers, body } = await requestFake(options)
//   console.log({
//     body,
//     status: statusCode
//   })
// } catch(error) {
//   console.log(error) // fail between fetch and server
// }