import db from './db';

const getError = (err) => (err.response && err.response.data && err.response.data.message ? err.response.data.messag : err.message);

const onError = async (err, req, res, next) => {
	await db.disconnect();
	res.status(500).send({ message: err.toString() });
};

export { getError, onError };
