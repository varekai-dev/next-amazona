import React from 'react';
import { Grid, Typography, Link } from '@material-ui/core';
import Layout from '../components/Layout';
import db from '../utils/db';
import Product from '../models/Product';
import axios from 'axios';
import { Store } from '../utils/Store';
import { useRouter } from 'next/dist/client/router';
import ProductItem from '../components/ProductItem';
import Carousel from 'react-material-ui-carousel';
import NextLink from 'next/link';
import useStyles from '../utils/styles';

export default function Home({ topRatedProducts, featuredProducts }) {
	const router = useRouter();
	const s = useStyles();
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
			<Carousel className={s.mt1} animation="slide">
				{featuredProducts.map((product) => (
					<NextLink key={product._id} href={`/product/${product.slug}`} passHref>
						<Link>
							<img src={product.featuredImage} alt={product.name} className={s.featuredImage} />
						</Link>
					</NextLink>
				))}
			</Carousel>
			<Typography variant="h4">Popular Products</Typography>
			<Grid container spacing={3}>
				{topRatedProducts.map((product) => (
					<Grid item md={4} key={product.name}>
						<ProductItem addToCartHandler={addToCartHandler} product={product} />
					</Grid>
				))}
			</Grid>
		</Layout>
	);
}

export async function getServerSideProps() {
	await db.connect();
	const topRatedProductsDocs = await Product.find({}, '-reviews').lean().sort({ rating: -1 }).limit(6);
	const featuredProductsDocs = await Product.find({ isFeatured: true }, '-reviews').lean().limit(3);
	await db.disconnect();
	return {
		props: {
			featuredProducts: featuredProductsDocs.map(db.convertDocToObject),
			topRatedProducts: topRatedProductsDocs.map(db.convertDocToObject)
		}
	};
}
