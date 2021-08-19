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

export default function Register() {
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
	if (userInfo) {
		router.push('/');
	}
	const classes = useStyles();

	const submitHandler = async ({ email, password, name, confirmPassword }) => {
		closeSnackbar();
		if (password !== confirmPassword) {
			enqueueSnackbar('Passwords does not match', { variant: 'error' });
			return;
		}
		try {
			const { data } = await axios.post('/api/users/register', {
				email,
				password,
				name
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
					Register
				</Typography>
				<List>
					<ListItem>
						<Controller
							name="name"
							control={control}
							defaultValue=""
							rules={{ required: true, minLength: 2 }}
							render={({ field }) => (
								<TextField
									error={Boolean(errors.name)}
									helperText={errors.name ? (errors.name.type === 'minLength' ? 'Name length is more than 2' : 'Name is required') : ''}
									variant="outlined"
									fullWidth
									id="name"
									label="Name"
									inputProps={{ type: 'name' }}
									{...field}></TextField>
							)}></Controller>
					</ListItem>
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
						<Controller
							name="confirmPassword"
							control={control}
							defaultValue=""
							rules={{ required: true, minLength: 6 }}
							render={({ field }) => (
								<TextField
									error={Boolean(errors.confirmPassword)}
									helperText={errors.confirmPassword ? (errors.confirmPassword.type === 'minLength' ? 'Password length is more than 5' : 'Password is required') : ''}
									variant="outlined"
									fullWidth
									id="confirmPassword"
									label="Confirm Password"
									inputProps={{ type: 'password' }}
									{...field}></TextField>
							)}></Controller>
					</ListItem>
					<ListItem>
						<Button variant="contained" type="submit" fullWidth color="primary">
							Register
						</Button>
					</ListItem>
					<ListItem>
						Already have an account ?{' '}
						<NextLink href={`/login?redirect=${redirect || '/'}`} passHref>
							<Link> Login</Link>
						</NextLink>
					</ListItem>
				</List>
			</form>
		</Layout>
	);
}
