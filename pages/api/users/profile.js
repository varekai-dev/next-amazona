import nc from 'next-connect';
import bcrypt from 'bcryptjs';
import User from '../../../models/User';
import db from '../../../utils/db';
import { isAuth, signToken } from '../../../utils/auth';

const handler = nc();

handler.use(isAuth);

handler.put(async (req, res) => {
	await db.connect();

	const user = await User.findById(req.user._id);
	const userExistInDB = await User.findOne({ email: req.body.email });
	if (userExistInDB) {
		res.status(401).send({ message: 'User with such email already exist' });
		return;
	}
	user.name = req.body.name;
	user.email = req.body.email;

	user.password = req.body.password ? bcrypt.hashSync(req.body.password) : user.password;
	user.save();

	await db.disconnect();

	const token = signToken(user);
	res.send({
		token,
		_id: user._id,
		name: user.name,
		email: user.email,
		isAdmin: user.isAdmin
	});
});

export default handler;
