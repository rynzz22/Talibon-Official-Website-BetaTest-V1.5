const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1_000_000;

export const paymentService = {
  createCheckoutSession: async (itemName: string, amount: number): Promise<void> => {
    if (!itemName || typeof itemName !== 'string' || itemName.trim().length === 0) {
      throw new Error("Invalid item name provided.");
    }

    if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      throw new Error(`Amount must be between ₱${MIN_AMOUNT} and ₱${MAX_AMOUNT.toLocaleString()}.`);
    }

    const sanitizedItemName = itemName.trim().slice(0, 200);

    const response = await fetch("/api/payments/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemName: sanitizedItemName,
        amount: Math.round(amount * 100) / 100,
      }),
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new Error("Unexpected server response. Please try again later.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? `Server error: ${response.status}`);
    }

    if (!data.url || typeof data.url !== 'string') {
      throw new Error("Payment gateway did not return a valid checkout URL.");
    }

    window.location.href = data.url;
  },
};
