import { initStripe, collectBankAccountForSetup, StripeProvider, useStripe, CardField, confirmPayment, useConfirmPayment, PaymentSheetError, createPaymentMethod, CardForm, confirmSetupIntent, confirmPaymentSheetPayment, handleNextAction, createToken, GooglePayButton } from '@stripe/stripe-react-native';
import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, Screen, View, Text, SafeAreaView, Alert, TextInput, Pressable } from 'react-native';
import GooglePayComponent from './componenets/GooglePayComponent';

const Stack = createNativeStackNavigator();


function SetiCheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async () => {

    // with iOS use pay tunnel but with Android fetch localhost
    const response = await fetch('https://bensnell-foo.tunnel.stripe.me/payment-sheet-setup-intent', {
      // const response = await fetch('http://10.0.2.2:200/payment-sheet-setup-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    let fetchResponse = await response.json();
    const { setupIntent, ephemeralKey, customer } = fetchResponse;

    return {
      setupIntent,
      ephemeralKey,
      customer,
    };

  };

  const initializePaymentSheet = async () => {

    const {
      setupIntent,
      ephemeralKey,
      customer,
    } = await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      setupIntentClientSecret: setupIntent,
      merchantDisplayName: 'test',
      // applePay: true,
      // googlePay: true,
      merchantCountryCode: 'US',
      // returnURL: 'https://www.example.com',
      // allowsDelayedPaymentMethods: false,
      // customFlow: true,
      // defaultBillingDetails: {
      //   address: {
      //     // city: 'seattle',
      //     country: 'DE',
      //     // line1: '123 abc',
      //     // postalCode: '98145',
      //     // state: 'WA',
      //   },
      // },
    });

    if (error) {
      console.log("error hit after fetching: ", error);
    }
    else {
      setLoading(true);
      await openPaymentSheet();
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
      setLoading(false);
    } else {
      Alert.alert(
        'Success',
        'Your order is confirmed!'
      );
      setLoading(false);
    }

  };

  return (

    <SafeAreaView>
      <Text>Test App with React Native</Text>
      <Button
        variant="primary"
        disabled={loading}
        title="Payment SetupIntent"
        onPress={initializePaymentSheet}
      />
    </SafeAreaView>
  );
}


function PaymentIntentCheckoutScreen() {

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  // with iOS use pay tunnel but with Android fetch localhost
  const fetchPaymentSheetParams = async () => {
    const response = await fetch('https://bensnell-foo.tunnel.stripe.me/payment-sheet-payment-intent', {
      // const response = await fetch('http://10.0.2.2:200/payment-sheet-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    let fetchResponse = await response.json();
    const { paymentIntent, ephemeralKey, customer } = fetchResponse;

    return {
      paymentIntent,
      ephemeralKey,
      customer,
    };
  };

  const initializePaymentSheet = async () => {
    const {
      paymentIntent,
      ephemeralKey,
      customer,
    } = await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      // applePay: true,
      // googlePay: true,
      merchantCountryCode: 'US',
      merchantDisplayName: "My merchant name",
      // defaultBillingDetails: {
      //   address: {
      //     email: 'foo@bar.com',
      //     // city: 'seattle',
      //     country: 'DE',
      //     // line1: '123 abc',
      //     // postalCode: '98145',
      //     // state: 'WA',
      //   },
      // }
      // returnURL: 'https://www.example.com',

    });
    if (error) {
      console.log("error: ", error);
    }
    else {
      setLoading(true);
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
        setLoading(false);
      } else {
        Alert.alert('Success', 'Your order is confirmed!');
        setLoading(false);
      }
    };
  };

  return (

    <SafeAreaView>
      <Button
        variant="primary"
        disabled={loading}
        title="Payment Sheet PaymentIntent"
        onPress={initializePaymentSheet}
      />
    </SafeAreaView>
  );
}



