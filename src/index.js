import express from "express";
import cors from "cors";
import morgan from "morgan";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const PORT = 3000;
const TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

console.log(TOKEN);

const app = express();
app.use(
	cors({
		origin: "*",
	})
);
app.use(morgan("dev"));
app.use(express.json());

const mercadopago = new MercadoPagoConfig({
	accessToken: TOKEN,
});

async function enviar() {
	try {
		const preference = await new Preference(mercadopago).create({
			body: {
				items: [
					{
						id: "queso",
						title: "iPhone 16 Pro Max",
						unit_price: 7099,
						quantity: 1,
					},
				],
				metadata: {
					id: "queso",
				},
			},
		});
		console.log(preference);
		return preference.init_point;
	} catch (error) {
		console.warn(error);
		return error;
	}
}

async function findPaymentById(paymentId) {
	try {
		const payment = await new Payment(mercadopago).get({ id: paymentId });
		console.log(payment);
		return payment.status;
	} catch (error) {
		console.info(error);
		return null;
	}
}

async function isValidPayment(paymentId) {
	const paymentStatus = await findPaymentById(paymentId);
	if (paymentStatus === "approved") {
		return true;
	}
	return false;
}

async function processPayment(paymentId) {
	const isValid = await isValidPayment(paymentId);
	if (isValid) {
		console.log("Payment is valid");
	} else {
		console.log("Payment is not valid");
	}
}

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/api/payment/init", async (req, res) => {
	const init_point = await enviar();
	res.send(init_point).status(200);
});

app.post("/api/payment/webhook", async (req, res) => {
	const { data } = req.body;
	console.log(data);
	res.send({}).status(200);
});

app.listen(PORT, () => {
	console.log("Server is running on port", PORT);
});
