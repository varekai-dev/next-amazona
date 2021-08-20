import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/dist/client/router';
import { Store } from '../../../utils/Store';
import { getError } from '../../../utils/error';
import Layout from '../../../components/Layout';
import { Grid, Typography, List, ListItem, TextField, Button, ListItemText, Card, CircularProgress } from '@material-ui/core';
import useStyles from '../../../utils/styles';
import axios from 'axios';
import NextLink from 'next/link';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';

function reducer(state, action) {
	switch (action.type) {
		case 'FETCH_REQUEST':
			return { ...state, loading: true, error: '' };
		case 'FETCH_SUCCESS': {
			return { ...state, loading: false, error: '' };
		}
		case 'FETCH_FAIL': {
			return { ...state, loading: false, error: action.payload };
		}
		case 'UPDATE_REQUEST':
			return { ...state, loadingUpdate: true, errorUpdate: '' };
		case 'UPDATE_SUCCESS': {
			return { ...state, loadingUpdate: false, errorUpdate: '' };
		}
		case 'UPDATE_FAIL': {
			return { ...state, loadingUpdate: false, errorUpdate: action.payload };
		}
		case 'UPLOAD_REQUEST':
			return { ...state, loadingUpload: true, errorUpload: '' };
		case 'UPLOAD_SUCCESS': {
			return { ...state, loadingUpload: false, errorUpload: '' };
		}
		case 'UPLOAD_FAIL': {
			return { ...state, loadingUpload: false, errorUpload: action.payload };
		}
		default:
			return state;
	}
}