function CardFieldCardFormScreen() {

  const { confirmPayment, loading } = useConfirmPayment();

  // with iOS use pay tunnel but with Android fetch localhost
  const fetchPaymentIntentClientSecret = async () => {
    const response = await fetch('https://bensnell-foo.tunnel.stripe.me/create-payment-intent', {
      // const response = await fetch('http://10.0.2.2:200/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currency: 'usd',
      }),
    });
    const { clientSecret } = await response.json();
    return clientSecret;
  };

  const handlePayPress = async () => {
    let clientSecret = await fetchPaymentIntentClientSecret();

    // let { token } = await createToken({
    //   type: 'Card',
    // billingDetails: {
    //   email: 'sb@adg.com',
    //   address: {
    //     line1: 'test 123',
    //     postalCode: '12345'
    //   }
    // }
    // });

    // let paymentMethod = test.paymentMethod.id;
    // console.log(paymentMethod);
    // };
    // Fetch the intent client secret from the backend
    // const clientSecret = await fetchPaymentIntentClientSecret();
    // console.log("here");

    const { paymentIntent, error } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
      // paymentMethodData: {
      //   billingDetails,
      // },
    });

    if (error) {
      console.log('Payment confirmation error', error);
    } else if (paymentIntent) {
      Alert.alert('Success: ', paymentIntent);
    }


    // let result = await  handleNextAction(clientSecret);
    // console.log(result);


    // const {setupIntent, error} = await confirmSetupIntent(clientSecret, {
    //   type: 'Card',
    // billingDetails: {
    // addressLine1: '123 abc',
    // addressPostalCode: '12345'
    // address: {
    //   line1: '123 abc',
    //   postalCode: '12345'
    // },
    // addressPostalCode: '12233',
    // },
    // });
    //  console.log("here2");
    // let clientSecret = 'pi_3KnpIbBpF9kEgTSc1Zi5oq2j_secret_PN6C2uaHCAIPkUp6ezJ3jC06C';
    // const result = await confirmPayment(clientSecret, {
    //   type: 'Card',
    //   // billingDetails: {
    //   //   addressLine1: '123 abc',
    //   //   addressPostalCode: '12345'
    //   // }
    // });
    // console.log('after confirm', result);
    // if (error) {
    //   console.log('Payment confirmation error', error);
    // } else if (paymentIntent) {
    //   console.log('Success from promise', paymentIntent);
    // }
  };

  return (
    <SafeAreaView>
      <View>
        <CardField
          postalCodeEnabled={false}
          placeholder={{
            number: '4242 4242 4242 4242',
          }}
          onCardChange={(cardDetails) => {
            // console.log('card details', cardDetails);
            // setCard(cardDetails);
          }}
          cardStyle={{
            backgroundColor: '#FFFFFF',
            textColor: '#000000',
          }}
          style={{
            width: '100%',
            height: 50,
            marginVertical: 30,
          }}
        />
        <Button onPress={handlePayPress} title="Card Field Pay" disabled={loading} />
      </View>

      <Text>
        {'\n'}
      </Text>
      <View>
        {/* <CardForm
          postalCodeEnabled={false}
          onFormComplete={(cardDetails) => {
            console.log('card details', cardDetails);
            // setCard(cardDetails);
          }}
          style={{ height: 200 }}
        /> */}
        <Button onPress={handlePayPress} title="Pay with CardForm " disabled={loading} />
      </View>

    </SafeAreaView>
  );
};


function USBankAccountSetUpScreen() {
  const [name, setName] = useState('');
  const [lastingClientSecret, setLastingClientSecret] = useState('')

  const handleCollectBankAccountPress = async () => {

    // with iOS use pay tunnel but with Android fetch localhost
    const fetchIntentClientSecret = async () => {
      const response = await fetch('https://bensnell-foo.tunnel.stripe.me/create-setup-intent', {
      // const response = await fetch('http://10.0.2.2:200/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency: 'usd',
        }),
      });
      const { clientSecret } = await response.json();
      console.log(clientSecret);
      return clientSecret;
    };

    let clientSecret = await fetchIntentClientSecret();

    const { setupIntent, error } = await collectBankAccountForSetup(
      clientSecret,
      {
        paymentMethodType: 'USBankAccount',
        paymentMethodData: {
          billingDetails: {
            name: 'test',
          },
        },
      },
    );
    if (error) {
      console.log("ERROR: ", error);
    }
    else {
      console.log(setupIntent);
    }

    const result = await confirmSetupIntent(clientSecret, {
      paymentMethodType: 'USBankAccount',
    });
    console.log("final result: ", result);
  };

  return (
    <View>
      <TextInput
        placeholder="Name"
        onChange={(value) => setName(value.nativeEvent.text)}
      />
      <Button
        onPress={handleCollectBankAccountPress}
        title="Collect bank account"
      />
    </View>
  );
}


function App() {
  return (
    <StripeProvider
      publishableKey="pk_test_277UUuxUH8yrHRoavdqWsU4A"
      urlScheme="https://www.example.com" // required for 3D Secure and bank redirects
      merchantIdentifier="merchant.com.testshoes" // required for Apple Pay
    >
      <SetiCheckoutScreen />
      <PaymentIntentCheckoutScreen />
      <Text>
        {'\n'}
      </Text>
      <CardFieldCardFormScreen />
      <Text>
        {'\n'}
      </Text>
      <USBankAccountSetUpScreen />
      <GooglePayComponent />
    </StripeProvider>
  );
}

export default App



