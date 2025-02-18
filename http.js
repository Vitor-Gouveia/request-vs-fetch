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
  let status
  let headers
  let resp
  
  if(!callback) {
    return new Promise((resolve, reject) => {
      fetch(options.url, {
        headers: {
          ...(options.json && { 'Content-Type': 'application/json' }),
          ...(options.headers && options.headers),
          "User-Agent": "fetch api"
        },
        method: options.method,
        ...(options.body && { body: JSON.stringify(options.body) })
      })
        .catch(error => {
          return reject(error)
        })
        .then(response => {
          if(response) {
            headers = response.headers
            status = response.status
            resp = response
          }
          
          if(response && !response.headers.get("content-type").includes("application/json")) {
            return response.text()
          }
    
          if(response) {
            return response.json();
          }
        })
        .then(body => {
          if (resp && !resp.ok) {
            // caso o cliente não tenha respondido com 200-299
            resolve({
              ...(status && { statusCode: status }),
              ...(headers && { headers }),
              ...(body && { body })
            });
            return;
          }
    
          resolve({
            ...(status && { statusCode: status }),
              ...(headers && { headers }),
              ...(body && { body })
          });
        });
    })
  }

  fetch(options.url, {
    headers: {
      ...(options.json && { 'Content-Type': 'application/json' }),
      ...(options.headers && options.headers),
      "User-Agent": "fetch api"
    },
    method: options.method,
    ...(options.body && { body: JSON.stringify(options.body) })
  })
    .catch((error) => {
      // caso haja algum erro na chamada fetch(), mas não chegou no servidor
      callback(error);
    })
    .then((response) => {
      if(response) {
        headers = response.headers
        status = response.status
        resp = response
      }
      
      if(response && !response.headers.get("content-type").includes("application/json")) {
        return response.text()
      }

      if(response) {
        return response.json();
      }
    })
    .then(body => {
      if (resp && !resp.ok) {
        // caso o cliente não tenha respondido com 200-299
        callback(null, {
          ...(status && { statusCode: status }),
          ...(headers && { headers }),
          ...(body && { body })
        });
        return;
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