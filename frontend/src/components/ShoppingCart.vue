<template>
  <transition
    name="slide"
    @after-enter="enableOutsideClick"
    @before-leave="disableOutsideClick"
  >
    <div class="cart" v-if="isCartVisible" ref="cart">
      <div class="cart-header">
        <button class="cartCloseButton" @click="closeCart">
          <img src="../assets/exit.svg" alt="" />
        </button>
        <h1>DIN KUNDKORG</h1>
      </div>
      <div v-if="cartItems.length === 0">
        Inga varor i din korg, Gå och shoppa! <a href="/shop">här</a>
      </div>
      <div class="items">
        <div v-for="item in cartItems" :key="item.id" class="item">
          <button
            @click="removeItem(item.product_id, item.size_id)"
            class="cartExitButton"
          >
            <img class="trashIcon" src="../assets/trashcan.svg" alt="" />
          </button>
          <img :src="item.image_url || '../assets/noImage.png'" alt="" />
          <div class="item-info">
            <div class="item-header">
              <p>{{ item.product_name }}</p>
              <div class="info">
                <p>( {{ item.size }} )</p>
                <p>{{ item.price }} kr/st</p>
              </div>
            </div>
            <div class="product-footer">
              <div class="buttons">
                <button
                  class="incrementDecrement"
                  @click.stop="
                    handleDecrementOrRemove(item.product_id, item.size_id)
                  "
                >
                  -
                </button>
                <p class="incrementDecrementText">{{ item.quantity }}</p>
                <button
                  class="incrementDecrement"
                  @click="incrementItemInCart(item.product_id, item.size_id)"
                >
                  +
                </button>
              </div>
              <p class="total-item">
                {{ (item.price * item.quantity).toFixed(2) }} kr
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="cart-summary">
        <h3>SUMMA: {{ totalPrice.toFixed(2) }} kr</h3>
        <button @click="handleCheckout">TILL KASSAN</button>
        <ul>
          <li><img :src="visa" alt="" /></li>
          <li><img :src="mastercard" alt="" /></li>
        </ul>
        <div>Priser och fraktavgift bekräftas inte förrän i kassan.</div>
      </div>
    </div>
  </transition>
</template>

<script>
import axiosInstance from "@/services/axiosConfig";
import visa from "../assets/payment/visa.svg";
import mastercard from "../assets/payment/mastercard.svg";
import { mapState, mapMutations } from "vuex";
import Swal from "sweetalert2";

export default {
  name: "ShoppingCart",
  data() {
    return {
      visa,
      mastercard,
    };
  },
  computed: {
    ...mapState(["isCartVisible"]),
    cartItems() {
      return this.$store.getters.cartItems;
    },
    totalPrice() {
      return this.$store.getters.cartTotalPrice;
    },
  },

  methods: {
    ...mapMutations({
      hideCart: "hideCart",
    }),
    closeCart() {
      this.disableOutsideClick();
      this.hideCart();
    },
    handleOutsideClick(event) {
      const cartElement = this.$refs.cart;
      if (!cartElement || !cartElement.contains(event.target)) {
        this.hideCart();
      }
    },
    enableOutsideClick() {
      document.addEventListener("click", this.handleOutsideClick);
    },
    disableOutsideClick() {
      document.removeEventListener("click", this.handleOutsideClick);
    },

    incrementItemInCart(productId, sizeId) {
      this.$store.commit("incrementItemInCart", { productId, sizeId });
    },
    decrementItem(productId, sizeId) {
      this.$store.commit("decrementItemInCart", { productId, sizeId });
    },
    removeItem(productId, sizeId) {
      this.$store.commit("removeFromCart", { productId, sizeId });
    },
    handleDecrementOrRemove(productId, sizeId) {
      const item = this.$store.state.cart.find(
        (item) => item.product_id === productId && item.size_id === sizeId
      );
      if (item.quantity === 1) {
        this.removeItem(productId, sizeId);
      } else {
        this.decrementItem(productId, sizeId);
      }
    },

    async handleCheckout() {
      if (!this.$store.state.isLoggedIn) {
        this.hideCart();
        this.$router.push({ path: "/login" });
        return;
      }

      this.disableOutsideClick();

      try {
        // Fetch stock quantities
        const { data: stockResponse } = await axiosInstance.get(
          "/update-stock"
        );
        const stockQuantities = stockResponse.items;
        // Validate cart items against stock
        const cart = this.$store.state.cart;
        const insufficientStock = cart.filter((cartItem) => {
          const stockItem = stockQuantities.find(
            (item) =>
              item.product_id === cartItem.product_id &&
              item.size_id === cartItem.size_id
          );
          return stockItem && cartItem.quantity > stockItem.available_quantity;
        });
        if (insufficientStock.length > 0) {
          insufficientStock.forEach((item) => {
            console.error(
              `Otillräcklig lagerstatus för ${item.product_name}, storlek ID: ${item.size}.`
            );
            Swal.fire(
              "OBS",
              `Otillräcklig lagerstatus för produkt: ${item.product_name}, storlek: ${item.size}.`,
              "error"
            );
          });
          return;
        }

        // Proceed to create checkout session
        const response = await axiosInstance.post("/create-checkout-session", {
          dummyItems: this.$store.state.cart.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            size_id: item.size_id,
          })),
          user_id: this.$store.state.userId,
        });

        // Redirect to the checkout URL
        const { url } = response.data;
        if (url) {
          window.location.href = url;
        } else {
          throw new Error("Checkout session URL not provided");
        }
      } catch (error) {
        if (error.response && error.response.status === 303) {
          const redirectUrl = error.response.data.url;
          window.location.href = redirectUrl;
        } else {
          console.error("Error during checkout:", error);
          Swal.fire(
            "Error",
            "Vi kunde inte hantera din order, försök senare igen"
          );
        }
      } finally {
        this.enableOutsideClick();
      }
    },
  },
};
</script>

