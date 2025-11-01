# Payment Integration Guide - ApeBrain.cloud Shop

## 🛒 Payment System Options

### Option 1: PayPal Integration (Recommended - Easy Setup)

#### Why PayPal?
- ✅ Trusted globally
- ✅ Easy integration
- ✅ Buyer & seller protection
- ✅ No monthly fees (only transaction fees: ~2.9% + $0.30)
- ✅ Supports credit cards, debit cards, PayPal balance

---

## PayPal Setup Guide

### Step 1: Create PayPal Business Account

1. Go to: https://www.paypal.com/business
2. Click "Sign Up"
3. Choose "Business Account"
4. Complete verification (add bank account)

### Step 2: Get API Credentials

1. Login to PayPal
2. Go to: https://developer.paypal.com
3. Click "Dashboard"
4. Go to "My Apps & Credentials"
5. Under "REST API apps", click "Create App"
6. Name it "ApeBrain Shop"
7. Copy:
   - **Client ID** (for frontend)
   - **Secret** (for backend)

**Important:** 
- Use **Sandbox** for testing
- Switch to **Live** for production

### Step 3: Install PayPal SDK

#### Backend
```bash
cd /app/backend
pip install paypalrestsdk
pip freeze > requirements.txt
```

#### Frontend
```bash
cd /app/frontend
yarn add @paypal/react-paypal-js
```

### Step 4: Update Backend (.env)

Add to `/app/backend/.env`:
```env
PAYPAL_CLIENT_ID="your-client-id"
PAYPAL_CLIENT_SECRET="your-client-secret"
PAYPAL_MODE="sandbox"  # Change to "live" for production
```

### Step 5: Backend Code

I'll create the payment endpoints for you. Here's what we'll add:

**File: `/app/backend/server.py`**

Add these imports:
```python
import paypalrestsdk
```

Add after environment loading:
```python
# Configure PayPal
paypalrestsdk.configure({
    "mode": os.environ.get('PAYPAL_MODE', 'sandbox'),
    "client_id": os.environ.get('PAYPAL_CLIENT_ID'),
    "client_secret": os.environ.get('PAYPAL_CLIENT_SECRET')
})
```

Add these models:
```python
class OrderItem(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int

class CreateOrder(BaseModel):
    items: List[OrderItem]
    total: float
```

Add these endpoints:
```python
@api_router.post("/orders/create")
async def create_order(order: CreateOrder):
    try:
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {"payment_method": "paypal"},
            "redirect_urls": {
                "return_url": f"{os.environ.get('FRONTEND_URL')}/payment/success",
                "cancel_url": f"{os.environ.get('FRONTEND_URL')}/payment/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [
                        {
                            "name": item.name,
                            "sku": str(item.product_id),
                            "price": str(item.price),
                            "currency": "USD",
                            "quantity": item.quantity
                        } for item in order.items
                    ]
                },
                "amount": {
                    "total": str(order.total),
                    "currency": "USD"
                },
                "description": "ApeBrain.cloud Shop Purchase"
            }]
        })

        if payment.create():
            # Save order to database
            order_doc = {
                "id": str(uuid.uuid4()),
                "payment_id": payment.id,
                "items": [item.dict() for item in order.items],
                "total": order.total,
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.orders.insert_one(order_doc)
            
            # Get approval URL
            for link in payment.links:
                if link.rel == "approval_url":
                    return {"success": True, "approval_url": link.href, "order_id": order_doc["id"]}
        else:
            raise HTTPException(status_code=400, detail=payment.error)
    except Exception as e:
        logging.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create order")

@api_router.post("/orders/execute")
async def execute_payment(payment_id: str, payer_id: str):
    try:
        payment = paypalrestsdk.Payment.find(payment_id)
        
        if payment.execute({"payer_id": payer_id}):
            # Update order status
            await db.orders.update_one(
                {"payment_id": payment_id},
                {"$set": {"status": "completed", "payer_id": payer_id}}
            )
            return {"success": True, "message": "Payment completed successfully"}
        else:
            raise HTTPException(status_code=400, detail=payment.error)
    except Exception as e:
        logging.error(f"Error executing payment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to execute payment")
```

### Step 6: Frontend Integration

I'll update the ShopPage to include PayPal checkout. The implementation is ready - just need your PayPal credentials!

---

## Alternative: Stripe Integration

### Why Stripe?
- ✅ Modern, developer-friendly
- ✅ Better for subscriptions
- ✅ Lower fees in some regions
- ✅ More customization options

### Setup Steps:

1. **Create Account**: https://stripe.com
2. **Get API Keys**:
   - Dashboard → Developers → API keys
   - Copy "Publishable key" & "Secret key"

3. **Install**:
```bash
# Backend
pip install stripe

# Frontend
yarn add @stripe/stripe-js @stripe/react-stripe-js
```

4. **Similar integration** as PayPal (I can implement this if you prefer Stripe)

---

## Other Payment Options

### 1. Coinbase Commerce (Crypto Payments)
- Accept Bitcoin, Ethereum, etc.
- 1% fee
- Good for tech-savvy audience

### 2. Square
- Good for physical + digital products
- 2.9% + $0.30 per transaction
- US-focused

### 3. Paddle
- Best for digital products/SaaS
- Handles VAT/taxes automatically
- 5% + $0.50 per transaction

---

## Recommended Setup for ApeBrain.cloud

**For Physical Products (Mushroom supplements, kits):**
→ **PayPal** or **Stripe**

**For Digital Products (eBooks, courses):**
→ **Stripe** (better for digital delivery)
→ Or **Gumroad** (handles everything including delivery)

**For Mixed (Physical + Digital):**
→ **PayPal + Manual fulfillment** (simplest)
→ Or **Stripe + Integration** (more advanced)

---

## Implementation Priority

### Phase 1: Basic PayPal (Quick - 1-2 hours)
- Add PayPal buttons to product cards
- Redirect to PayPal for payment
- Manual order fulfillment

### Phase 2: Full Integration (2-3 days)
- Shopping cart system
- Order management dashboard
- Automated email confirmations
- Digital product delivery

### Phase 3: Advanced (1-2 weeks)
- Subscription products
- Inventory management
- Advanced analytics
- Customer accounts

---

## Which Should You Choose?

**Start with PayPal if:**
- ✅ You want quick setup
- ✅ Your customers know PayPal
- ✅ You're selling physical products
- ✅ You want buyer protection

**Choose Stripe if:**
- ✅ You want modern UI/UX
- ✅ You need subscriptions
- ✅ You're selling digital products
- ✅ You want more customization

---

## Next Steps

1. **Choose your payment provider** (PayPal recommended for start)
2. **Let me know**, and I'll implement the full integration
3. **Test in sandbox mode**
4. **Switch to live mode** when ready

**Want me to implement PayPal integration now?** Just provide:
- PayPal Sandbox Client ID
- PayPal Sandbox Secret

Or I can implement it with placeholders and you add credentials later!
