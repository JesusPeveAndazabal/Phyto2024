/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  console.log(data);
  //const response = `worker response to ${data}`;
  //data as SqliteService;
  postMessage(data);
});
