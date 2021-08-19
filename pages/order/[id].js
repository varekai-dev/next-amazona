import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';
import { Store } from '../../utils/Store';
import NextLink from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/dist/client/router';
import { Grid, Table, TableContainer, Typography, TableHead, TableRow, TableCell, TableBody, Link, Card, List, ListItem, CircularProgress, Button, ListItemText } from '@material-ui/core';
import useStyles from '../../utils/styles';
import CheckoutWizard from '../../components/CheckoutWizard';
import { getError } from '../../utils/error';
import axios from 'axios';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useSnackbar } from 'notistack';

function reducer(state, action) {
	switch (action.type) {
		case 'FETCH_REQUEST':
			return { ...state, loading: true, error: '' };
		case 'FETCH_SUCCESS': {
			return { ...state, loading: false, order: action.payload, error: '' };
		}
		case 'FETCH_FAIL': {
			return { ...state, loading: false, error: action.payload };
		}
		case 'PAY_REQUEST':
			return { ...state, loadingPay: true, error: '' };
		case 'PAY_SUCCESS': {
			return { ...state, loadingPay: false, successPay: true };
		}
		case 'PAY_FAIL': {
			return { ...state, loadingPay: false, errorPay: action.payload };
		}
		case 'PAY_RESET': {
			return { ...state, loadingPay: false, successPay: false, errorPay: '' };
		}
	}
}
function Order({ params }) {
	const orderId = params.id;
	const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
	const router = useRouter();
	const s = useStyles();
	const { state } = useContext(Store);
	const { userInfo } = state;
	const { enqueueSnackbar } = useSnackbar();
	const [{ loading, error, order, successPay }, dispatch] = React.useReducer(reducer, { loading: true, order: {}, error: '' });

	const { shippingAddress, paymentMethod, orderItems, itemsPrice, taxPrice, shippingPrice, totalPrice, isPaid, paidAt, isDelivered, deliveredAt } = order;

	React.useEffect(() => {
		if (!userInfo) {
			return router.push('/login');
		}
		const fetchOrders = async () => {
			try {
				dispatch({ type: 'FETCH_REQUEST' });
				const { data } = await axios.get(`/api/orders/${orderId}`, { headers: { authorization: `Bearer ${userInfo.token}` } });
				dispatch({ type: 'FETCH_SUCCESS', payload: data });
			} catch (err) {
				dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
			}
		};
		if (!order._id || successPay || (order._id && order._id !== orderId)) {
			fetchOrders();
			if (successPay) {
				dispatch({ type: 'PAY_RESET' });
			}
		} else {
			const loadPaypalScript = async () => {
				const { data: clientId } = await axios.get('/api/keys/paypal', {
					headers: { authorization: `Bearer ${userInfo.token}` }
				});
				paypalDispatch({
					type: 'resetOptions',
					value: {
						'client-id': clientId,
						currency: 'USD'
					}
				});
				paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
			};
			loadPaypalScript();
		}
	}, [order, successPay]);

	function createOrder(data, actions) {
		return actions.order
			.create({
				purchase_units: [
					{
						amount: {
							value: totalPrice
						}
					}
				]
			})
			.then((orderID) => {
				return orderID;
			});
	}

	function onApprove(data, actions) {
		return actions.order.capture().then(async function (details) {
			try {
				dispatch({ type: 'PAY_REQUEST' });
				const { data } = await axios.put(`/api/orders/${order._id}/pay`, details, {
					headers: { authorization: `Bearer ${userInfo.token}` }
				});
				dispatch({ type: 'PAY_SUCCESS', payload: data });
				enqueueSnackbar('Order is paid', { variant: 'success' });
			} catch (err) {
				dispatch({ type: 'PAY_FAIL', payload: getError(err) });
				enqueueSnackbar(getError(err), { variant: 'error' });
			}
		});
	}

	function onError(err) {
		enqueueSnackbar(getError(err), { variant: 'error' });
	}
	return (
		<Layout title={`Order ${orderId}`}>
			<CheckoutWizard activeStep={3} />
			<Typography component="h1" variant="h1">
				Order {orderId}
			</Typography>
			{loading ? (
				<CircularProgress />
			) : error ? (
				<Typography className={s.error}>{error}</Typography>
			) : (
				<Grid container spacing={1}>
					<Grid item md={9} xs={12}>
						<Card className={s.section}>
							<List>
								<ListItem>
									<Typography component="h2" variant="h5">
										Shipping Address
									</Typography>
								</ListItem>
								{shippingAddress && (
									<>
										<ListItem>
											{shippingAddress.fullName}, {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}
										</ListItem>
										<ListItem>Status: {isDelivered ? `Delivered at ${deliveredAt}` : 'Not delivered'}</ListItem>
									</>
								)}
							</List>
						</Card>
						<Card className={s.section}>
							<List>
								<ListItem>
									<Typography component="h2" variant="h5">
										Payment Method
									</Typography>
								</ListItem>
								<ListItem>{paymentMethod}</ListItem>
								<ListItem>Status: {isPaid ? `Paid at ${paidAt}` : 'Not paid'}</ListItem>
							</List>
						</Card>

						<Card className={s.section}>
							<List>
								<ListItem>
									<Typography component="h2" variant="h5">
										Order Items
									</Typography>
								</ListItem>
								<ListItem>
									<TableContainer>
										<Table>
											<TableHead>
												<TableRow>
													<TableCell>Image</TableCell>
													<TableCell>Name</TableCell>
													<TableCell align="right">Quantiy</TableCell>
													<TableCell align="right">Price</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{orderItems &&
													orderItems.map((item) => (
														<TableRow key={item._id}>
															<TableCell>
																<Image src={item.image} alt={item.name} width={50} height={50} />
															</TableCell>
															<TableCell>
																<NextLink href={`/product/${item.slug}`} passHref>
																	<Link>{item.name}</Link>
																</NextLink>
															</TableCell>
															<TableCell align="right">
																<Typography>{item.quantity}</Typography>
															</TableCell>
															<TableCell align="right">
																<Typography> ${item.price}</Typography>
															</TableCell>
														</TableRow>
													))}
											</TableBody>
										</Table>
									</TableContainer>
								</ListItem>
							</List>
						</Card>
					</Grid>
					<Grid item md={3} xs={12}>
						<Card className={s.section}>
							<List>
								<ListItem>
									<Typography component="h2" variant="h5">
										Order Summary
									</Typography>
								</ListItem>
								<ListItem>
									<Grid container>
										<Grid item xs={6}>
											<Typography> Items:</Typography>
										</Grid>
										<Grid item xs={6}>
											<Typography align="right"> ${itemsPrice}</Typography>
										</Grid>
									</Grid>
								</ListItem>
								<ListItem>
									<Grid container>
										<Grid item xs={6}>
											<Typography> Tax:</Typography>
										</Grid>
										<Grid item xs={6}>
											<Typography align="right"> ${taxPrice}</Typography>
										</Grid>
									</Grid>
								</ListItem>
								<ListItem>
									<Grid container>
										<Grid item xs={6}>
											<Typography> Shipping:</Typography>
										</Grid>
										<Grid item xs={6}>
											<Typography align="right"> ${shippingPrice}</Typography>
										</Grid>
									</Grid>
								</ListItem>
								<ListItem>
									<Grid container>
										<Grid item xs={6}>
											<Typography>
												{' '}
												<strong> Total:</strong>{' '}
											</Typography>
										</Grid>
										<Grid item xs={6}>
											<Typography align="right">
												<strong>${totalPrice}</strong>
											</Typography>
										</Grid>
									</Grid>
								</ListItem>
								{!isPaid && (
									<ListItem>
										{isPending ? (
											<CircularProgress />
										) : (
											<div className={s.fullWidth}>
												<PayPalButtons createOrder={createOrder} onApprove={onApprove} onError={onError} />
											</div>
										)}
									</ListItem>
								)}
							</List>
						</Card>
					</Grid>
				</Grid>
			)}
		</Layout>
	);
}

export async function getServerSideProps({ params }) {
	return {
		props: { params }
	};
}

export default dynamic(() => Promise.resolve(Order), { ssr: false });
