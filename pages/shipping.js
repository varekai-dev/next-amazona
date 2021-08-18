import { List, ListItem, Typography, TextField, Button } from '@material-ui/core';
import React from 'react';
import Layout from '../components/Layout';
import useStyles from '../utils/styles';
import { Store } from '../utils/Store';
import { useRouter } from 'next/dist/client/router';
import Cookies from 'js-cookie';
import { Controller, useForm } from 'react-hook-form';
import CheckoutWizard from '../components/CheckoutWizard';

export default function Shipping() {
	const {
		handleSubmit,
		control,
		formState: { errors },
		setValue
	} = useForm();
	const router = useRouter();
	const { state, dispatch } = React.useContext(Store);
	const {
		userInfo,
		cart: { shippingAddress }
	} = state;

	const classes = useStyles();

	const submitHandler = ({ fullName, address, city, postalCode, country }) => {
		dispatch({
			type: 'SAVE_SHIPPING_ADDRESS',
			payload: { fullName, address, city, postalCode, country }
		});
		Cookies.set('shippingAddress', JSON.stringify({ fullName, address, city, postalCode, country }));
		router.push('/payment');
	};
	React.useEffect(() => {
		if (!userInfo) {
			router.push('/login?redirect=/shipping');
		}
		if (shippingAddress) {
			setValue('fullName', shippingAddress.fullName);
			setValue('address', shippingAddress.address);
			setValue('country', shippingAddress.country);
			setValue('city', shippingAddress.city);
			setValue('postalCode', shippingAddress.postalCode);
		}
	}, []);
	return (
		<Layout title="Shipping Address">
			<CheckoutWizard activeStep={1} />
			<form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
				<Typography component="h1" variant="h1">
					Shipping Address
				</Typography>
				<List>
					<ListItem>
						<Controller
							name="fullName"
							control={control}
							defaultValue=""
							rules={{ required: true, minLength: 2 }}
							render={({ field }) => (
								<TextField
									error={Boolean(errors.fullName)}
									helperText={errors.fullName ? (errors.fullName.type === 'minLength' ? 'Full Nam length is more than 2' : 'Full Nam is required') : ''}
									variant="outlined"
									fullWidth
									id="fullName"
									label="Full Name"
									inputProps={{ type: 'text' }}
									{...field}></TextField>
							)}></Controller>
					</ListItem>
					<ListItem>
						<Controller
							name="address"
							control={control}
							defaultValue=""
							rules={{ required: true, minLength: 2 }}
							render={({ field }) => (
								<TextField
									error={Boolean(errors.address)}
									helperText={errors.address ? (errors.address.type === 'minLength' ? 'address length is more than 2' : 'address is required') : ''}
									variant="outlined"
									fullWidth
									id="address"
									label="Address"
									inputProps={{ type: 'text' }}
									{...field}></TextField>
							)}></Controller>
					</ListItem>
					<ListItem>
						<Controller
							name="country"
							control={control}
							defaultValue=""
							rules={{ required: true, minLength: 2 }}
							render={({ field }) => (
								<TextField
									error={Boolean(errors.country)}
									helperText={errors.country ? (errors.country.type === 'minLength' ? 'Country length is more than 2' : 'Country is required') : ''}
									variant="outlined"
									fullWidth
									id="country"
									label="Country"
									inputProps={{ type: 'text' }}
									{...field}></TextField>
							)}></Controller>
					</ListItem>
					<ListItem>
						<Controller
							name="city"
							control={control}
							defaultValue=""
							rules={{ required: true, minLength: 2 }}
							render={({ field }) => (
								<TextField
									error={Boolean(errors.city)}
									helperText={errors.city ? (errors.city.type === 'minLength' ? 'City length is more than 2' : 'City is required') : ''}
									variant="outlined"
									fullWidth
									id="city"
									label="City"
									inputProps={{ type: 'text' }}
									{...field}></TextField>
							)}></Controller>
					</ListItem>
					<ListItem>
						<Controller
							name="postalCode"
							control={control}
							defaultValue=""
							rules={{ required: true, minLength: 2 }}
							render={({ field }) => (
								<TextField
									error={Boolean(errors.postalCode)}
									helperText={errors.postalCode ? (errors.postalCode.type === 'minLength' ? 'Postal Code length is more than 2' : 'Postal Code is required') : ''}
									variant="outlined"
									fullWidth
									id="postalCode"
									label="Postal Code"
									inputProps={{ type: 'text' }}
									{...field}></TextField>
							)}></Controller>
					</ListItem>
					<ListItem>
						<Button variant="contained" type="submit" fullWidth color="primary">
							Continue
						</Button>
					</ListItem>
				</List>
			</form>
		</Layout>
	);
}
