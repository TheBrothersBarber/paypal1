const express = require('express');
const bodyParser = require('body-parser');
const paypal = require('paypal-rest-sdk');

const app = express();

// Configurar PayPal con las credenciales de la cuenta
paypal.configure({
  mode: 'sandbox', // Cambiar a 'live' para producción
  client_id: 'AXHMw4SqlX6UjwD17ZLMabZ-1iXrfhnEeE3oGJRn9vNw2eS1fmospWjXiyr24DIthmLsBgGrcho2Mpq_',
  client_secret: 'EDd_oJeNYps6McB0Cyz05P_K-juwJhtkNs4HrvET_k16__QbrJkGZvy443G8HJuAZltnBzLlSQT_waOz'
});

// Middleware para analizar el cuerpo de la solicitud
app.use(bodyParser.json());
app.use(express.static('public'));

// Ruta para crear el pago
app.post('/pay', (req, res) => {
  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: 'http://35.223.25.187:3000/success', //IP del servidor:3000
      cancel_url: 'http://35.223.25.187:3000/cancel' //IP del servidor:3000
    },
    transactions: [{
      item_list: {
        items: [{
          name: 'Compra una fabulosa piedra de mascota para evitar tu soledad',
          sku: '001',
          price: '100.00',  // Precio a 100 MXN
          currency: 'MXN',
          quantity: 1
        }]
      },
      amount: {
        currency: 'MXN',
        total: '100.00'  // Total 100 MXN
      },
      description: 'Compra una Piedra de mascota, para evitar tu soledad.'
    }]
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error al crear el pago');
    } else {
      for (let link of payment.links) {
        if (link.rel === 'approval_url') {
          res.redirect(link.href);
        }
      }
    }
  });
});