import { FormControl, FormControlLabel, List, ListItem, Typography, Radio, RadioGroup, Button } from '@material-ui/core';
import Cookies from 'js-cookie';
import { useRouter } from 'next/dist/client/router';
import { useSnackbar } from 'notistack';
import React from 'react';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import useStyles from '../utils/styles';

export default function Payment() {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const s = useStyles();
	const router = useRouter();

	const { state, dispatch } = React.useContext(Store);
	const {
		cart: { paymentMethod: payment }
	} = state;
	const [paymentMethod, setPaymentMethod] = React.useState('');

	const {
		cart: { shippingAddress }
	} = state;
	React.useEffect(() => {
		if (!shippingAddress.address) {
			router.push('/shipping');
		} else {
			setPaymentMethod(Cookies.get('paymentMethod') || '');
		}
	}, []);
	const submitHandler = (e) => {
		closeSnackbar();
		e.preventDefault();
		if (!paymentMethod) {
			enqueueSnackbar('Paymnent method is required', { variant: 'error' });
		} else {
			dispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethod });
			Cookies.set('paymentMethod', paymentMethod);
			router.push('/placeorder');
		}
	};
	const handleChange = (e) => {
		setPaymentMethod(e.target.value);
	};
	return (
		<Layout title="Payment Method">
			<CheckoutWizard activeStep={2} />
			<form className={s.form} onSubmit={submitHandler}>
				<Typography component="h1" variant="h1">
					Payment Method
				</Typography>
				<List>
					<ListItem>
						<FormControl component="fieldset">
							<RadioGroup aria-label="Payment Method" name="paymentMethod" value={paymentMethod} onChange={handleChange}>
								<FormControlLabel value="PayPal" control={<Radio />} label="PayPal" />
								<FormControlLabel value="Stripe" control={<Radio />} label="Stripe" />
								<FormControlLabel value="Cash" control={<Radio />} label="Cash" />
							</RadioGroup>
						</FormControl>
					</ListItem>
					<ListItem>
						<Button fullWidth type="submit" variant="contained" color="primary">
							Continiue
						</Button>
					</ListItem>
					<ListItem>
						<Button fullWidth type="button" variant="contained" onClick={() => router.push('/shipping')}>
							Back
						</Button>
					</ListItem>
				</List>
			</form>
		</Layout>
	);
}
