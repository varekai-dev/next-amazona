import { Grid, Table, TableContainer, Typography, TableHead, TableRow, TableCell, TableBody, Link, Select, MenuItem, Button, Card, List, ListItem } from '@material-ui/core';
import React, { useContext } from 'react';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import NextLink from 'next/link';
import Image from 'next/image';

export default function Cart() {
	const { state } = useContext(Store);
	const {
		cart: { cartItems }
	} = state;
	return (
		<Layout title="Shopping Cart">
			<Typography component="h1" variant="h1">
				Shopping Cart
			</Typography>
			{cartItems.length === 0 ? (
				<div>
					Cart is empty. <NextLink href="/">Go shopping</NextLink>
				</div>
			) : (
				<Grid container spacing={1}>
					<Grid item md={9} xs={12}>
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>Image</TableCell>
										<TableCell>Name</TableCell>
										<TableCell align="center">Quantiy</TableCell>
										<TableCell align="center">Price</TableCell>
										<TableCell align="center">Action</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{cartItems.map((item) => (
										<TableRow key={item._id}>
											<TableCell>
												<Image src={item.image} alt={item.name} width={50} height={50} />
											</TableCell>
											<TableCell>
												<NextLink href={`/product/${item.slug}`} passHref>
													<Link>{item.name}</Link>
												</NextLink>
											</TableCell>
											<TableCell align="center">
												<Select value={item.quantiy}>
													{[...Array(item.countInStock).keys()].map((x) => (
														<MenuItem key={x + 1} value={x + 1}>
															{x + 1}
														</MenuItem>
													))}
												</Select>
											</TableCell>
											<TableCell>${item.price}</TableCell>
											<TableCell align="center">
												<Button variant="contained" color="secondary">
													X
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Grid>
					<Grid item md={3} xs={12}>
						<Card>
							<List>
								<ListItem variant="h2">
									<Typography>
										Subtotal ({cartItems.reduce((a, c) => a + c.quantiy, 0)}) items : ${cartItems.reduce((a, c) => a + c.price, 0)}
									</Typography>
								</ListItem>
								<ListItem>
									<Button variant="contained" color="primary">
										Check Out
									</Button>
								</ListItem>
							</List>
						</Card>
					</Grid>
				</Grid>
			)}
		</Layout>
	);
}
