exports.logAxiosError = function(err) {
  if (err.response) {
    console.error(`${err.config.method.toUpperCase()} ${err.config.url}: Status: ${err.response.status}`);
    console.error(err.response.data);
  } else {
    console.error(err);
  }
}
