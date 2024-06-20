import { Request, Response } from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: '2024-04-10',
});

interface Product {
    name: string;
    price: number;
}

interface Token {
    email: string;
    card: {
        name: string;
        address_line1: string;
        address_city: string;
        address_country: string;
        address_zip: string;
    };
}

export const Payment = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { product, token }: { product: Product; token: Token } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: product.price,
            currency: 'inr',
            receipt_email: token.email,
            description: `Purchased the ${product.name}`,
            automatic_payment_methods: {
                enabled: true,
            },
            // shipping: {
            //     name: token.card.name,
            //     address: {
            //         line1: token.card.address_line1,
            //         city: token.card.address_city,
            //         country: token.card.address_country,
            //         postal_code: token.card.address_zip,
            //     },
            // },
        });

        return res.status(200).send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.log(error);
        return res.status(400).send({ message: 'Payment failed.' });
    }
};