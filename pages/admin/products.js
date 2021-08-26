import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/dist/client/router';
import { Store } from '../../utils/Store';
import { getError } from '../../utils/error';
import Layout from '../../components/Layout';
import { Grid, Typography, Card, List, ListItem, CircularProgress, Button, ListItemText, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import useStyles from '../../utils/styles';
import axios from 'axios';
import NextLink from 'next/link';
import { useSnackbar } from 'notistack';

function reducer(state, action) {
	switch (action.type) {
		case 'FETCH_REQUEST':
			return { ...state, loading: true, error: '' };
		case 'FETCH_SUCCESS': {
			return { ...state, loading: false, products: action.payload, error: '' };
		}
		case 'FETCH_FAIL': {
			return { ...state, loading: false, error: action.payload };
		}
		case 'CREATE_REQUEST':
			return { ...state, loadingCreate: true, error: '' };
		case 'CREATE_SUCCESS': {
			return { ...state, loadingCreate: false, error: '' };
		}
		case 'CREATE_FAIL': {
			return { ...state, loadingCreate: false, error: action.payload };
		}
		case 'DELETE_REQUEST':
			return { ...state, loadingDelete: true, error: '' };
		case 'DELETE_SUCCESS': {
			return { ...state, loadingDelete: false, successDelete: true };
		}
		case 'DELETE_FAIL': {
			return { ...state, loadingDelete: false };
		}
		case 'DELETE_RESET': {
			return { ...state, loadingDelete: false, successDelete: false };
		}
	}
}

function AdminProducts() {
	const router = useRouter();
	const { state } = React.useContext(Store);
	const { userInfo } = state;
	const s = useStyles();
	const [{ loading, error, products, loadingCreate, successDelete, loadingDelete }, dispatch] = React.useReducer(reducer, { loading: true, products: [], error: '', successDelete: false });
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	React.useEffect(() => {
		if (!userInfo) {
			router.push('/login');
		}
		const fetchData = async () => {
			try {
				dispatch({ type: 'FETCH_REQUEST' });
				const { data } = await axios.get(`/api/admin/products`, { headers: { authorization: `Bearer ${userInfo.token}` } });
				dispatch({ type: 'FETCH_SUCCESS', payload: data });
			} catch (err) {
				dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
			}
		};
		if (successDelete) {
			dispatch({ type: 'DELETE_RESET' });
		} else {
			fetchData();
		}
	}, [successDelete]);
	const createHandler = async () => {
		if (!window.confirm('Are you sure?')) {
			return;
		}
		try {
			dispatch({ type: 'CREATE_REQUEST' });
			const { data } = await axios.post(`/api/admin/products`, {}, { headers: { authorization: `Bearer ${userInfo.token}` } });
			enqueueSnackbar('Product created successfully', { variant: 'success' });
			dispatch({ type: 'CREATE_SUCCESS' });
			router.push(`/admin/product/${data.product._id}`);
		} catch (err) {
			dispatch({ type: 'CREATE_FAIL' });
			enqueueSnackbar(getError(err), { variant: 'error' });
		}
	};
	const deleteHandler = async (productId) => {
		if (!window.confirm('Are you sure?')) {
			return;
		}
		try {
			dispatch({ type: 'DELETE_REQUEST' });
			await axios.delete(`/api/admin/products/${productId}`, { headers: { authorization: `Bearer ${userInfo.token}` } });
			enqueueSnackbar('Product deleted successfully', { variant: 'success' });
			dispatch({ type: 'DELETE_SUCCESS' });
		} catch (err) {
			dispatch({ type: 'DELETE_FAIL' });
			enqueueSnackbar(getError(err), { variant: 'error' });
		}
	};
	return (
		<Layout title="Product History">
			<Grid container spacing={1}>
				<Grid item md={3} xs={12}>
					<Card className={s.section}>
						<List>
							<NextLink href="/admin/dashboard" passHref>
								<ListItem button component="a">
									<ListItemText primary="Admin Dashboard"></ListItemText>
								</ListItem>
							</NextLink>
							<NextLink href="/admin/orders" passHref>
								<ListItem button component="a">
									<ListItemText primary="Orders"></ListItemText>
								</ListItem>
							</NextLink>
							<NextLink href="/admin/products" passHref>
								<ListItem selected button component="a">
									<ListItemText primary="Products"></ListItemText>
								</ListItem>
							</NextLink>
							<NextLink href="/admin/users" passHref>
								<ListItem button component="a">
									<ListItemText primary="Users"></ListItemText>
								</ListItem>
							</NextLink>
						</List>
					</Card>
				</Grid>

				<Grid item md={9} xs={12}>
					<Card className={s.section}>
						<List>
							<ListItem>
								<Grid container alignItems="center">
									<Grid item xs={6}>
										<Typography component="h1" variant="h1">
											Products
										</Typography>
										{loadingDelete && <CircularProgress />}
									</Grid>
									<Grid align="right" item xs={6}>
										<Button onClick={createHandler} color="primary" variant="contained">
											Create
										</Button>
										{loadingCreate && <CircularProgress />}
									</Grid>
								</Grid>
							</ListItem>
							<ListItem>
								{loading ? (
									<CircularProgress />
								) : error ? (
									<Typography className={s.error}>{error}</Typography>
								) : (
									<TableContainer>
										<Table>
											<TableHead>
												<TableRow>
													<TableCell>ID</TableCell>
													<TableCell>NAME</TableCell>
													<TableCell>PRICE</TableCell>
													<TableCell>CATEGORY</TableCell>
													<TableCell>COUNT</TableCell>
													<TableCell>RATING</TableCell>
													<TableCell>ACTIONS</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{products.map((product) => (
													<TableRow key={product._id}>
														<TableCell>{product._id.substring(20, 24)}</TableCell>
														<TableCell>{product.name}</TableCell>
														<TableCell>${product.price}</TableCell>
														<TableCell>{product.category}</TableCell>
														<TableCell>{product.countInStock}</TableCell>
														<TableCell>{product.rating}</TableCell>
														<TableCell>
															<NextLink passHref href={`/admin/product/${product._id}`}>
																<Button size="small" variant="contained">
																	Edit
																</Button>
															</NextLink>{' '}
															<Button size="small" variant="contained" onClick={() => deleteHandler(product._id)}>
																Delete
															</Button>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								)}
							</ListItem>
						</List>
					</Card>
				</Grid>
			</Grid>
		</Layout>
	);
}

export default dynamic(() => Promise.resolve(AdminProducts), { ssr: false });
