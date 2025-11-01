#!/usr/bin/env python3

import requests
import json

def test_paypal_request():
    """Test the exact PayPal request that's failing"""
    
    # Test data matching our test case
    order_data = {
        "items": [
            {
                "product_id": "test-coupon-789",
                "name": "Test Product with Fixed Coupon",
                "quantity": 1,
                "price": 69.00,
                "product_type": "physical"
            }
        ],
        "total": 62.10,  # 69.00 - 10% = 62.10
        "customer_email": "coupon-test@example.com",
        "coupon_code": "WELCOME10"
    }
    
    print("=== TESTING PAYPAL ORDER CREATION WITH COUPON ===")
    print(f"Request data:")
    print(json.dumps(order_data, indent=2))
    print()
    
    # Make the request
    response = requests.post(
        'https://mushroom-blog.preview.emergentagent.com/api/shop/create-order',
        json=order_data,
        headers={'Content-Type': 'application/json'},
        timeout=60
    )
    
    print(f"Response status: {response.status_code}")
    print(f"Response body:")
    try:
        response_data = response.json()
        print(json.dumps(response_data, indent=2))
    except:
        print(response.text)
    
    # Let's also test the coupon validation separately
    print("\n=== TESTING COUPON VALIDATION ===")
    validate_data = {
        "code": "WELCOME10",
        "order_total": 69.00
    }
    
    validate_response = requests.post(
        'https://mushroom-blog.preview.emergentagent.com/api/coupons/validate',
        json=validate_data,
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"Validation status: {validate_response.status_code}")
    print(f"Validation response:")
    try:
        validation_data = validate_response.json()
        print(json.dumps(validation_data, indent=2))
    except:
        print(validate_response.text)

if __name__ == "__main__":
    test_paypal_request()