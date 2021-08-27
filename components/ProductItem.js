import { Card, CardActionArea, CardActions, CardMedia, CardContent, Typography, Button } from '@material-ui/core';
import React from 'react';
import NextLink from 'next/link';
import Rating from '@material-ui/lab/Rating';

export default function ProductItem({ addToCartHandler, product }) {
	return (
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
	);
}
