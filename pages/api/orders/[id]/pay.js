import nc from 'next-connect';
import { isAuth } from '../../../../utils/auth';
import Order from '../../../../models/Order';
import db from '../../../../utils/db';
import { onError } from '../../../../utils/error';

const handler = nc({
	onError
});

handler.use(isAuth);

handler.get(async (req, res) => {
	await db.connect();
	const order = await Order.findById(req.query.id);
	if (order) {
		order.isPaid = true;
		order.paidAt = Date.now();
		order.paymentResult = {
			id: req.body.id,
			status: req.body.status,
			email_address: req.body.email_address
		};
		const paidOrder = await order.save();
		res.send({ message: 'order paid', order: paidOrder });
	} else {
		res.status(404).send({ message: 'order not found' });
	}
	await db.disconnect();
	res.send(order);
});

export default handler;
