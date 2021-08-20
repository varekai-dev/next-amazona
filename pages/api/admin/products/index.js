import nc from 'next-connect';
import Product from '../../../models/Product';
import { isAuth, isAdmin } from '../../../utils/auth';
import db from '../../../utils/db';
import { onError } from '../../../utils/error';

const handler = nc({
	onError
});
handler.use(isAuth, isAdmin);

handler.post(async (req, res) => {
	await db.connect();

	const newProduct = new Product({
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

	await db.disconnect();
	res.send(orders);
});

export default handler;
