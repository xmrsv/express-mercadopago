import express from "express";
import cors from "cors";
import morgan from "morgan";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const PORT = 3000;
const TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

console.log(TOKEN);

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
						title: "popopipi",
						unit_price: 9999,
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

const app = express();
app.use(
	cors({
		origin: "*",
	})
);
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/checkout", async (req, res) => {
	const init_point = await enviar();

	res.send(init_point).status(200);
});

app.listen(PORT, () => {
	console.log("Server is running on port", PORT);
});
