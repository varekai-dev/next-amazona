const getError = (err) => (err.response && err.response.data && err.response.data.message ? err.response.data.messag : err.message);

export { getError };
