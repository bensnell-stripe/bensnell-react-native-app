import React, {useState, useEffect} from "react";
import {Button, View, ActivityIndicator, StyleSheet, Text} from 'react-native';

import {
    CardField,
    CardFieldInput,
    useConfirmSetupIntent,
    useStripe,
    BillingDetails,
    useGooglePay,
    GooglePayButton
  } from '@stripe/stripe-react-native';


function GooglePayComponent () {
const [isLoading, setLoading] = useState(false);
    

const { confirmSetupIntent, loading } = useConfirmSetupIntent();
const [card, setCard] = useState(CardFieldInput.Details | null);    
// const {confirmPayment, handleCardAction} = useStripe()

const getClientSecret = async () => {
    const response = await fetch('xyz',
    {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: "Bearer token"
        }
    });

    const { clientSecret, error } = await response.json();

    return { clientSecret, error };
  };

const submitCardInfo = async () => {

    setLoading(true);
    const clientSecret = await getClientSecret();

    // somehow this works to setup a payment method - assuming the clientSecret indicates the customer on the stripe side
    // not sure how the card details are getting there yet
    const billingDetails: BillingDetails = {
        email: 'david.bachor@mobilequbes.com',
    };

    const { setupIntent, error } = await confirmSetupIntent(clientSecret.clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
            billingDetails,
        }
    });

    if (error) {
        setLoading(false);
        alert(`Error code: ${error.code} ` + error.message);
    } else {
        setLoading(false);
        alert('Success - ' + setupIntent + ' Your payment method is successfully set up for future payments!');
    }
};

const {
    isGooglePaySupported,
    initGooglePay,
    createGooglePayPaymentMethod
} = useGooglePay();

useEffect( () => {

    async function CheckIsGooglePaySupported() {
        if (!(await isGooglePaySupported({ testEnv: true }))) {
            alert('Google Pay is not supported.');
        return;
        } else {
            alert('Google Pay is supported.');
            
        }
    
        const { error } = await initGooglePay({
            testEnv: true,
            merchantName: 'dfbMobileQubesStripeAccount',
            countryCode: 'US',
            billingAddressConfig: {
                format: 'FULL',
                isPhoneNumberRequired: true,
                isRequired: false,
            },
            existingPaymentMethodRequired: false,
            isEmailRequired: true,
        });
        
        if (error) {
            alert(error.code, error.message);
        return;
        }
    }

    CheckIsGooglePaySupported()

}, []);

const createPaymentMethod = async () => {
    const { error, paymentMethod } = await createGooglePayPaymentMethod({
      amount: 12,
      currencyCode: 'USD',
    });

    if (error) {
      Alert.alert(error.code, error.message);
      return;
    } else if (paymentMethod) {
      Alert.alert(
        'Success',
        `The payment method was created successfully. paymentMethodId: ${paymentMethod.id}`
      );
    }
  };

return(
    <View>
        <CardField
            postalCodeEnabled={true}
            placeholder={{
                number: '4242 4242 4242 4242',
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
            onCardChange={(cardDetails) => {
                setCard(cardDetails);
            }}
            onFocus={(focusedField) => {
                console.log('focusField', focusedField);
            }}
        />

        <Button
            title="Enter Card"
            onPress={submitCardInfo}>
        </Button>            
        
            
        <GooglePayButton
            type="standard"
            onPress={createPaymentMethod}
        />

        <Text>dfb</Text>

        { isLoading ? (
            <View style={styles.container} visible={loading}>
                <ActivityIndicator size="large" color="blue" />
                <Text style={styles.text}>Loading...</Text>
            </View>
        ) : null
        }
    </View>
)
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop:150
},
text : {
  marginTop : 10,
}
  
});

export default GooglePayComponent