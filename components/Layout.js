import {
	AppBar,
	Container,
	createTheme,
	CssBaseline,
	Link,
	ThemeProvider,
	Toolbar,
	Typography,
	Switch,
	Badge,
	Button,
	Menu,
	MenuItem,
	Box,
	IconButton,
	Drawer,
	List,
	ListItem,
	ListItemText,
	Divider,
	InputBase
} from '@material-ui/core';
import Head from 'next/head';
import NextLink from 'next/link';
import React from 'react';
import useStyles from '../utils/styles';
import { Store } from '../utils/Store';
import Cookies from 'js-cookie';
import { useRouter } from 'next/dist/client/router';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';
import { useSnackbar } from 'notistack';
import { getError } from '../utils/error';
import axios from 'axios';

const Layout = ({ title, children, description }) => {
	const router = useRouter();
	const { state, dispatch } = React.useContext(Store);
	const { darkMode, cart, userInfo } = state;
	const theme = createTheme({
		typography: {
			h1: {
				fontSize: '1.6rem',
				fontWeight: 400,
				margin: '1rem 0'
			},
			h1: {
				fontSize: '1.4rem',
				fontWeight: 400,
				margin: '1rem 0'
			}
		},
		palette: {
			type: darkMode ? 'dark' : 'light',
			primary: {
				main: '#f0c000'
			},
			secondary: {
				main: '#208080'
			}
		}
	});
	const s = useStyles();
	const darkModeChangeHandler = () => {
		dispatch({ type: darkMode ? 'DARK_MODE_OFF' : 'DARK_MODE_ON' });
		const newDarkMode = !darkMode;
		Cookies.set('darkMode', newDarkMode ? 'ON' : 'OFF');
	};
	const [anchorEl, setAnchorEl] = React.useState(null);
	const loginClickHandler = (e) => {
		setAnchorEl(e.currentTarget);
	};
	const loginMenuCloseHandler = (e, redirect) => {
		setAnchorEl(null);
		if (redirect) {
			router.push(redirect);
		}
	};
	const logoutClickHandler = () => {
		setAnchorEl(null);
		dispatch({ type: 'USER_LOGOUT' });
		Cookies.remove('userInfo');
		Cookies.remove('cartItems');
		Cookies.remove('shippingAddress');
		Cookies.remove('paymentMethod');
		router.push('/');
	};
	const [sidebarVisible, setSidebarVisible] = React.useState(false);
	const sidebarOpenHandler = () => {
		setSidebarVisible(true);
	};
	const sidebarCloseHandler = () => {
		setSidebarVisible(false);
	};
	const [categories, setCategories] = React.useState([]);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const fetchCategories = async () => {
		try {
			const { data } = await axios.get(`/api/products/categories`);
			setCategories(data);
		} catch (err) {
			enqueueSnackbar(getError(err), { variant: 'error' });
		}
	};
	const [query, setQuery] = React.useState('');
	const submitHandler = (e) => {
		e.preventDefault();
		router.push(`/search?query=${query}`);
	};
	const queryChangeHandler = (e) => {
		setQuery(e.target.value);
	};
	React.useEffect(() => {
		fetchCategories();
	}, []);

	return (
		<div>
			<Head>
				<title>{title ? `${title} - Next Amazona` : 'Next Amazona'}</title>
				{description && <meta name="description" content={description} />}
			</Head>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<AppBar position="static" className={s.navbar}>
					<Toolbar className={s.toolbar}>
						<Box display="flex" alignItems="center">
							<IconButton edge="start" aria-label="open drawer" onClick={sidebarOpenHandler} className={s.menu}>
								<MenuIcon className={s.navbarButton} />
							</IconButton>
							<NextLink href="/" passHref>
								<Link>
									<Typography className={s.brand}>amazona</Typography>
								</Link>
							</NextLink>
						</Box>
						<Drawer anchor="left" open={sidebarVisible} onClose={sidebarCloseHandler}>
							<List>
								<ListItem>
									<Box display="flex" alignItems="center" justifyContent="space-between">
										<Typography>Shopping by category</Typography>
										<IconButton aria-label="close" onClick={sidebarCloseHandler}>
											<CancelIcon />
										</IconButton>
									</Box>
								</ListItem>
								<Divider light />
								{categories.map((category) => (
									<NextLink key={category} href={`/search?category=${category}`} passHref>
										<ListItem button component="a" onClick={sidebarCloseHandler}>
											<ListItemText primary={category}></ListItemText>
										</ListItem>
									</NextLink>
								))}
							</List>
						</Drawer>
						<div className={s.searchSection}>
							<form onSubmit={submitHandler} className={s.searchForm}>
								<InputBase name="query" className={s.searchInput} placeholder="Search products" onChange={queryChangeHandler} />
								<IconButton type="submit" className={s.iconButton} aria-label="search">
									<SearchIcon />
								</IconButton>
							</form>
						</div>
						<div>
							<Switch checked={darkMode} onChange={darkModeChangeHandler}></Switch>
							<NextLink href="/cart" passHref>
								<Link>
									<Typography component="span">
										{cart?.cartItems?.length > 0 ? (
											<Badge color="secondary" badgeContent={cart.cartItems.length}>
												Cart
											</Badge>
										) : (
											'Cart'
										)}
									</Typography>
								</Link>
							</NextLink>
							{userInfo ? (
								<>
									<Button aria-controls="simple-menu" aria-haspopup="true" onClick={loginClickHandler} className={s.navbarButton}>
										{userInfo.name}
									</Button>
									<Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={(e) => loginMenuCloseHandler(e, false)}>
										<MenuItem onClick={(e) => loginMenuCloseHandler(e, '/profile')}>Profile</MenuItem>
										<MenuItem onClick={(e) => loginMenuCloseHandler(e, '/order-history')}>Order History</MenuItem>
										{userInfo.isAdmin && <MenuItem onClick={(e) => loginMenuCloseHandler(e, '/admin/dashboard')}>Admin Dashboard</MenuItem>}
										<MenuItem onClick={logoutClickHandler}>Logout</MenuItem>
									</Menu>
								</>
							) : (
								<NextLink href="/login" passHref>
									<Typography component="span">
										<Link>Login</Link>
									</Typography>
								</NextLink>
							)}
						</div>
					</Toolbar>
				</AppBar>
				<Container className={s.main}>{children}</Container>
				<footer className={s.footer}>
					<Typography>All rights reserved. Next Amazona</Typography>
				</footer>
			</ThemeProvider>
		</div>
	);
};

export default Layout;