function ProductEdit({ params }) {
	const productId = params.id;
	const router = useRouter();
	const { state } = React.useContext(Store);

	const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] = React.useReducer(reducer, {
		loading: true,
		error: ''
	});
	const { userInfo } = state;
	const s = useStyles();

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const {
		handleSubmit,
		control,
		formState: { errors },
		setValue
	} = useForm();

	React.useEffect(() => {
		if (!userInfo) {
			return router.push('/login');
		} else {
			const fetchData = async () => {
				try {
					dispatch({ type: 'FETCH_REQUEST' });
					const { data } = await axios.get(`/api/admin/products/${productId}`, { headers: { authorization: `Bearer ${userInfo.token}` } });
					dispatch({ type: 'FETCH_SUCCESS' });
					setValue('name', data.name);
					setValue('slug', data.slug);
					setValue('price', data.price);
					setValue('image', data.image);
					setValue('category', data.category);
					setValue('brand', data.brand);
					setValue('description', data.description);
					setValue('countInStock', data.countInStock);
				} catch (err) {
					dispatch({
						type: 'FETCH_FAIL',
						payload: getError(err)
					});
				}
			};
			fetchData();
		}
	}, []);

	const uploadHandler = async (e) => {
		const file = e.target.files[0];
		const bodyFormData = new FormData();
		bodyFormData.append('file', file);
		try {
			dispatch({ type: 'UPLOAD_REQUEST' });
			const { data } = await axios.post('/api/admin/upload', bodyFormData, {
				headers: {
					'Content-type': 'multipart/form-data',
					authorization: `Bearer ${userInfo.token}`
				}
			});
			dispatch({ type: 'UPLOAD_SUCCESS' });
			setValue('image', data.secure_url);
			enqueueSnackbar('File uploaded successfully', { variant: 'success' });
		} catch (err) {
			dispatch({ type: 'UPDATE_FAIL' });
			enqueueSnackbar(getError(err), { variant: 'error' });
		}
	};

	const submitHandler = async ({ name, slug, price, image, category, brand, description, countInStock }) => {
		closeSnackbar();

		try {
			dispatch({ type: 'UPDATE_REQUEST' });
			await axios.put(
				`/api/admin/products/${productId}`,
				{
					name,
					slug,
					price,
					image,
					category,
					brand,
					description,
					countInStock
				},
				{ headers: { authorization: `Bearer ${userInfo.token}` } }
			);
			dispatch({ type: 'UPDATE_SUCCESS' });
			enqueueSnackbar('Profile updated successfully', { variant: 'success' });
			router.push('/admin/products');
		} catch (err) {
			dispatch({ type: 'UPDATE_FAIL' });
			enqueueSnackbar(getError(err), { variant: 'error' });
		}
	};
	return (
		<Layout title={`Edit Product ${productId}`}>
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
						</List>
					</Card>
				</Grid>

				<Grid item md={9} xs={12}>
					<Card className={s.section}>
						<List>
							<ListItem>
								<Typography component="h1" variant="h1">
									Edit Product {productId}
								</Typography>
							</ListItem>
							{loading && <CircularProgress />}
							{error && <Typography className={s.error}>{error}</Typography>}
							<ListItem>
								<form onSubmit={handleSubmit(submitHandler)} className={s.form}>
									<List>
										<ListItem>
											<Controller
												name="name"
												control={control}
												defaultValue=""
												rules={{ required: true }}
												render={({ field }) => (
													<TextField error={Boolean(errors.name)} helperText={errors.name ? 'Name is required' : ''} variant="outlined" fullWidth id="name" label="Name" {...field}></TextField>
												)}></Controller>
										</ListItem>
										<ListItem>
											<Controller
												name="slug"
												control={control}
												defaultValue=""
												rules={{ required: true }}
												render={({ field }) => (
													<TextField error={Boolean(errors.slug)} helperText={errors.slug ? 'Slug is required' : ''} variant="outlined" fullWidth id="slug" label="Slug" {...field}></TextField>
												)}></Controller>
										</ListItem>
										<ListItem>
											<Controller
												name="price"
												control={control}
												defaultValue=""
												rules={{ required: true }}
												render={({ field }) => (
													<TextField error={Boolean(errors.price)} helperText={errors.price ? 'Price is required' : ''} variant="outlined" fullWidth id="price" label="Price" {...field}></TextField>
												)}></Controller>
										</ListItem>
										<ListItem>
											<Controller
												name="image"
												control={control}
												defaultValue=""
												rules={{ required: true }}
												render={({ field }) => (
													<TextField error={Boolean(errors.image)} helperText={errors.image ? 'Image is required' : ''} variant="outlined" fullWidth id="image" label="image" {...field}></TextField>
												)}></Controller>
										</ListItem>
										<ListItem>
											<Button variant="contained" component="label">
												Upload File
												<input type="file" onChange={uploadHandler} hidden />
											</Button>
											{loadingUpload && <CircularProgress />}
										</ListItem>
										<ListItem>
											<Controller
												name="category"
												control={control}
												defaultValue=""
												rules={{ required: true }}
												render={({ field }) => (
													<TextField
														error={Boolean(errors.category)}
														helperText={errors.category ? 'Category is required' : ''}
														variant="outlined"
														fullWidth
														id="category"
														label="Category"
														{...field}></TextField>
												)}></Controller>
										</ListItem>
										<ListItem>
											<Controller
												name="countInStock"
												control={control}
												defaultValue=""
												rules={{ required: true }}
												render={({ field }) => (
													<TextField
														error={Boolean(errors.countInStock)}
														helperText={errors.countInStock ? 'Count in stock is required' : ''}
														variant="outlined"
														fullWidth
														id="countInStock"
														label="Count in stock"
														{...field}></TextField>
												)}></Controller>
										</ListItem>
										<ListItem>
											<Controller
												name="description"
												control={control}
												defaultValue=""
												rules={{ required: true }}
												render={({ field }) => (
													<TextField
														error={Boolean(errors.description)}
														helperText={errors.description ? 'Description is required' : ''}
														variant="outlined"
														fullWidth
														multiline
														id="description"
														label="Description"
														{...field}></TextField>
												)}></Controller>
										</ListItem>
										<ListItem>
											<Button variant="contained" type="submit" fullWidth color="primary">
												Update
											</Button>
											{loadingUpdate && <CircularProgress />}
										</ListItem>
									</List>
								</form>
							</ListItem>
						</List>
					</Card>
				</Grid>
			</Grid>
		</Layout>
	);
}

export async function getServerSideProps({ params }) {
	return {
		props: { params }
	};
}

export default dynamic(() => Promise.resolve(ProductEdit), { ssr: false });
