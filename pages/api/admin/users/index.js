import nc from 'next-connect';
import User from '../../../../models/User';
import { isAuth, isAdmin } from '../../../../utils/auth';
import db from '../../../../utils/db';
import { onError } from '../../../../utils/error';

const handler = nc({
	onError
});
handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
	await db.connect();
	const users = await User.find({});
	await db.disconnect();
	res.send(users);
});

handler.post(async (req, res) => {
	await db.connect();

	const newUser = new User({
		name: 'sample name',
		slug: 'sample-slug-' + Math.random(),
		image: '/images/shirt1.jpg',
		price: 0,
		category: 'sample category',
		brand: 'sample brand',
		countInStock: 0,
		description: 'sample description',
		rating: 0,
		numReview: 0
	});

	const user = await newUser.save();
	await db.disconnect();
	res.send({ message: 'User Created', user });
});

export default handler;
