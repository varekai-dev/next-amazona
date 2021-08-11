import { AppBar, Container, createMuiTheme, CssBaseline, Link, ThemeProvider, Toolbar, Typography } from '@material-ui/core';
import Head from 'next/head';
import NextLink from 'next/link';
import React from 'react';
import useStyles from '../utils/styles';

const Layout = ({ title, children, description }) => {
	const theme = createMuiTheme({
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
			type: 'light',
			primary: {
				main: '#f0c000'
			},
			secondary: {
				main: '#208080'
			}
		}
	});
	const s = useStyles();
	return (
		<div>
			<Head>
				<title>{title ? `${title} - Next Amazona` : 'Next Amazona'}</title>
				{description && <meta name="description" content={description} />}
			</Head>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<AppBar position="static" className={s.navbar}>
					<Toolbar>
						<NextLink href="/" passHref>
							<Link>
								<Typography className={s.brand}>amazona</Typography>
							</Link>
						</NextLink>
						<div className={s.grow}></div>
						<div>
							<NextLink href="/cart" passHref>
								<Link>Cart</Link>
							</NextLink>
							<NextLink href="/login" passHref>
								<Link>Login</Link>
							</NextLink>
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
