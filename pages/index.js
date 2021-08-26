import React from 'react';
import { CardActionArea, Grid, Card, CardMedia, CardContent, Typography, CardActions, Button } from '@material-ui/core';
import Layout from '../components/Layout';
import NextLink from 'next/link';
import db from '../utils/db';
import Product from '../models/Product';
import axios from 'axios';
import { Store } from '../utils/Store';
import { useRouter } from 'next/dist/client/router';
import Rating from '@material-ui/lab/Rating';

export default function Home({ products }) {
	const router = useRouter();
	const { state, dispatch } = React.useContext(Store);
	const addToCartHandler = async (product) => {
		const existItem = state.cart.cartItems.find((x) => x._id === product._id);
		const quantity = existItem ? existItem.quantity + 1 : 1;
		const { data } = await axios(`/api/products/${product._id}`);
		if (data.countInStock < quantity) {
			window.alert('Sorry. Product is out of stock');
			return;
		}
		dispatch({
			type: 'CART_ADD_ITEM',
			payload: { ...product, quantity }
		});
		router.push('/cart');
	};
	return (
		<Layout>
			<div>
				<h1>Products</h1>
				<Grid container spacing={3}>
					{products.map((product) => (
						<Grid item md={4} key={product.name}>
							<Card>
								<NextLink href={`/product/${product.slug}`} passHref>
									<CardActionArea>
										<CardMedia component="img" image={product.image} title={product.name} />
										<CardContent>
											<Typography>{product.name}</Typography>
											<Rating value={product.rating} readOnly />
										</CardContent>
									</CardActionArea>
								</NextLink>
								<CardActions>
									<Typography>${product.price}</Typography>
									<Button size="small" color="primary" onClick={() => addToCartHandler(product)}>
										Add to cart
									</Button>
								</CardActions>
							</Card>
						</Grid>
					))}
				</Grid>
			</div>
		</Layout>
	);
}

export async function getServerSideProps() {
	await db.connect();
	const products = await Product.find({}, '-reviews').lean();
	await db.disconnect();
	return {
		props: {
			products: products.map(db.convertDocToObject)
		}
	};
}
