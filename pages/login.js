import { List, ListItem, Typography, TextField, Button, Link } from '@material-ui/core';
import React from 'react';
import Layout from '../components/Layout';
import useStyles from '../utils/styles';
import NextLink from 'next/link';
import axios from 'axios';
import { Store } from '../utils/Store';
import { useRouter } from 'next/dist/client/router';
import Cookies from 'js-cookie';
import { Controller, useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { getError } from '../utils/error';

export default function Login() {
	const {
		handleSubmit,
		control,
		formState: { errors }
	} = useForm();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const router = useRouter();
	const { redirect } = router.query;
	const { state, dispatch } = React.useContext(Store);
	const { userInfo } = state;
	React.useEffect(() => {
		if (userInfo) {
			router.push('/');
		}
	}, []);
	const classes = useStyles();

	const submitHandler = async ({ email, password }) => {
		closeSnackbar();
		try {
			const { data } = await axios.post('/api/users/login', {
				email,
				password
			});
			dispatch({ type: 'USER_LOGIN', payload: data });
			Cookies.set('userInfo', JSON.stringify(data));
			router.push(redirect || '/');
		} catch (err) {
			enqueueSnackbar(getError(err), { variant: 'error' });
		}
	};
	return (
		<Layout title="Login">
			<form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
				<Typography component="h1" variant="h1">
					Login
				</Typography>
				<List>
					<ListItem>
						<Controller
							name="email"
							control={control}
							defaultValue=""
							rules={{ required: true, pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/ }}
							render={({ field }) => (
								<TextField
									error={Boolean(errors.email)}
									helperText={errors.email ? (errors.email.type === 'pattern' ? 'Email is not valid' : 'Email is required') : ''}
									variant="outlined"
									fullWidth
									id="email"
									label="Email"
									inputProps={{ type: 'email' }}
									{...field}></TextField>
							)}></Controller>
					</ListItem>
					<ListItem>
						<Controller
							name="password"
							control={control}
							defaultValue=""
							rules={{ required: true, minLength: 6 }}
							render={({ field }) => (
								<TextField
									error={Boolean(errors.password)}
									helperText={errors.password ? (errors.password.type === 'minLength' ? 'Password length is more than 5' : 'Password is required') : ''}
									variant="outlined"
									fullWidth
									id="password"
									label="Password"
									inputProps={{ type: 'password' }}
									{...field}></TextField>
							)}></Controller>
					</ListItem>
					<ListItem>
						<Button variant="contained" type="submit" fullWidth color="primary">
							Login
						</Button>
					</ListItem>
					<ListItem>
						Don't have an account ?{' '}
						<NextLink href={`/register?redirect=${redirect || '/'}`} passHref>
							<Link> Register</Link>
						</NextLink>
					</ListItem>
				</List>
			</form>
		</Layout>
	);
}
