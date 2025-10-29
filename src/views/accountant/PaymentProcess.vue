<template>
  <AppLayout>
    <div class="payment-process">
      <!-- Étapes du paiement -->
      <div class="steps">
        <span :class="{ active: step >= 1 }">Order</span>
        <span :class="{ active: step >= 2 }">Shipping</span>
        <span :class="{ active: step >= 3 }">Payment</span>
        <span :class="{ active: step >= 4 }">Review</span>
      </div>

      <div class="content">
        <!-- Liste des articles -->
        <div class="items">
          <h3>Items ({{ items.length }} items)</h3>
          <button class="remove-all">Remove all</button>

          <div class="item" v-for="item in items" :key="item.id">
            <img :src="item.image" alt="product" class="thumb" />
            <div class="details">
              <p class="title">{{ item.name }}</p>
              <p class="desc">{{ item.details }}</p>
              <div class="qty">
                <button @click="decreaseQty(item)">-</button>
                <span>{{ item.quantity }}</span>
                <button @click="increaseQty(item)">+</button>
              </div>
            </div>
            <p class="price">${{ item.price }}</p>
            <button class="remove">x</button>
          </div>

          <!-- Résumé de la commande -->
          <div class="summary">
            <h4>Order summary</h4>
            <p>Subtotal: ${{ subtotal }}</p>
            <p>Discount: -${{ discount }}</p>
            <p>Shipping: FREE</p>
            <h3>Total Price: ${{ total }}</h3>
          </div>
        </div>

        <!-- Section paiement -->
        <div class="checkout">
          <h3>Checkout</h3>
          <div class="cards">
            <img src="/visa.png" alt="Visa" />
            <img src="/mastercard.png" alt="MasterCard" />
            <img src="/paypal.png" alt="PayPal" />
          </div>

          <form class="payment-form">
            <input type="text" placeholder="Cardholder name" />
            <input type="text" placeholder="Card number" />
            <div class="inline">
              <input type="text" placeholder="Expiration date" />
              <input type="text" placeholder="CVC" />
            </div>
            <button class="pay-btn">Pay now</button>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import { ref, computed } from 'vue'

const step = ref(3)

const items = ref([
  {
    id: 1,
    name: 'Basic',
    details: 'Unisex clothes\nColor: White\nSize: S',
    quantity: 1,
    price: 100,
    image: 'https://via.placeholder.com/60x60',
  },
  {
    id: 2,
    name: 'Basic',
    details: 'Unisex clothes\nColor: Black\nSize: S',
    quantity: 1,
    price: 100,
    image: 'https://via.placeholder.com/60x60',
  },
])

const discount = 30

const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0))
const total = computed(() => subtotal.value - discount)

function increaseQty(item) {
  item.quantity++
}

function decreaseQty(item) {
  if (item.quantity > 1) item.quantity--
}
</script>

<style scoped>
.payment-process {
  padding: 32px;
  background: #f5f7fa;
}

.steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  font-weight: bold;
  color: #ccc;
}

.steps span.active {
  color: #002580;
  border-bottom: 2px solid #002580;
}

.content {
  display: flex;
  gap: 40px;
}

.items {
  flex: 2;
}

.item {
  display: flex;
  align-items: center;
  background: white;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 8px;
  gap: 16px;
}

.thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.details {
  flex: 1;
}

.title {
  font-weight: bold;
}

.qty button {
  padding: 2px 8px;
  margin: 0 4px;
}

.price {
  font-weight: bold;
}

.remove {
  background: none;
  border: none;
  color: red;
  font-weight: bold;
}

.remove-all {
  float: right;
  background: none;
  border: none;
  color: red;
  font-weight: bold;
  margin-top: -24px;
}

.summary {
  margin-top: 24px;
  background: white;
  padding: 16px;
  border-radius: 8px;
}

.checkout {
  flex: 1;
  background: white;
  padding: 24px;
  border-radius: 8px;
}

.cards img {
  width: 60px;
  margin-right: 10px;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.inline {
  display: flex;
  gap: 10px;
}

.pay-btn {
  background: linear-gradient(to right, #7f5af0, #8b5cf6);
  color: white;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
</style>
