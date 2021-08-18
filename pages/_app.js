import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { SnackbarProvider } from 'notistack';
import { useEffect } from 'react';
import '../styles/globals.css';
import { StoreProvider } from '../utils/Store';
const initialOptions = {
	'client-id': 'AS5afF5_wuMJ_-cpLM1IaQH-YlyTovpHhl0zFez7RGgdz1X7q_joCOamoiy20VTHHON_HDFy1XzPfODM',
	currency: 'USD',
	intent: 'capture',
	'data-client-token': 'ENOhi1UAVnZ2I_4g3V-vG99rRjzMpBDdFeJfm_lUYAG5m3r6ZzBKVJJpXdIH_2qcDzllaZ81I6tr4uNj'
};

function MyApp({ Component, pageProps }) {
	useEffect(() => {
		const jssStyles = document.querySelector('#jss-server-side');
		if (jssStyles) {
			jssStyles.parentElement.removeChild(jssStyles);
		}
	}, []);

	return (
		<SnackbarProvider anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
			<StoreProvider>
				<PayPalScriptProvider deferLoading={true} options={initialOptions}>
					<Component {...pageProps} />
				</PayPalScriptProvider>
			</StoreProvider>
		</SnackbarProvider>
	);
}

export default MyApp;
