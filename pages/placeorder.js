import { Grid, Table, TableContainer, Typography, TableHead, TableRow, TableCell, TableBody, Link, Button, Card, List, ListItem, Checkbox, CircularProgress } from '@material-ui/core';
import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import NextLink from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/dist/client/router';
import useStyles from '../utils/styles';
import CheckoutWizard from '../components/CheckoutWizard';
import { useSnackbar } from 'notistack';
import { getError } from '../utils/error';
import axios from 'axios';
import Cookies from 'js-cookie';

function PlaceOrder() {
	const router = useRouter();
	const s = useStyles();
	const { state, dispatch } = useContext(Store);
	const {
		userInfo,
		cart: { shippingAddress, cartItems, paymentMethod }
	} = state;
	const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
	const itemsPrice = round2(cartItems.reduce((a, c) => a + c.price * c.quantity, 0));
	const shippingPrice = itemsPrice > 200 ? 0 : 15;
	const taxPrice = round2(itemsPrice * 0.15);
	const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

	React.useEffect(() => {
		if (!paymentMethod) {
			router.push('/payment');
		}
	}, []);

	const { closeSnackbar, enqueueSnackbar } = useSnackbar();
	const [loading, setLoading] = React.useState(false);
	const placeOrderHandler = async () => {
		closeSnackbar();
		try {
			setLoading(true);
			const { data } = await axios.post(
				'/api/orders',
				{
					orderItems: cartItems,
					shippingAddress,
					paymentMethod,
					itemsPrice,
					shippingPrice,
					taxPrice,
					totalPrice
				},
				{
					headers: {
						authorization: `Bearer ${userInfo.token}`
					}
				}
			);
			dispatch({ type: 'CART_CLEAR' });
			Cookies.remove('cartItems');

			router.push(`/order/${data._id}`);
		} catch (err) {
			enqueueSnackbar(getError(err), { variant: 'error' });
		} finally {
			setLoadind(false);
		}
	};
	return (
		<Layout title="Shopping Cart">
			<CheckoutWizard activeStep={3} />
			<Typography component="h1" variant="h1">
				Place Order
			</Typography>
			<Grid container spacing={1}>
				<Grid item md={9} xs={12}>
					<Card className={s.section}>
						<List>
							<ListItem>
								<Typography component="h2" variant="h5">
									Shipping Address
								</Typography>
							</ListItem>
							<ListItem>
								{shippingAddress.fullName}, {shippingAddress.address},{shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}
							</ListItem>
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
											{cartItems &&
												cartItems.map((item) => (
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

							<ListItem>
								<Button fullWidth variant="contained" color="primary" onClick={placeOrderHandler}>
									Place Order
								</Button>
							</ListItem>
							{loading && (
								<ListItem>
									<CircularProgress />
								</ListItem>
							)}
						</List>
					</Card>
				</Grid>
			</Grid>
		</Layout>
	);
}

export default dynamic(() => Promise.resolve(PlaceOrder), { ssr: false });