<style scoped>
.cart {
  border-left: 1px solid black;
  display: flex;
  flex-direction: column;
  padding: 32px;
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 35%;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}
.cartCloseButton {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background-color: transparent;
  cursor: pointer;
}
.cart-header {
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.items {
  padding: 32px 0px;
  padding-right: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  height: 65%;
  overflow: scroll;
}
/* ---------------------------------------- */
/* Custom scrollbar styles */
div::-webkit-scrollbar {
  width: 8px; /* Width for the vertical scrollbar */
  height: 8px; /* Hide the horizontal scrollbar */
}

/* Hide the horizontal scrollbar specifically */
div::-webkit-scrollbar:horizontal {
  height: 8px; /* No horizontal scrollbar */
}

/* Vertical scrollbar thumb styling */
div::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 4px;
}

div::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}

/* Vertical scrollbar track styling */
div::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

div::-webkit-scrollbar:horizontal {
  height: 0px;
}

div::-webkit-scrollbar-track {
  background: #f1f1f1;
  margin-left: 20px; /* Adds padding-like effect to the left of the scrollbar */
}

/* ----------------------- */

.total-item {
  font-weight: 600;
}
.cart-summary {
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: 25%;
}
.cart-summary h3 {
  align-self: flex-end;
  margin-bottom: 16px;
}

.cart-summary button {
  width: 100%;
  padding: 8px 16px;
  font-family: "Playfair Display", serif !important;
  letter-spacing: 5%;
  font-weight: 600;
  background: black;
  color: white;
  border: 1px solid black;
  font-size: 18px;
  cursor: pointer;
}
.cart-summary button:hover {
  background: white;
  color: black;
}

.item {
  display: flex;
  height: 100px;
  width: 100%;
  gap: 16px;
}
.item img {
  width: 75px;
  height: 100%;
  object-fit: cover;
}
.info {
  display: flex;
  justify-content: space-between;
  font-weight: 400;
}
.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item-header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  flex-direction: column;
}
.item-header p {
  word-break: break-word;
}
.item-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: space-between;
}
.buttons {
  display: flex;
  height: 28px;
  width: 72px;
  align-items: center;
  border: 2px solid black;
}
.incrementDecrement {
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 20px;
  -o-object-fit: cover;
  object-fit: cover;
  align-content: center;
  border: none;
  cursor: pointer;
}
.incrementDecrementText {
  width: 24px;
  text-align: center;
  font-size: 18px;
}

h1 {
  font-family: "Playfair Display", serif !important;
  letter-spacing: 4%;
  font-weight: 600;
  font-size: 32px;
}
.trashIcon {
  height: 24px !important;
  width: 24px !important;
  object-fit: none !important;
  cursor: pointer;
}
.cartExitButton {
  all: unset;
  border: none;
  cursor: pointer;
}
ul {
  display: flex;
  gap: 16px;
  list-style: none;
}

.slide-enter-active,
.slide-leave-active {
  transition: width 0.3s ease-in-out, opacity 0.3s ease-in-out;
}
.slide-enter-from,
.slide-leave-to {
  width: 0;
  opacity: 0;
}
.slide-enter-to,
.slide-leave-from {
  width: 35%;
  opacity: 1;
}

@media (max-width: 1200px) {
  .cart {
    width: 45%;
  }
}

@media (max-width: 768px) {
  .cart {
    width: 100%;
  }
  div::-webkit-scrollbar {
    width: 4px; /* Width for the vertical scrollbar */
    height: 4px; /* Hide the horizontal scrollbar */
  }
}
@media (max-width: 350px) {
}
.items {
  padding-right: 5px;
}
.item img {
  width: 50px;
}
</style>
