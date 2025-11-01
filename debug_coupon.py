#!/usr/bin/env python3

# Debug script to test coupon calculation logic

def debug_coupon_calculation():
    # Test data from our test case
    item_price = 69.00
    item_quantity = 1
    discount_percentage = 0.10  # 10%
    discount_amount = 6.90
    order_total = 62.10  # Expected final total
    
    print("=== COUPON CALCULATION DEBUG ===")
    print(f"Original item price: ${item_price:.2f}")
    print(f"Item quantity: {item_quantity}")
    print(f"Discount percentage: {discount_percentage * 100}%")
    print(f"Discount amount: ${discount_amount:.2f}")
    print(f"Expected order total: ${order_total:.2f}")
    print()
    
    # Simulate the backend logic
    if discount_percentage > 0:
        # Apply percentage discount to each item
        adjusted_item_price = item_price * (1 - discount_percentage)
        print(f"Adjusted item price: ${adjusted_item_price:.2f}")
        
        # Calculate what PayPal will see
        paypal_item_total = adjusted_item_price * item_quantity
        print(f"PayPal item total: ${paypal_item_total:.2f}")
        print(f"PayPal order total: ${order_total:.2f}")
        
        if abs(paypal_item_total - order_total) < 0.01:
            print("✅ PayPal validation should PASS")
        else:
            print("❌ PayPal validation will FAIL")
            print(f"   Difference: ${abs(paypal_item_total - order_total):.2f}")
    
    print()
    print("=== EXPECTED PAYPAL PAYLOAD ===")
    print(f"Item price: ${adjusted_item_price:.2f}")
    print(f"Item quantity: {item_quantity}")
    print(f"Total: ${order_total:.2f}")
    print(f"Item subtotal: ${adjusted_item_price * item_quantity:.2f}")

if __name__ == "__main__":
    debug_coupon_calculation()